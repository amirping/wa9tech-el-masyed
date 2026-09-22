export type WindRel = 'on' | 'off' | 'side'

const POINTS = ['شمالي', 'شمالي شرقي', 'شرقي', 'قبلي شرقي', 'قبلي', 'قبلي غربي', 'غربي', 'شمالي غربي']

/** Wind named the Tunisian way: by where it blows from (القبلي = from the south). */
export const compass = (deg: number) => POINTS[Math.round((((deg % 360) + 360) % 360) / 45) % 8]

export function relWind(windFrom: number, facing: number): WindRel {
  const d = Math.abs((((windFrom - facing) % 360) + 540) % 360 - 180)
  if (d <= 60) return 'on'
  if (d >= 120) return 'off'
  return 'side'
}

export function seaText(effHs: number): string {
  if (effHs < 0.2) return 'البحر زيت'
  if (effHs < 0.4) return 'البحر راكد'
  if (effHs < 0.7) return 'البحر مقلّب شويّة'
  if (effHs < 1.3) return 'البحر مقلّب'
  if (effHs < 2) return 'البحر هايج'
  return 'البحر هايج برشا'
}

export function moonName(phase: number, illum: number): string {
  if (illum < 0.06) return 'القمرة غايبة'
  if (illum > 0.94) return 'القمرة كاملة'
  const waxing = phase < 0.5
  if (illum < 0.4) return waxing ? 'هلال طالع' : 'هلال نازل'
  if (illum < 0.6) return waxing ? 'نص قمرة طالعة' : 'نص قمرة نازلة'
  return waxing ? 'القمرة قريب تكمل' : 'القمرة بدات تنقص'
}

export const STAR_WORDS = ['', 'ما يستاهلش', 'ضعيف', 'عادي', 'باهي', 'باهي برشا']
