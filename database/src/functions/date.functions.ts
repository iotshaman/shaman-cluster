export function sqliteDate(date?: Date): Date {
  if (!date) date = new Date();
  return date.toISOString() as any;
}