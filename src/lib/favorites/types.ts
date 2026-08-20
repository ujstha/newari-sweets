// A lightweight display snapshot, not a live product reference -- enough to
// render a card on /favorites without a server fetch (same reasoning as
// CartItem's snapshot in ../cart/types.ts). If the real product's price
// changes later, this can go stale; acceptable for a save-for-later list
// that isn't transactional (checkout always re-fetches/re-prices for real).
export interface FavoriteItem {
  productId: string;
  slug: string;
  name: string;
  imagePath: string | null;
  priceCents: number;
  unitCode: string;
}
