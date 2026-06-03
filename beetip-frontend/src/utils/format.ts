const integerFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
})

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatRupiah(value: number) {
  return `Rp ${integerFormatter.format(Math.round(value))}`
}

export function parseRupiahInput(value: string) {
  const digits = value.replace(/\D/g, '')

  if (!digits) {
    return null
  }

  return Number(digits)
}

export function formatRupiahInput(value: string) {
  const parsedValue = parseRupiahInput(value)

  return parsedValue === null ? '' : formatRupiah(parsedValue)
}

export function formatDateTime(value: string | Date) {
  return dateTimeFormatter.format(new Date(value))
}
