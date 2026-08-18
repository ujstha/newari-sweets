export interface CartItemOption {
  valueId: string; // needed so the server can re-fetch and re-price -- see checkout actions.ts
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
  minPrepDays: number | null; // for the checkout date picker's client-side floor -- see lead-time.ts
  quantity: number;
  unitPriceCents: number; // base + selected option deltas -- DISPLAY ONLY, never trusted at checkout (server re-prices from productId/valueIds)
  selectedOptions: CartItemOption[];
  customNote: string;
  cakeMessage: string;
}
