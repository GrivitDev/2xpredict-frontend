export function formatMatchTime(
  dateString: string,
): string {

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return 'Date unavailable';

  }

  const parts =
    new Intl.DateTimeFormat(
      'en-GB',
      {
        timeZone: 'UTC',

        weekday: 'short',

        month: 'short',

        day: '2-digit',

        year: 'numeric',

        hour: '2-digit',

        minute: '2-digit',

        second: '2-digit',

        hour12: false,
      },
    ).formatToParts(date);


  const get =
    (type: Intl.DateTimeFormatPartTypes) =>
      parts.find(
        part =>
          part.type === type,
      )?.value ?? '';


  return (
    `${get('weekday')}, ` +
    `${get('month').toUpperCase()} ` +
    `${get('day')}, ` +
    `${get('year')} ` +
    `${get('hour')}:` +
    `${get('minute')}:` +
    `${get('second')} UTC`
  );

}