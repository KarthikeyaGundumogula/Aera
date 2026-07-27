import imageCompression from "browser-image-compression";

/**
 * High-Fidelity Client-Side Image Compressor (Twitter/Instagram Standards)
 *
 * Downscales 15MB+ camera/design exports into 2K JPEGs (~350KB-700KB)
 * using Web Workers, preserving crisp typography, color space, and fine grain.
 *
 * Config:
 *   - maxWidthOrHeight: 2048px (2K cinema resolution)
 *   - useWebWorker: true (offloads Canvas math from main UI thread)
 *   - fileType: 'image/jpeg' (universal browser rendering)
 *   - initialQuality: 0.85 (sweet spot quantization matrix)
 *   - preserveExif: false (strips private camera/GPS data, saves 10-50KB)
 */
export async function compressImageHighFidelity(file: File): Promise<File> {
  // If already tiny (< 200KB) or SVG, skip heavy compression
  if (file.size < 200 * 1024 || file.type === "image/svg+xml") {
    return file;
  }

  const options = {
    maxWidthOrHeight: 2048,
    useWebWorker: true,
    fileType: "image/jpeg",
    initialQuality: 0.85,
    preserveExif: false,
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `[ImageCompressor] ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
        compressedFile.size / 1024
      ).toFixed(0)}KB`
    );
    return compressedFile;
  } catch (error) {
    console.warn("[ImageCompressor] Compression failed, using original:", error);
    return file;
  }
}
