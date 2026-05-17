export function formatCurrency(amount: number, currency: string): string {
  try {
    const fmt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: amount % 1 === 0 ? 0 : undefined,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    })
    return fmt.format(amount)
  }
  catch {
    const fmt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
      maximumFractionDigits: amount % 1 === 0 ? 0 : undefined,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    })
    return fmt.format(amount)
  }
}
