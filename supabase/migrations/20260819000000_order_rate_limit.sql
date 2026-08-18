-- Build-order Phase 9: basic rate-limiting on order creation.
-- Guest checkout has no auth to key off of, so we key off customer_phone
-- (required on every order) and reject when the same phone number has
-- placed too many orders in a short trailing window. Enforced inside
-- create_order() itself -- the only write path for orders (see
-- 20260818224420_cart_checkout_orders.sql) -- so it can't be bypassed by
-- calling the RPC directly, and stays atomic with the insert it's guarding.
create or replace function create_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_fulfillment_type text,
  p_delivery_address text,
  p_delivery_city text,
  p_delivery_notes text,
  p_requested_date date,
  p_customer_note text,
  p_dietary_allergen_ids uuid[],
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_order_id uuid;
  v_subtotal integer;
  v_recent_count integer;
  item jsonb;
  opt jsonb;
  new_item_id uuid;
  allergen_id uuid;
begin
  select count(*) into v_recent_count
    from orders
    where customer_phone = p_customer_phone
      and created_at > now() - interval '60 minutes';

  if v_recent_count >= 5 then
    raise exception 'Too many orders submitted recently. Please wait a while before ordering again, or contact us directly.';
  end if;

  select coalesce(sum((i ->> 'line_total_cents')::integer), 0)
    into v_subtotal
    from jsonb_array_elements(p_items) i;

  insert into orders (
    customer_name, customer_phone, customer_email, fulfillment_type,
    delivery_address, delivery_city, delivery_notes, requested_date,
    customer_note, terms_accepted_at, subtotal_cents, total_cents
  ) values (
    p_customer_name, p_customer_phone, nullif(p_customer_email, ''), p_fulfillment_type,
    p_delivery_address, p_delivery_city, p_delivery_notes, p_requested_date,
    nullif(p_customer_note, ''), now(), v_subtotal, v_subtotal
  )
  returning id into new_order_id;

  foreach allergen_id in array p_dietary_allergen_ids loop
    insert into order_dietary_requests (order_id, allergen_id) values (new_order_id, allergen_id);
  end loop;

  for item in select * from jsonb_array_elements(p_items) loop
    insert into order_items (
      order_id, product_id, product_name_snapshot, unit_price_cents,
      unit_label_snapshot, quantity, custom_note, cake_message,
      allergen_snapshot, line_total_cents
    ) values (
      new_order_id,
      (item ->> 'product_id')::uuid,
      item ->> 'product_name_snapshot',
      (item ->> 'unit_price_cents')::integer,
      item ->> 'unit_label_snapshot',
      (item ->> 'quantity')::numeric,
      nullif(item ->> 'custom_note', ''),
      nullif(item ->> 'cake_message', ''),
      (select coalesce(array_agg(x), '{}') from jsonb_array_elements_text(item -> 'allergen_snapshot') x),
      (item ->> 'line_total_cents')::integer
    )
    returning id into new_item_id;

    for opt in select * from jsonb_array_elements(coalesce(item -> 'options', '[]'::jsonb)) loop
      insert into order_item_options (
        order_item_id, option_group_name_snapshot, option_value_label_snapshot, price_delta_cents_snapshot
      ) values (
        new_item_id,
        opt ->> 'option_group_name_snapshot',
        opt ->> 'option_value_label_snapshot',
        (opt ->> 'price_delta_cents_snapshot')::integer
      );
    end loop;
  end loop;

  return new_order_id;
end;
$$;
