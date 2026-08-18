"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  addProductImage,
  deleteProductImage,
} from "@/app/[locale]/admin/(protected)/products/actions";
import type { ProductImageRow } from "@/lib/content/products";

// Uploads directly to Supabase Storage from the browser (authorized via the
// admin's session + the product-images bucket's storage RLS policies, see
// PLAN.md's Deployment/RLS sections), then records the metadata row via a
// Server Action. No server round-trip for the file bytes themselves.
export function ImageUploader({
  productId,
  images,
}: {
  productId: string;
  images: ProductImageRow[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(images.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !altText.trim()) {
      setError("Choose a file and enter alt text first.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const supabase = createClient();
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${productId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);
        if (uploadError) throw uploadError;

        await addProductImage(productId, path, altText.trim(), isPrimary);
        setFile(null);
        setAltText("");
        setIsPrimary(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });
  }

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-3 gap-2">
        {images.map((image) => (
          <li key={image.id} className="space-y-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- next/image's optimizer isn't
                available on Cloudflare (images.unoptimized = true, see PLAN.md's Deployment
                section), so next/image would add bundle weight for no benefit here. */}
            <img
              src={
                createClient().storage.from("product-images").getPublicUrl(image.storage_path).data
                  .publicUrl
              }
              alt={image.alt_text}
              className="aspect-square w-full rounded border object-cover"
            />
            <p className="truncate text-xs text-gray-500">
              {image.alt_text}
              {image.is_primary ? " (primary)" : ""}
            </p>
            <button
              type="button"
              onClick={() => deleteProductImage(productId, image.id, image.storage_path)}
              className="text-xs text-red-600 underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleUpload} className="space-y-2 rounded border p-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <input
          type="text"
          placeholder="Alt text (required)"
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          className="w-full rounded border px-2 py-1 text-sm"
        />
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
          />
          Primary (listing thumbnail)
        </label>
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-black px-3 py-1 text-xs text-white disabled:opacity-50"
        >
          {isPending ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
}
