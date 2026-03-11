export function formatDate(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
