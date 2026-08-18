-- Build-order Phase 7: Admin order review workflow.
-- Defense-in-depth for the order status state machine -- the primary guard
-- is src/lib/domain/order-workflow.ts's canTransition(), checked by every
-- Server Action before an update; this trigger makes an illegal transition
-- impossible even via a bug or direct DB access. See PLAN.md's "Order
-- Review / Approval Workflow" section -- keep this in sync with
-- order-workflow.ts's ALLOWED_TRANSITIONS if that ever changes.
create function enforce_order_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if not (
    (old.status = 'pending_review' and new.status in ('approved', 'declined')) or
    (old.status = 'approved' and new.status in ('ready', 'cancelled')) or
    (old.status = 'ready' and new.status = 'completed')
  ) then
    raise exception 'Illegal order status transition: % -> %', old.status, new.status;
  end if;

  return new;
end;
$$;

create trigger enforce_order_status_transition
  before update on orders
  for each row execute function enforce_order_status_transition();
