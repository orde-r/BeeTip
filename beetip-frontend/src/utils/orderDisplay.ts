export function getNameFromEmail(email: string | null | undefined) {
  const [name] = (email ?? '').split('@')

  return name.trim() || 'Unknown'
}
