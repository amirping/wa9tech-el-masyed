import { SPOTS, type Spot } from '../data/spots'
import { SPECIES, type Species, type WindowId, type SeaState } from '../data/species'
import { RIGS, sinkerFor, type BaitId, type RigId } from '../data/tackle'
import type { Forecast, Hour, SpotSeries } from './api'
import { moonEvents, moonPhase, moonUp, phaseFactor, solunar, type MoonEvents, type MoonPhase } from './astro'
import { HOUR, addDays, fmtTime, localDate, localMidnight } from './time'
import { compass, relWind, seaText, type WindRel } from './text'

// ---------- small helpers ----------

const clamp = (x: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x))
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)
const angleDiff = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360) + 360) % 360
  return d > 180 ? 360 - d : d
}

/** Piecewise-linear curve through [x, y] points. */
function curve(x: number, pts: [number, number][]): number {
  if (x <= pts[0][0]) return pts[0][1]
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i]
    if (x <= x1) {
      const [x0, y0] = pts[i - 1]
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
    }
  }
  return pts[pts.length - 1][1]
}

// ---------- physical factors ----------

/** Share of the offshore wave height that reaches a beach, from where the waves come vs. where the beach faces. */
export function exposure(waveFrom: number, facing: number): number {
  const d = angleDiff(waveFrom, facing)
  if (d <= 30) return 1
  if (d >= 150) return 0.15
  return 1 - (0.85 * (d - 30)) / 120
}

const seaStateOf = (effHs: number): SeaState => (effHs < 0.35 ? 'calm' : effHs < 1.3 ? 'moderate' : 'rough')

const SEA_DAY: [number, number][] = [[0, 0.3], [0.2, 0.45], [0.4, 0.8], [0.6, 1], [1.2, 1], [1.6, 0.7], [2, 0.4], [2.5, 0.1], [3, 0]]
const SEA_NIGHT: [number, number][] = [[0, 0.65], [0.2, 0.8], [0.4, 1], [1, 1], [1.5, 0.6], [2, 0.3], [2.5, 0.1], [3, 0]]
const WIND: [number, number][] = [[0, 1], [12, 1], [20, 0.85], [28, 0.6], [35, 0.35], [45, 0.1], [60, 0]]

function windFactor(h: Hour, rel: WindRel): number {
  let f = curve(h.wind, WIND)
  if (h.gust > 45) f *= 0.7
  if (rel === 'on' && h.wind > 20) f *= 0.9 // casting into the wind
  return f
}

function pressureFactor(dp3h: number): number {
  if (dp3h < -3) return 0.55 // falling fast: storm coming
  if (dp3h < -0.8) return 1 // slow fall: fish feed
  if (dp3h <= 0.8) return 0.8
  if (dp3h <= 2) return 0.65
  return 0.5 // sharp rise after a front
}

function tempFit(sst: number, [min, lo, hi, max]: Species['temp']): number {
  if (sst <= min || sst >= max) return 0.15
  if (sst < lo) return 0.4 + (0.6 * (sst - min)) / (lo - min)
  if (sst > hi) return 1 - (0.6 * (sst - hi)) / (max - hi)
  return 1
}

const THUNDER = new Set([95, 96, 99])

// ---------- windows ----------

export const WINDOW_NAMES: Record<WindowId, string> = {
  fajr: 'الفجر',
  nhar: 'النهار',
  maghreb: 'المغرب',
  lil: 'الليل',
}

interface WindowSpan {
  id: WindowId
  start: number
  end: number
}

function windowsFor(date: string, series: SpotSeries): WindowSpan[] {
  const sun = series.sun[date]
  const next = series.sun[addDays(date, 1)] ?? { rise: sun.rise + 24 * HOUR, set: sun.set + 24 * HOUR }
  const m = 1.5 * HOUR
  return [
    { id: 'fajr', start: sun.rise - m, end: sun.rise + m },
    { id: 'nhar', start: sun.rise + m, end: sun.set - m },
    { id: 'maghreb', start: sun.set - m, end: sun.set + m },
    { id: 'lil', start: sun.set + m, end: next.rise - m },
  ]
}

// ---------- result types ----------

export interface HourScore {
  t: number
  score: number
  danger: boolean
  effHs: number
  window: WindowId
}

export interface FishPick {
  species: Species
  fit: number
}

export interface WindowResult {
  id: WindowId
  name: string
  start: number
  end: number
  score: number
  stars: number
  primeStart: number
  primeEnd: number
  danger: boolean
  past: boolean
  fish: FishPick[]
  baits: BaitId[]
  rig: RigId
  sinker: string
  notes: Note[]
  cond: {
    effHs: number
    hs: number
    tp: number
    wind: number
    gust: number
    windDir: number
    windRel: WindRel
    sst: number
    rain: number
    cloud: number
    airTemp: number
    pressureTrend: number
  }
}

export interface SpotDay {
  spot: Spot
  date: string
  score: number
  stars: number
  windows: WindowResult[]
  best: WindowResult
  /** 24 hours from 04:00 to 04:00 next day, for the timeline strip. */
  strip: HourScore[]
  sunrise: number
  sunset: number
  afterStorm: boolean
}

export interface DayResult {
  date: string
  spots: SpotDay[]
  best: SpotDay
  moon: MoonPhase
  majors: number[]
  minors: number[]
}

export function starsFor(score: number): number {
  if (score >= 0.84) return 5
  if (score >= 0.72) return 4
  if (score >= 0.58) return 3
  if (score >= 0.44) return 2
  return 1
}

// ---------- core ----------

interface Context {
  spot: Spot
  hours: Hour[]
  idx: Map<number, number>
  ev: MoonEvents
}

function effHsAt(ctx: Context, i: number) {
  const h = ctx.hours[i]
  return h.hs * exposure(h.waveDir, ctx.spot.facing)
}

/** Sea was rough in the last 48 h and is now settling into fishable surf. */
function isAfterStorm(ctx: Context, i: number): boolean {
  const now = effHsAt(ctx, i)
  if (now < 0.4 || now > 1.4) return false
  let peak = 0
  for (let k = Math.max(0, i - 48); k < i - 3; k++) peak = Math.max(peak, effHsAt(ctx, k))
  const earlier = effHsAt(ctx, Math.max(0, i - 6))
  return peak >= 1.5 && now <= earlier + 0.05
}

function rainLast(ctx: Context, i: number, hours: number) {
  let s = 0
  for (let k = Math.max(0, i - hours); k <= i; k++) s += ctx.hours[k].rain
  return s
}

function speciesFit(sp: Species, ctx: Context, i: number, win: WindowId, afterStorm: boolean): number {
  const h = ctx.hours[i]
  const month = new Date(h.t + HOUR).getUTCMonth()
  const state = seaStateOf(effHsAt(ctx, i))
  let f = sp.shore * sp.months[month] * tempFit(h.sst, sp.temp) * sp.bottom[ctx.spot.bottom] * sp.time[win] * sp.sea[state]
  if (afterStorm && ['qarous', 'warata', 'ouarka', 'menkous'].includes(sp.id)) f *= 1.15
  if (sp.id === 'qarous' && ctx.spot.estuary && rainLast(ctx, i, 72) > 8) f *= 1.25
  return clamp(f)
}

function rankFish(ctx: Context, i: number, win: WindowId, afterStorm: boolean): FishPick[] {
  return SPECIES.map((species) => ({ species, fit: speciesFit(species, ctx, i, win, afterStorm) }))
    .sort((a, b) => b.fit - a.fit)
}

function lightFactor(win: WindowId, h: Hour, effHs: number): number {
  if (win === 'fajr' || win === 'maghreb') return 1
  if (win === 'nhar') return 0.55 + (h.cloud > 70 ? 0.2 : 0) + (effHs > 0.6 && effHs < 1.6 ? 0.15 : 0)
  // Night: a bright moon over calm, clear water makes fish wary.
  const { illum } = moonPhase(h.t)
  return illum > 0.8 && h.cloud < 30 && effHs < 0.4 && moonUp(h.t) ? 0.75 : 0.85
}

function scoreHour(ctx: Context, i: number, win: WindowId): HourScore {
  const h = ctx.hours[i]
  const effHs = effHsAt(ctx, i)
  const night = win === 'lil'
  const sea = curve(effHs, night ? SEA_NIGHT : SEA_DAY)
  const wind = windFactor(h, relWind(h.windDir, ctx.spot.facing))
  const pres = pressureFactor(h.pressure - ctx.hours[Math.max(0, i - 3)].pressure)
  const sol = solunar(h.t, ctx.ev).factor
  const afterStorm = isAfterStorm(ctx, i)
  const fish = rankFish(ctx, i, win, afterStorm)
  const fishFit = clamp((0.75 * fish[0].fit + 0.25 * fish[1].fit) / 0.85)

  let score = 0.3 * sea + 0.18 * wind + 0.1 * pres + 0.12 * sol + 0.3 * fishFit
  score *= lightFactor(win, h, effHs)
  score *= phaseFactor(moonPhase(h.t).phase)
  if (h.rain > 10) score *= 0.4
  else if (h.rain > 4) score *= 0.7
  if (afterStorm) score += 0.08

  // Rocks are less forgiving than sand: lower wave limit, and long swells throw surprise waves.
  const rock = ctx.spot.bottom === 'rock'
  const danger =
    effHs >= (rock ? 1.8 : 2.5) || (rock && h.tp >= 9 && effHs >= 1.2) || h.gust >= 65 || THUNDER.has(h.code)
  if (danger) score = Math.min(score, 0.12)
  return { t: h.t, score: clamp(score), danger, effHs, window: win }
}

function windowOf(t: number, spans: WindowSpan[]): WindowId {
  return spans.find((w) => t >= w.start && t < w.end)?.id ?? 'lil'
}

function buildWindow(ctx: Context, span: WindowSpan, now: number): WindowResult {
  const idxs: number[] = []
  for (let t = Math.ceil(span.start / HOUR) * HOUR; t < span.end; t += HOUR) {
    const i = ctx.idx.get(t)
    if (i != null) idxs.push(i)
  }
  const scored = idxs.map((i) => ({ i, s: scoreHour(ctx, i, span.id) }))
  const sorted = [...scored].sort((a, b) => b.s.score - a.s.score)
  const top = sorted.slice(0, 2)
  const score = avg(top.map((x) => x.s.score))

  // Prime time: the run of hours around the best hour that stay close to it.
  const bestPos = scored.findIndex((x) => x === sorted[0])
  const thr = (sorted[0]?.s.score ?? 0) - 0.06
  let a = bestPos
  let b = bestPos
  while (a > 0 && scored[a - 1].s.score >= thr) a--
  while (b < scored.length - 1 && scored[b + 1].s.score >= thr) b++
  const primeStart = scored[a]?.s.t ?? span.start
  const primeEnd = (scored[b]?.s.t ?? span.end) + HOUR

  const bestI = sorted[0]?.i ?? idxs[0]
  const hs = idxs.map((i) => ctx.hours[i])
  const effHs = avg(idxs.map((i) => effHsAt(ctx, i)))
  const afterStorm = idxs.some((i) => isAfterStorm(ctx, i))
  const fish = rankFish(ctx, bestI, span.id, afterStorm).filter((f) => f.fit >= 0.2).slice(0, 4)
  const danger = scored.some((x) => x.s.danger)

  const windDir = circularMean(hs.map((h) => h.windDir))
  const cond: WindowResult['cond'] = {
    effHs,
    hs: avg(hs.map((h) => h.hs)),
    tp: avg(hs.map((h) => h.tp)),
    wind: avg(hs.map((h) => h.wind)),
    gust: Math.max(...hs.map((h) => h.gust)),
    windDir,
    windRel: relWind(windDir, ctx.spot.facing),
    sst: avg(hs.map((h) => h.sst)),
    rain: hs.reduce((s, h) => s + h.rain, 0),
    cloud: avg(hs.map((h) => h.cloud)),
    airTemp: avg(hs.map((h) => h.airTemp)),
    pressureTrend: hs.length ? hs[hs.length - 1].pressure - ctx.hours[Math.max(0, idxs[0] - 3)].pressure : 0,
  }

  return {
    id: span.id,
    name: WINDOW_NAMES[span.id],
    start: span.start,
    end: span.end,
    score,
    stars: starsFor(score),
    primeStart,
    primeEnd,
    danger,
    past: span.end < now,
    fish,
    baits: pickBaits(fish),
    rig: pickRig(fish, effHs, span.id),
    sinker: sinkerFor(effHs),
    notes: windowNotes(ctx, span, cond, afterStorm, danger, hs),
    cond,
  }
}

function circularMean(degs: number[]): number {
  const r = Math.PI / 180
  const x = avg(degs.map((d) => Math.cos(d * r)))
  const y = avg(degs.map((d) => Math.sin(d * r)))
  return (Math.atan2(y, x) / r + 360) % 360
}

function pickBaits(fish: FishPick[]): BaitId[] {
  const score = new Map<BaitId, number>()
  fish.forEach((f, rank) =>
    f.species.baits.forEach((b, k) => score.set(b, (score.get(b) ?? 0) + f.fit * (1 - rank * 0.15) * (1 - k * 0.12))),
  )
  // They always carry worms: keep them in the list even when the top fish prefers something else.
  if (!score.has('worm')) score.set('worm', 0)
  return [...score.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([b]) => b)
}

function pickRig(fish: FishPick[], effHs: number, win: WindowId): RigId {
  if (effHs > 1.3) return 'grip'
  const top = fish[0]?.species
  if (!top) return 'sliding'
  if (effHs < 0.35 && win !== 'lil' && ['warata', 'qarous'].includes(top.id)) return 'longLeader'
  return top.rig
}

export type NoteKind = 'danger' | 'rock' | 'sea' | 'calm' | 'wind' | 'pressure' | 'solunar' | 'moon' | 'rain' | 'estuary'
export interface Note {
  k: NoteKind
  t: string
}

function windowNotes(
  ctx: Context,
  span: WindowSpan,
  c: WindowResult['cond'],
  afterStorm: boolean,
  danger: boolean,
  hs: Hour[],
): Note[] {
  const n: Note[] = []
  if (hs.some((h) => THUNDER.has(h.code))) n.push({ k: 'danger', t: 'عجاجة ورعد: ما تقعدش بالقصبة في الشط' })
  else if (danger && ctx.spot.bottom === 'rock')
    n.push({ k: 'danger', t: 'الموج قوي على الصخر: خطر، ما تطلعش للصخر اليوم' })
  else if (danger) n.push({ k: 'danger', t: 'البحر هايج برشا ولا الريح قوية: خطر، ما تمشيش' })
  else if (ctx.spot.bottom !== 'sand' && (c.effHs >= 1 || c.tp >= 8))
    n.push({ k: 'rock', t: 'على الصخر: رد بالك من الموجة الكبيرة، ما تعطيش ظهرك للبحر' })
  n.push({ k: 'sea', t: `${seaText(c.effHs)} (موج ${c.effHs.toFixed(1)} م${c.tp ? ` كل ${Math.round(c.tp)} ثواني` : ''})` })
  if (afterStorm) n.push({ k: 'calm', t: 'البحر قاعد يهدا بعد التقليبة: الحوت يخرج ياكل' })
  const rel = c.windRel === 'on' ? 'جاية من البحر' : c.windRel === 'off' ? 'جاية من البر' : 'على الجنب'
  n.push({
    k: 'wind',
    t: `ريح ${compass(c.windDir)} ${Math.round(c.wind)} كم/س، ${rel}${c.gust > 40 ? `، الرّفّات توصل ${Math.round(c.gust)}` : ''}`,
  })
  if (c.pressureTrend < -0.8 && c.pressureTrend >= -3) n.push({ k: 'pressure', t: 'البارومتر هابط بشويّة: الحوت ياكل' })
  else if (c.pressureTrend > 2) n.push({ k: 'pressure', t: 'البارومتر طالع بالزربة: الحوت يتقلّق' })
  const majors = ctx.ev.majors.filter((t) => t >= span.start && t < span.end)
  if (majors.length) n.push({ k: 'solunar', t: `وقت القمرة القوي: ${majors.map(fmtTime).join(' و ')}` })
  if (span.id === 'lil') {
    const { illum } = moonPhase(span.start + 3 * HOUR)
    const t = illum < 0.15 ? 'ليلة ظلمة (القمرة غايبة)' : illum > 0.95 ? 'القمرة كاملة: الضوء قوي' : `القمرة ${Math.round(illum * 100)}%`
    n.push({ k: 'moon', t })
  }
  if (c.rain > 0.5) n.push({ k: 'rain', t: `مطر ${c.rain.toFixed(1)} ملم` })
  const i0 = ctx.idx.get(Math.ceil(span.start / HOUR) * HOUR)
  if (ctx.spot.estuary && i0 != null && rainLast(ctx, i0, 72) > 8) n.push({ k: 'estuary', t: 'الوادي هابط بعد المطر: القاروص يقرّب للفم' })
  return n
}

export function analyse(forecast: Forecast, now = Date.now(), days = 7): DayResult[] {
  const today = localDate(now)
  const dates = Array.from({ length: days }, (_, k) => addDays(today, k))
  const ev = moonEvents(localMidnight(dates[0]) - 6 * HOUR, localMidnight(dates[dates.length - 1]) + 36 * HOUR)

  const ctxs: Context[] = SPOTS.filter((s) => forecast.series[s.id]).map((spot) => {
    const hours = forecast.series[spot.id].hours
    return { spot, hours, idx: new Map(hours.map((h, i) => [h.t, i])), ev }
  })

  return dates.map((date) => {
    const spots = ctxs
      .map((ctx) => spotDay(ctx, forecast.series[ctx.spot.id], date, now))
      .filter((x): x is SpotDay => x != null)
      .sort((a, b) => b.score - a.score)
    const noon = localMidnight(date) + 12 * HOUR
    const start = localMidnight(date)
    return {
      date,
      spots,
      best: spots[0],
      moon: moonPhase(noon),
      majors: ev.majors.filter((t) => t >= start && t < start + 24 * HOUR),
      minors: ev.minors.filter((t) => t >= start && t < start + 24 * HOUR),
    }
  })
}

function spotDay(ctx: Context, series: SpotSeries, date: string, now: number): SpotDay | null {
  if (!series.sun[date]) return null
  const spans = windowsFor(date, series)
  const windows = spans.map((s) => buildWindow(ctx, s, now))
  const live = windows.filter((w) => !w.past)
  const ranked = [...(live.length ? live : windows)].sort((a, b) => b.score - a.score)
  const score = ranked.length > 1 ? 0.7 * ranked[0].score + 0.3 * ranked[1].score : ranked[0].score

  const stripStart = localMidnight(date) + 4 * HOUR
  const strip: HourScore[] = []
  for (let t = stripStart; t < stripStart + 24 * HOUR; t += HOUR) {
    const i = ctx.idx.get(t)
    if (i != null) strip.push(scoreHour(ctx, i, windowOf(t, spans)))
  }

  return {
    spot: ctx.spot,
    date,
    score,
    stars: starsFor(score),
    windows,
    best: ranked[0],
    strip,
    sunrise: series.sun[date].rise,
    sunset: series.sun[date].set,
    afterStorm: windows.some((w) => w.notes.some((x) => x.k === 'calm')),
  }
}

export { RIGS }
