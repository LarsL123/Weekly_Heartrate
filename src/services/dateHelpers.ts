// Convert a date string (YYYY-MM-DD) to week format (YYYY-Www) using ISO 8601
export const dateToWeek = (dateString: string): string => {
  const date = new Date(dateString);

  // Copy date so we don't modify the original
  const target = new Date(date.valueOf());

  // ISO 8601 week date: weeks start on Monday
  const dayNr = (date.getDay() + 6) % 7; // Make Monday = 0, Sunday = 6

  // Set to nearest Thursday (current date + 4 - dayNr)
  target.setDate(target.getDate() - dayNr + 3);

  // Get first day of year
  const jan4 = new Date(target.getFullYear(), 0, 4);

  // Calculate week number
  const dayDiff = (target.getTime() - jan4.getTime()) / 86400000;
  const weekNum = 1 + Math.round((dayDiff - 3 + ((jan4.getDay() + 6) % 7)) / 7);

  return `${target.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
};

// Convert week format (YYYY-Www) to a date string (Monday of that week)
export const weekToDate = (weekString: string): string => {
  const [year, week] = weekString.split("-W").map(Number);

  // Simple calculation: January 4th is always in week 1
  const jan4 = new Date(year, 0, 4);

  // Get the Monday of week 1
  const jan4Day = (jan4.getDay() + 6) % 7; // Make Monday = 0, Sunday = 6
  const week1Monday = new Date(year, 0, 4 - jan4Day);

  // Add the number of weeks
  const targetMonday = new Date(week1Monday);
  targetMonday.setDate(week1Monday.getDate() + (week - 1) * 7);

  return targetMonday.toLocaleDateString("sv-SE");
};

export const getMonday = (date: Date | string = new Date()): string => {
  const today = new Date(date);

  // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDay = today.getDay();

  // Calculate how many days to subtract to get back to Monday
  // If it's Sunday (0), we need to go back 6 days. Otherwise, go back (currentDay - 1) days.
  const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

  const monday = new Date(today);
  monday.setDate(today.getDate() - daysSinceMonday);

  // Format as YYYY-MM-DD using the Swedish locale trick to avoid UTC timezone shifts
  return monday.toLocaleDateString("sv-SE");
};

export function prevMonday() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 8);

  return getMonday(sevenDaysAgo);
}
