const assetModules = import.meta.glob<string>('/src/assets/*', {
  eager: true,
  import: 'default',
});

/**
 * Resolves a product image URL.
 * Supports Cloudinary / HTTP URLs, local /src/assets/ paths, asset filenames,
 * and falls back to category default image.
 */
export function getProductImageUrl(
  imageUrl: string | null | undefined,
  fallbackImage?: string
): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return fallbackImage || '';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Normalize local path (e.g. "/src/assets/Brownie.jpeg", "assets/Brownie.jpeg", or "Brownie.jpeg")
  let targetPath = imageUrl.trim();

  if (!targetPath.startsWith('/src/assets/')) {
    targetPath = targetPath.replace(/^@\/assets\//, '').replace(/^assets\//, '').replace(/^\//, '');
    targetPath = `/src/assets/${targetPath}`;
  }

  // Exact match
  if (assetModules[targetPath]) {
    return assetModules[targetPath];
  }

  // Case-insensitive match
  const lowerTarget = targetPath.toLowerCase();
  for (const key in assetModules) {
    if (key.toLowerCase() === lowerTarget) {
      return assetModules[key];
    }
  }

  return fallbackImage || imageUrl;
}
