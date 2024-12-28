export function AsNumber(value: number | string) {
  return typeof value === 'string'
    ? value.includes('.')
      ? parseFloat(value)
      : parseInt(value)
    : value;
}
