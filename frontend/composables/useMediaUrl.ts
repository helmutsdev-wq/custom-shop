export function useMediaUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null

  if (imageUrl.startsWith('http://')) {
    return imageUrl.replace('http://', 'https://')
  }

  return imageUrl
}