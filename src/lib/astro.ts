import * as SunCalcNs from 'suncalc'

// suncalc is a UMD module: Vite exposes it as a default export, Node as the namespace itself.
const SunCalc: typeof import('suncalc') = (SunCalcNs as any).default ?? SunCalcNs
import { HOUR, MIN } from './time'

// Solunar periods barely shift across 300 km of coast (a few minutes), so one reference point is enough.
const REF = { lat: 36.9, lon: 10.4 }
const STEP = 10 * MIN

export interface MoonEvents {
  /** Moon overhead or underfoot: major feeding periods (±1h). */
  majors: number[]
  /** Moonrise and moonset: minor feeding periods (±45 min). */
  minors: number[]
  rises: number[]
  sets: number[]
}

export function moonEvents(start: number, end: number): MoonEvents {
  const ev: MoonEvents = { majors: [], minors: [], rises: [], sets: [] }
  const alt = (t: number) => SunCalc.getMoonPosition(new Date(t), REF.lat, REF.lon).altitude
  let prev2 = alt(start - 2 * STEP)
  let prev = alt(start - STEP)
  for (let t = start; t <= end; t += STEP) {
    const a = alt(t)
    const tPrev = t - STEP
    // Local extremum at the previous sample → transit (max) or underfoot (min).
    if ((prev > prev2 && prev >= a) || (prev < prev2 && prev <= a)) ev.majors.push(tPrev)
    if (prev < 0 && a >= 0) {
      const x = tPrev + (STEP * -prev) / (a - prev)
      ev.rises.push(x)
      ev.minors.push(x)
    } else if (prev >= 0 && a < 0) {
      const x = tPrev + (STEP * prev) / (prev - a)
      ev.sets.push(x)
      ev.minors.push(x)
    }
    prev2 = prev
    prev = a
  }
  return ev
}

export function solunar(t: number, ev: MoonEvents): { factor: number; major: boolean; minor: boolean } {
  const near = (list: number[], win: number) => list.some((x) => Math.abs(x - t) <= win)
  if (near(ev.majors, HOUR)) return { factor: 1, major: true, minor: false }
  if (near(ev.minors, 45 * MIN)) return { factor: 0.85, major: false, minor: true }
  return { factor: 0.55, major: false, minor: false }
}

export interface MoonPhase {
  /** 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
  phase: number
  illum: number
}

export function moonPhase(t: number): MoonPhase {
  const m = SunCalc.getMoonIllumination(new Date(t))
  return { phase: m.phase, illum: m.fraction }
}

/** 1 around new and full moon (strongest pull), 0.85 at the quarters. */
export const phaseFactor = (p: number) => 0.85 + 0.15 * Math.abs(Math.cos(2 * Math.PI * p))

export function moonUp(t: number): boolean {
  return SunCalc.getMoonPosition(new Date(t), REF.lat, REF.lon).altitude > 0
}
