export function format(bytes: number, decimals: number = 2): string {
  if (typeof bytes !== 'number' || !isFinite(bytes)) {
    return ''
  }
  if (bytes < 0) {
    return '-' + format(-bytes, decimals)
  }
  if (bytes === 0) {
    return '0 Bytes'
  }
  const k = 1000
  const dm = decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  // Less than 1 byte stays in bytes, and more than 1000 YB in YB
  let i = Math.min(Math.max(Math.floor(Math.log(bytes) / Math.log(k)), 0), sizes.length - 1)
  let value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
  // Rounding can reach the next unit, such as 999999 to 1000 KB
  if (value >= k && i < sizes.length - 1) {
    i += 1
    value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
  }
  return value + ' ' + sizes[i]
}
