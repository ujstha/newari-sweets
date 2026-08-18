-- Build-order Phase 5/9: homepage Best Sellers section.
-- orders/order_items have no public SELECT policy (see
-- 20260818224420_cart_checkout_orders.sql's default-deny), so the public
-- homepage can't join them directly. This is a narrow, audited read-path
-- exception -- same shape as get_order_status() -- exposing only an
-- aggregate (product_id, quantity sold) over completed orders in a
-- trailing window, never any customer/order-level data.
create function get_best_selling_products(p_days integer default 90, p_limit integer default 6)
returns table (product_id uuid, total_quantity numeric)
language sql
security definer
set search_path = public
stable
as $$
  select oi.product_id, sum(oi.quantity) as total_quantity
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.status = 'completed'
    and o.created_at > now() - (p_days || ' days')::interval
    and oi.product_id is not null
  group by oi.product_id
  order by total_quantity desc
  limit p_limit;
$$;

grant execute on function get_best_selling_products to anon, authenticated;
