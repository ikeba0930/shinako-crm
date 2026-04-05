export function formatDate(value?: Date | string | null) {
  if (!value) return "-"
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return date.toLocaleDateString("ja-JP")
}

export function formatDateInput(value?: Date | string | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, "0")
  const d = `${date.getDate()}`.padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatDateTimeInput(value?: Date | string | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

export function formatCurrency(value?: number | null) {
  if (!value && value !== 0) return "-"
  return `¥${value.toLocaleString("ja-JP")}`
}

export function formatManYen(value?: number | null) {
  if (!value && value !== 0) return "-"
  return `${value}万円`
}

export function formatPercent(value?: number | null) {
  if (!value && value !== 0) return "-"
  return `${value.toFixed(1)}%`
}
