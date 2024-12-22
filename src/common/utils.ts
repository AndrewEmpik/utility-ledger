export function dateToFullDayRange(date: Date) {
  return {
    start: new Date(date.setHours(0, 0, 0, 0)),
    end: new Date(date.setHours(23, 59, 59, 999)),
  };
}

export function getMonthName(monthNumber: number): string {
  const months = [
    'СІЧЕНЬ',
    'ЛЮТИЙ',
    'БЕРЕЗЕНЬ',
    'КВІТЕНЬ',
    'ТРАВЕНЬ',
    'ЧЕРВЕНЬ',
    'ЛИПЕНЬ',
    'СЕРПЕНЬ',
    'ВЕРЕСЕНЬ',
    'ЖОВТЕНЬ',
    'ЛИСТОПАД',
    'ГРУДЕНЬ',
  ];

  // exceptional edge case
  if (monthNumber === 0) monthNumber = 12;

  if (monthNumber < 1 || monthNumber > 12) {
    throw new Error('Month number should be between 1 and 12.');
  }

  return months[monthNumber - 1];
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function getDaysInMonth(baseDate: Date = new Date()): number {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + 1;

  return new Date(year, month, 0).getDate();
}
