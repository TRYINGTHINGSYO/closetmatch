export function timeOfDayGreeting(now = new Date(), timeZone?: string | null): string {
  let hour = now.getHours();
  if (timeZone) {
    try {
      const hourPart = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hourCycle: 'h23',
        timeZone,
      })
        .formatToParts(now)
        .find((part) => part.type === 'hour')?.value;
      if (hourPart != null && hourPart !== '') hour = Number(hourPart);
    } catch {
      // Keep the device-local hour if the profile timezone is invalid.
    }
  }
  if (hour < 5) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
