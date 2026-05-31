export type ParsedOrderDescription = {
  origin: string | null
  request: string
  title: string
}

export function parseOrderDescription(
  itemDescription: string,
): ParsedOrderDescription {
  const fallback = itemDescription.trim() || 'Order request'
  const match = fallback.match(/From:\s*([\s\S]*?)\s*Description:\s*([\s\S]*)/i)

  if (!match) {
    return {
      origin: null,
      request: fallback,
      title: fallback,
    }
  }

  const origin = match[1].trim()
  const request = match[2].trim() || fallback

  return {
    origin: origin || null,
    request,
    title: origin || request,
  }
}

export function getNameFromEmail(email: string | null | undefined) {
  const [name] = (email ?? '').split('@')

  return name.trim() || 'Unknown'
}
