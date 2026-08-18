export interface CartItemOption {
  groupName: string;
  valueLabel: string;
  priceDeltaCents: number;
}

export interface CartItem {
  id: string; // client-generated line id, not a DB id
  productId: string;
  productSlug: string;
  name: string;
  imagePath: string | null;
  unitLabel: string;
  quantity: number;
  unitPriceCents: number; // base + selected option deltas, per PLAN.md's pricing.ts contract
  selectedOptions: CartItemOption[];
  customNote: string;
  cakeMessage: string;
}
