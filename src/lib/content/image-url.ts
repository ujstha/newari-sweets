import { publicEnv } from "@/lib/env";

// Pure/client-safe by design -- deliberately kept out of public-catalog.ts
// (which imports the server-only Supabase client) so Client Components like
// the cart page can use this without pulling server code into the browser
// bundle.
export function getPublicImageUrl(storagePath: string): string {
  return `${publicEnv.supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`;
}
