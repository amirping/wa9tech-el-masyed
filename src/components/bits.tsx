import type { HourScore } from '../lib/score'
import { IconSunrise, IconSunset } from '@tabler/icons-preact'
import { STAR_WORDS } from '../lib/text'
import { HOUR, fmtTime } from '../lib/time'

export function Stars({ n, size = 'md' }: { n: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span class={`stars stars-${size}`} role="img" aria-label={`${n} من 5 نجوم، ${STAR_WORDS[n]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 24 24" class={i <= n ? 'on' : 'off'} aria-hidden="true">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" />
        </svg>
      ))}
    </span>
  )
}

/** Moon disc with the lit part drawn for the given phase (0 new → 0.5 full → 1 new). */
export function Moon({ phase, size = 28 }: { phase: number; size?: number }) {
  const r = 10
  const k = Math.cos(2 * Math.PI * phase)
  const rx = Math.abs(k) * r
  const waxing = phase < 0.5
  const outer = waxing ? 1 : 0
  const inner = waxing ? (k > 0 ? 0 : 1) : k > 0 ? 1 : 0
  const lit = `M0,${-r} A${r},${r} 0 0 ${outer} 0,${r} A${rx},${r} 0 0 ${inner} 0,${-r}`
  return (
    <svg class="moon" width={size} height={size} viewBox="-12 -12 24 24" aria-hidden="true">
      <circle r={r} class="moon-dark" />
      <path d={lit} class="moon-lit" />
    </svg>
  )
}

/** Arrow pointing where the wind blows TO (it is reported by where it comes from). */
export function WindArrow({ from, size = 18 }: { from: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-10 -10 20 20" style={{ transform: `rotate(${from + 180}deg)` }} aria-hidden="true">
      <path d="M0,-8 L5,4 L0,1.5 L-5,4 Z" fill="currentColor" />
    </svg>
  )
}

const RAMP: [number, [number, number, number]][] = [
  [0, [22, 56, 74]],
  [0.45, [34, 92, 110]],
  [0.62, [74, 160, 150]],
  [0.74, [190, 200, 90]],
  [0.84, [242, 183, 5]],
]

function sonarColor(score: number): string {
  if (score <= RAMP[0][0]) return `rgb(${RAMP[0][1]})`
  for (let i = 1; i < RAMP.length; i++) {
    const [x1, c1] = RAMP[i]
    if (score <= x1) {
      const [x0, c0] = RAMP[i - 1]
      const f = (score - x0) / (x1 - x0)
      return `rgb(${c0.map((v, j) => Math.round(v + (c1[j] - v) * f)).join(',')})`
    }
  }
  return `rgb(${RAMP[RAMP.length - 1][1]})`
}

/** Bar height for a score: never fully flat so every hour stays visible. */
const barHeight = (score: number) => Math.round(18 + 82 * Math.min(1, Math.max(0, (score - 0.2) / 0.7)))

/**
 * The "sonar" strip: one bar per hour from 04:00 to 04:00. Taller and more yellow = better.
 * Runs right-to-left like the rest of the page, with sunrise and sunset marked.
 * A legend always sits underneath so it reads on its own.
 */
export function Strip({ hours, sunrise, sunset, now }: { hours: HourScore[]; sunrise: number; sunset: number; now?: number }) {
  if (!hours.length) return null
  const start = hours[0].t
  const span = 24 * HOUR
  const pos = (t: number) => `${(((t - start) / span) * 100).toFixed(2)}%`
  const showNow = now != null && now >= start && now < start + span
  return (
    <figure class="strip">
      <div class="sonar" aria-hidden="true">
        <div class="sonar-track">
          {hours.map((h) => (
            <span key={h.t} class="slot">
              <span
                class={h.danger ? 'bar danger' : 'bar'}
                style={h.danger ? { height: '100%' } : { height: `${barHeight(h.score)}%`, background: sonarColor(h.score) }}
              />
            </span>
          ))}
          <span class="sonar-mark sun" style={{ insetInlineStart: pos(sunrise) }} />
          <span class="sonar-mark sun" style={{ insetInlineStart: pos(sunset) }} />
          {showNow && <span class="sonar-mark now" style={{ insetInlineStart: pos(now!) }} />}
        </div>
        <div class="sonar-ticks">
          {[4, 8, 12, 16, 20, 24].map((h) => (
            <span key={h} style={{ insetInlineStart: pos(start + (h - 4) * HOUR) }}>
              {h === 24 ? '00' : String(h).padStart(2, '0')}
            </span>
          ))}
        </div>
      </div>
      <figcaption class="strip-legend">
        <span class="key">
          <span class="key-bars" aria-hidden="true">
            {[0.25, 0.5, 0.68, 0.8, 0.9].map((v) => (
              <i key={v} style={{ height: `${barHeight(v) * 0.16}px`, background: sonarColor(v) }} />
            ))}
          </span>
          كل ما أطول وأصفر، كل ما خير
        </span>
        <span class="key">
          <IconSunrise size={16} stroke={2} /> {fmtTime(sunrise)}
          <IconSunset size={16} stroke={2} /> {fmtTime(sunset)}
          {hours.some((h) => h.danger) && (
            <>
              <i class="key-danger" aria-hidden="true" /> خطر
            </>
          )}
        </span>
      </figcaption>
    </figure>
  )
}

export const range = (a: number, b: number) => `من ${fmtTime(a)} حتى ${fmtTime(b)}`
