export function cn(...classes: (string | undefined | null | boolean | { [key: string]: boolean | string | undefined | null })[]) {
  return classes
    .filter(Boolean)
    .map(c => {
      if (typeof c === 'object' && c !== null) {
        return Object.entries(c)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return c;
    })
    .join(' ');
}
