export function cn(...classes: (string | undefined | null | boolean | { [key: string]: boolean | string | undefined | null })[]) {
  return classes
    .filter(Boolean)
    .join(' ');
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
