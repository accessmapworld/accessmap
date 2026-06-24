/**
 * Fetch a thumbnail image from Wikipedia for a place by name.
 * Uses the free REST summary API — no API key required.
 * Returns undefined if no article / thumbnail found.
 */
export async function fetchWikiImage(name: string): Promise<string | undefined> {
  // Clean name: strip things like "McDonald's #1234" → "McDonald's"
  const cleaned = name.replace(/\s*[#\-–]\s*\d+\s*$/, '').trim()
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleaned)}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) return undefined
    const data = await res.json()
    // Prefer originalimage for higher quality, fall back to thumbnail
    return (data?.originalimage?.source || data?.thumbnail?.source) as string | undefined
  } catch {
    return undefined
  }
}

/**
 * Batch-fetch Wikipedia images for a list of place names.
 * Runs up to `concurrency` lookups at a time.
 * Returns a Map<name, imageUrl>.
 */
export async function batchWikiImages(
  names: string[],
  concurrency = 4,
): Promise<Map<string, string>> {
  const result = new Map<string, string>()
  const queue = [...names]

  async function worker() {
    while (queue.length > 0) {
      const name = queue.shift()!
      const url = await fetchWikiImage(name)
      if (url) result.set(name, url)
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker))
  return result
}
