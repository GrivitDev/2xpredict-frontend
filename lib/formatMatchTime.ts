export function formatMatchTime(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat('en-NG', {
    timeZone: 'Africa/Lagos', // Nigeria timezone (WAT)
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}