// Tunisia is UTC+1 all year (no daylight saving since 2009), so a fixed offset is exact.
const OFFSET = 3_600_000
export const HOUR = 3_600_000
export const MIN = 60_000

/** "2026-09-22T05:00" (Open-Meteo, timezone=Africa/Tunis) → epoch ms. */
export const parseLocal = (s: string) => Date.parse(`${s}:00+01:00`)

const shifted = (ms: number) => new Date(ms + OFFSET)

export const localDate = (ms: number) => shifted(ms).toISOString().slice(0, 10)
export const localHour = (ms: number) => shifted(ms).getUTCHours()
export const localMidnight = (date: string) => Date.parse(`${date}T00:00:00+01:00`)

export const fmtTime = (ms: number) => shifted(ms).toISOString().slice(11, 16)

const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الإربعاء', 'الخميس', 'الجمعة', 'السبت']
const MONTHS = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

export function dayLabel(date: string, today: string): string {
  const diff = Math.round((localMidnight(date) - localMidnight(today)) / (24 * HOUR))
  if (diff === 0) return 'اليوم'
  if (diff === 1) return 'غدوة'
  if (diff === 2) return 'بعد غدوة'
  return DAYS[new Date(localMidnight(date) + OFFSET).getUTCDay()]
}

export function weekday(date: string): string {
  return DAYS[new Date(localMidnight(date) + OFFSET).getUTCDay()]
}

export function dateLabel(date: string): string {
  const [, m, d] = date.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]}`
}

export function addDays(date: string, n: number): string {
  return localDate(localMidnight(date) + n * 24 * HOUR + HOUR)
}
