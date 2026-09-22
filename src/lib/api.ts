import { SPOTS, marinePoint } from '../data/spots'
import { parseLocal } from './time'

export interface Hour {
  t: number
  wind: number // km/h
  windDir: number // degrees, direction the wind comes FROM
  gust: number
  pressure: number // hPa
  airTemp: number
  cloud: number // %
  rain: number // mm in the hour
  code: number // WMO weather code
  hs: number // significant wave height, m (offshore)
  waveDir: number // direction waves come FROM
  tp: number // wave period, s
  swellH: number
  swellP: number
  sst: number // sea surface temperature °C
}

export interface SpotSeries {
  hours: Hour[]
  sun: Record<string, { rise: number; set: number }>
}

export interface Forecast {
  fetchedAt: number
  series: Record<string, SpotSeries>
}

const CACHE_KEY = 'masyed-forecast-v1'
const MAX_AGE = 2 * 3_600_000

const WEATHER_VARS = [
  'temperature_2m', 'wind_speed_10m', 'wind_direction_10m', 'wind_gusts_10m',
  'pressure_msl', 'cloud_cover', 'precipitation', 'weather_code',
]
const MARINE_VARS = [
  'wave_height', 'wave_direction', 'wave_period',
  'swell_wave_height', 'swell_wave_period', 'sea_surface_temperature',
]
const COMMON = 'timezone=Africa%2FTunis&past_days=3&forecast_days=8'

async function getJson(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const body = await res.json()
  return Array.isArray(body) ? body : [body]
}

/** Replace nulls with the last known value (the wave model sometimes has gaps at the edges). */
function filled(arr: (number | null)[] | undefined, fallback = 0): number[] {
  let last = fallback
  const out = (arr ?? []).map((v) => (v == null ? last : (last = v)))
  // Back-fill leading nulls with the first real value.
  const first = arr?.find((v) => v != null)
  if (first != null) for (let i = 0; i < out.length && arr![i] == null; i++) out[i] = first
  return out
}

async function download(): Promise<Forecast> {
  const lat = SPOTS.map((s) => s.lat).join(',')
  const lon = SPOTS.map((s) => s.lon).join(',')
  const mp = SPOTS.map(marinePoint)
  const [weather, marine] = await Promise.all([
    getJson(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=${WEATHER_VARS}&daily=sunrise,sunset&${COMMON}`),
    getJson(`https://marine-api.open-meteo.com/v1/marine?latitude=${mp.map((p) => p.lat)}&longitude=${mp.map((p) => p.lon)}&hourly=${MARINE_VARS}&${COMMON}`),
  ])

  const series: Record<string, SpotSeries> = {}
  SPOTS.forEach((spot, i) => {
    const w = weather[i].hourly
    const m = marine[i].hourly
    const mIndex = new Map<string, number>(m.time.map((t: string, j: number) => [t, j]))
    const col = (src: any, key: string, fb = 0) => filled(src[key], fb)
    const wv = Object.fromEntries(WEATHER_VARS.map((k) => [k, col(w, k)]))
    const mv = Object.fromEntries(MARINE_VARS.map((k) => [k, col(m, k, k === 'sea_surface_temperature' ? 20 : 0)]))

    const hours: Hour[] = w.time.map((t: string, j: number) => {
      const k = mIndex.get(t) ?? Math.min(j, m.time.length - 1)
      return {
        t: parseLocal(t),
        wind: wv.wind_speed_10m[j],
        windDir: wv.wind_direction_10m[j],
        gust: wv.wind_gusts_10m[j],
        pressure: wv.pressure_msl[j],
        airTemp: wv.temperature_2m[j],
        cloud: wv.cloud_cover[j],
        rain: wv.precipitation[j],
        code: wv.weather_code[j],
        hs: mv.wave_height[k],
        waveDir: mv.wave_direction[k],
        tp: mv.wave_period[k],
        swellH: mv.swell_wave_height[k],
        swellP: mv.swell_wave_period[k],
        sst: mv.sea_surface_temperature[k],
      }
    })

    const d = weather[i].daily
    const sun: SpotSeries['sun'] = {}
    d.time.forEach((date: string, j: number) => {
      sun[date] = { rise: parseLocal(d.sunrise[j]), set: parseLocal(d.sunset[j]) }
    })
    series[spot.id] = { hours, sun }
  })

  return { fetchedAt: Date.now(), series }
}

export function cachedForecast(): Forecast | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as Forecast) : null
  } catch {
    return null
  }
}

export function isStale(f: Forecast) {
  return Date.now() - f.fetchedAt > MAX_AGE
}

export async function fetchForecast(): Promise<Forecast> {
  const f = await download()
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(f))
  } catch {
    // Storage full or blocked: the app still works, it just won't open offline.
  }
  return f
}
