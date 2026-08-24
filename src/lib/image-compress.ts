// Downscales + re-encodes an image client-side before it's uploaded to
// Supabase Storage -- a raw phone-camera photo is often 2-8MB; this brings
// it down to roughly 150-400KB. Runs entirely in the browser via
// createImageBitmap + canvas, no server cost, no new dependency. Falls
// back to the original file untouched on any failure (e.g. a format the
// browser can't decode, like HEIC outside Safari) rather than blocking
// the upload -- a slightly larger file beats a broken one.

// Hard cap enforced by the caller (see ImageUploader) before this even
// runs -- protects against createImageBitmap hanging on something
// absurdly large (a RAW export, a misselected video/PDF).
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// Below this, a file is already small/efficiently encoded enough that a
// decode+re-encode round trip wins nothing -- skip the work entirely
// rather than doing it and throwing the result away.
export const SKIP_COMPRESSION_BELOW_BYTES = 200 * 1024;

export async function compressImage(
  file: File,
  { maxDimension = 1600, quality = 0.82 }: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  if (file.size <= SKIP_COMPRESSION_BELOW_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob || blob.size >= file.size) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
