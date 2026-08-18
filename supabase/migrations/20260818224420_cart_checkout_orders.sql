-- Build-order Phase 6: Cart + checkout + order creation.
-- See PLAN.md's "Orders" data model section and "Order creation -- the one
-- scoped write-path exception" in RLS & Security.

create sequence order_number_seq;

create table orders (
  -- The UUID itself doubles as the unguessable status-link capability
  -- token for /orders/[id] -- see PLAN.md's Order status page note.
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'NS-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_number_seq')::text, 4, '0')
  ),
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'declined', 'ready', 'completed', 'cancelled')),
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  fulfillment_type text not null check (fulfillment_type in ('pickup', 'delivery')),
  delivery_address text,
  delivery_city text,
  delivery_notes text,
  requested_date date not null,
  customer_note text,
  terms_accepted_at timestamptz not null,
  reviewed_at timestamptz,
  reviewed_by uuid references admin_users (user_id),
  decision_reason text,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'pending', 'paid', 'refunded', 'failed')),
  payment_method text not null default 'cash_on_pickup'
    check (payment_method in ('cash_on_pickup', 'cash_on_delivery', 'mobile_pay_manual', 'online_card', 'online_paytrail')),
  payment_reference text,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Delivery fields are required precisely when fulfillment_type = 'delivery'
  -- -- see PLAN.md's Storefront checkout row.
  constraint delivery_fields_required check (
    fulfillment_type = 'pickup' or (delivery_address is not null and delivery_city is not null)
  )
);

create trigger set_updated_at before update on orders
  for each row execute function set_updated_at();

create table order_dietary_requests (
  order_id uuid not null references orders (id) on delete cascade,
  allergen_id uuid not null references allergens (id),
  primary key (order_id, allergen_id)
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name_snapshot text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  unit_label_snapshot text not null,
  quantity numeric not null check (quantity > 0),
  custom_note text,
  cake_message text,
  allergen_snapshot text[] not null default '{}',
  line_total_cents integer not null check (line_total_cents >= 0)
);

create table order_item_options (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references order_items (id) on delete cascade,
  option_group_name_snapshot text not null,
  option_value_label_snapshot text not null,
  price_delta_cents_snapshot integer not null
);

-- ── RLS: no public policies at all (default-deny) -- see PLAN.md's ────────
-- "Order creation" note. Guest checkout writes go through create_order()
-- below, never direct table grants.
alter table orders enable row level security;
alter table order_dietary_requests enable row level security;
alter table order_items enable row level security;
alter table order_item_options enable row level security;

create policy "admins read orders" on orders for select using (is_admin());
create policy "admins update orders" on orders for update using (is_admin()) with check (is_admin());
create policy "admins read order_dietary_requests" on order_dietary_requests for select using (is_admin());
create policy "admins update order_dietary_requests" on order_dietary_requests for update using (is_admin()) with check (is_admin());
create policy "admins read order_items" on order_items for select using (is_admin());
create policy "admins update order_items" on order_items for update using (is_admin()) with check (is_admin());
create policy "admins read order_item_options" on order_item_options for select using (is_admin());
create policy "admins update order_item_options" on order_item_options for update using (is_admin()) with check (is_admin());

revoke insert, update, delete on orders, order_items, order_item_options, order_dietary_requests
  from anon, authenticated;
-- Admin UPDATE is re-granted via the RLS policies above (RLS filters rows,
-- the GRANT is what allows the operation at all -- both layers needed).
-- See PLAN.md's RLS table: these 4 tables get "full SELECT/UPDATE" for
-- admin (order_item_options/order_dietary_requests are immutable snapshots
-- in practice, but granted for consistency with that spec).
grant update on orders, order_items, order_item_options, order_dietary_requests to authenticated;

-- ── create_order: the one scoped write-path exception ──────────────────
-- Takes ALREADY-COMPUTED prices/allergen snapshots (the Server Action
-- calling this recomputes them server-side from live catalog data via
-- src/lib/domain/pricing.ts and ingredients.ts -- the same tested domain
-- functions used everywhere else, rather than a second SQL implementation
-- of the same math). This function's job is purely atomicity and being the
-- only permitted write path, not re-deriving the numbers -- see PLAN.md's
-- "Order creation" note for why this is a narrow, audited exception.
create function create_order(
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
  item jsonb;
  opt jsonb;
  new_item_id uuid;
  allergen_id uuid;
begin
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

grant execute on function create_order to anon, authenticated;

-- ── get_order_status: the customer-facing status-link read path ────────
-- The order's UUID is the access control (unguessable, not enumerable) --
-- see PLAN.md's "Order status page" note. Returns only customer-safe
-- fields (no admin_notes, no other customers' data reachable).
create function get_order_status(p_order_id uuid)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'requested_date', o.requested_date,
    'fulfillment_type', o.fulfillment_type,
    'decision_reason', o.decision_reason,
    'subtotal_cents', o.subtotal_cents,
    'total_cents', o.total_cents,
    'created_at', o.created_at,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'product_name_snapshot', oi.product_name_snapshot,
        'quantity', oi.quantity,
        'unit_label_snapshot', oi.unit_label_snapshot,
        'line_total_cents', oi.line_total_cents,
        'custom_note', oi.custom_note,
        'cake_message', oi.cake_message,
        'options', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'option_group_name_snapshot', oio.option_group_name_snapshot,
            'option_value_label_snapshot', oio.option_value_label_snapshot
          )), '[]'::jsonb)
          from order_item_options oio
          where oio.order_item_id = oi.id
        )
      )), '[]'::jsonb)
      from order_items oi
      where oi.order_id = o.id
    )
  )
  from orders o
  where o.id = p_order_id;
$$;

grant execute on function get_order_status to anon, authenticated;
