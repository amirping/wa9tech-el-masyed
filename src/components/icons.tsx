import type { ComponentChildren } from 'preact'
import {
  IconAlertTriangle,
  IconBread,
  IconCloudRain,
  IconGauge,
  IconMoonStars,
  IconRipple,
  IconSparkles,
  IconSun,
  IconSunrise,
  IconSunset,
  IconWind,
  IconMoon,
} from '@tabler/icons-preact'
import type { WindowId } from '../data/species'
import type { BaitId } from '../data/tackle'
import type { NoteKind } from '../lib/score'

type P = { size?: number; class?: string }

/** Same grid and stroke as Tabler (24px, 2px round) so custom icons sit next to library ones. */
function Svg({ size = 24, class: cls, children }: P & { children: ComponentChildren }) {
  return (
    <svg
      class={cls}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export const IconWorm = (p: P) => (
  <Svg {...p}>
    <path d="M3 15c1.6-3.2 3.4-3.2 5 0s3.4 3.2 5 0 3.4-3.2 5 0" />
    <circle cx="20.2" cy="13.6" r="1.4" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconCrab = (p: P) => (
  <Svg {...p}>
    <ellipse cx="12" cy="14" rx="5.5" ry="3.8" />
    <path d="M7.5 11.5 5 8.5M5 8.5 3 9.5M5 8.5l.5-2.3M16.5 11.5l2.5-3M19 8.5l2 1M19 8.5l-.5-2.3" />
    <path d="M7 16.5 4 18.5M8.5 17.5 7 20.5M17 16.5l3 2M15.5 17.5l1.5 3" />
    <path d="M10.5 10.3V9M13.5 10.3V9" />
  </Svg>
)

export const IconShrimp = (p: P) => (
  <Svg {...p}>
    <path d="M19 5c-6 0-11 3.5-11 8.5C8 17 10.5 19 13.5 19" />
    <path d="M13.5 19 11 21.5M13.5 19l2.5 2.5" />
    <path d="M19 5c1.8 1.2 1.8 3.8 0 5-2.5 1.6-5.5 1.8-7.5 3.5" />
    <path d="M17 4 21 2M11 8.5 8.5 5.5M9.5 11.5 6 10" />
  </Svg>
)

export const IconSquid = (p: P) => (
  <Svg {...p}>
    <path d="M12 2.5c3.2 2 4.5 5.2 4.5 8.5v2h-9v-2c0-3.3 1.3-6.5 4.5-8.5z" />
    <path d="M9 13v4.5c0 1.5-1 2.5-2.5 2.5M12 13v8.5M15 13v4.5c0 1.5 1 2.5 2.5 2.5" />
    <circle cx="10.3" cy="9.5" r=".6" fill="currentColor" />
    <circle cx="13.7" cy="9.5" r=".6" fill="currentColor" />
  </Svg>
)

export const IconMussel = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 19.5C3.5 12 9 4.5 18 3.5c1.5 8-4 15.2-13.5 16z" />
    <path d="M4.5 19.5 13 9.5M8 11c1.5.3 2.7 1.2 3.4 2.6" />
  </Svg>
)

export const IconFishSide = (p: P) => (
  <Svg {...p}>
    <path d="M9 12c2.2-3.3 5-5 8-5 2.5 0 4.5 2.2 4.5 5s-2 5-4.5 5c-3 0-5.8-1.7-8-5z" />
    <path d="M9 12 3 7.5v9z" />
    <circle cx="18" cy="11" r=".9" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconLiveFish = (p: P) => (
  <Svg {...p}>
    <path d="M16.7 7.5C14 7.5 11.8 9.3 10 12c1.8 2.7 4 4.5 6.7 4.5 2 0 3.8-2 3.8-4.5s-1.8-4.5-3.8-4.5z" />
    <path d="M10 12 7 9.5v5z" />
    <path d="M2 9h2.5M1.5 12h3M2 15h2.5" />
    <circle cx="17.5" cy="11" r=".7" fill="currentColor" />
  </Svg>
)

export function BaitIcon({ id, size = 26 }: { id: BaitId; size?: number }) {
  switch (id) {
    case 'worm': return <IconWorm size={size} />
    case 'crab': return <IconCrab size={size} />
    case 'shrimp': return <IconShrimp size={size} />
    case 'squid': return <IconSquid size={size} />
    case 'mussel': return <IconMussel size={size} />
    case 'bread': return <IconBread size={size} stroke={2} />
    case 'live': return <IconLiveFish size={size} />
    case 'sardine': return <IconFishSide size={size} />
  }
}

export function WindowIcon({ id, size = 22 }: { id: WindowId; size?: number }) {
  const s = { size, stroke: 2 }
  if (id === 'fajr') return <IconSunrise {...s} />
  if (id === 'nhar') return <IconSun {...s} />
  if (id === 'maghreb') return <IconSunset {...s} />
  return <IconMoonStars {...s} />
}

export function NoteIcon({ k, size = 20 }: { k: NoteKind; size?: number }) {
  const s = { size, stroke: 2 }
  switch (k) {
    case 'danger': return <IconAlertTriangle {...s} />
    case 'rock': return <IconAlertTriangle {...s} />
    case 'sea': return <IconRipple {...s} />
    case 'calm': return <IconSparkles {...s} />
    case 'wind': return <IconWind {...s} />
    case 'pressure': return <IconGauge {...s} />
    case 'solunar': return <IconMoonStars {...s} />
    case 'moon': return <IconMoon {...s} />
    case 'rain': return <IconCloudRain {...s} />
    case 'estuary': return <IconFishSide size={size} />
  }
}
