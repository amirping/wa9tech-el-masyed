import type { RigId } from '../data/tackle'

/*
 * Rig diagrams drawn in the app's own style. The rod is on the right (the shore),
 * the line runs left out to sea, and the seabed is the dotted band at the bottom.
 */

const MAIN = 'var(--ink)'
const LEADER = 'var(--deep)'
const LEAD = '#8e9ba3'

/**
 * `anchor` is geometric: 'start' = text grows to the right of x, 'end' = to the left.
 * The page is RTL, where SVG flips start/end, so swap them here.
 */
const Label = ({ x, y, t, anchor = 'middle' }: { x: number; y: number; t: string; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} text-anchor={anchor === 'start' ? 'end' : anchor === 'end' ? 'start' : 'middle'} class="rig-label">
    {t}
  </text>
)

const Seabed = () => (
  <g>
    <path d="M0 126 Q45 120 90 126 T180 126 T270 126 T360 126 V150 H0Z" class="rig-sand" />
    <path d="M0 126 Q45 120 90 126 T180 126 T270 126 T360 126" fill="none" stroke="var(--line)" stroke-width="1.5" stroke-dasharray="2 4" />
  </g>
)

const Swivel = ({ x, y }: { x: number; y: number }) => (
  <g fill="none" stroke={MAIN} stroke-width="1.8">
    <circle cx={x - 3.5} cy={y} r="3" />
    <circle cx={x + 3.5} cy={y} r="3" />
  </g>
)

const Bead = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r="4" fill="var(--buoy)" stroke="#b88900" />

const Sinker = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -11 C7 -3 8 7 0 8 C-8 7 -7 -3 0 -11Z"
    fill={LEAD}
    stroke="#5f6b72"
    stroke-width="1.2"
  />
)

const Grip = ({ x, y }: { x: number; y: number }) => (
  <g>
    <Sinker x={x} y={y} s={1.15} />
    <path
      d={`M${x - 4} ${y + 7} l-9 8 M${x - 1.5} ${y + 8.5} l-3 10 M${x + 1.5} ${y + 8.5} l3 10 M${x + 4} ${y + 7} l9 8`}
      stroke="#5f6b72"
      stroke-width="1.6"
      stroke-linecap="round"
    />
  </g>
)

/** J hook, point facing left (towards the sea); `s` scales it for big hooks. */
const Hook = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 -12 V2 a5.5 5.5 0 0 1 -11 0 v-4 l2.5 2.5"
    fill="none"
    stroke={MAIN}
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
)

const Worm = ({ x, y }: { x: number; y: number }) => (
  <path
    d={`M${x + 1} ${y - 14} c-6 3 6 6 0 9 s6 6 0 9 c-4 2 -8 5 -12 3`}
    fill="none"
    stroke="#d9778a"
    stroke-width="3.2"
    stroke-linecap="round"
  />
)

const BaitFish = ({ x, y, live = false }: { x: number; y: number; live?: boolean }) => (
  <g transform={`translate(${x - 26} ${y - 4})`}>
    <path d="M0 0 C6 -8 18 -8 24 0 C18 8 6 8 0 0Z" fill={live ? '#7fb3c4' : '#b8c4ca'} stroke="#5f6b72" stroke-width="1.2" />
    <path d="M24 0 l7 -6 v12z" fill={live ? '#7fb3c4' : '#b8c4ca'} stroke="#5f6b72" stroke-width="1.2" />
    <circle cx="5" cy="-1" r="1.3" fill="#0e2a3b" />
    {live && <path d="M-6 -6 h-6 M-5 0 h-8 M-6 6 h-6" stroke={LEADER} stroke-width="1.4" stroke-linecap="round" />}
  </g>
)

interface SlidingOpts {
  leader: string
  hookX: number
  sinkerLabel?: string
  bait?: 'worm' | 'fish' | 'live'
  bigHook?: boolean
  weakLink?: boolean
  mainLabel?: string
  sinkerSize?: number
}

/** Running rig: the lead slides on the main line, stopped by a bead and swivel, then the leader. */
function Sliding({ leader, hookX, sinkerLabel = 'رصاص يجري', bait = 'worm', bigHook, weakLink, mainLabel = 'الخيط', sinkerSize = 1 }: SlidingOpts) {
  const hookY = 108
  return (
    <>
      <Seabed />
      <line x1="355" y1="50" x2="198" y2="50" stroke={MAIN} stroke-width="2" />
      <Label x={322} y={40} t={mainLabel} />
      <circle cx="268" cy="50" r="3" fill="none" stroke={MAIN} stroke-width="1.6" />
      <line
        x1="268" y1="53" x2="268" y2="104"
        stroke={weakLink ? 'var(--flare)' : MAIN}
        stroke-width={weakLink ? 1.4 : 1.6}
        stroke-dasharray={weakLink ? '4 3' : undefined}
      />
      <Sinker x={268} y={113} s={sinkerSize} />
      <Label x={268} y={145} t={sinkerLabel} />
      {weakLink && <Label x={276} y={80} t="خيط ضعيف" anchor="start" />}
      <Bead x={226} y={50} />
      <Swivel x={206} y={50} />
      <Label x={206} y={38} t="ميريون" />
      <path d={`M198 50 Q ${(198 + hookX) / 2} 54 ${hookX} ${hookY - 12}`} fill="none" stroke={LEADER} stroke-width="1.3" />
      <Label x={(198 + hookX) / 2 - 20} y={57} t={`بادولين ${leader}`} />
      <Hook x={hookX} y={hookY} s={bigHook ? 1.45 : 1} />
      {bait === 'worm' && <Worm x={hookX} y={hookY} />}
      {bait === 'fish' && <BaitFish x={hookX - 4} y={hookY} />}
      {bait === 'live' && <BaitFish x={hookX - 4} y={hookY - 2} live />}
      <Label x={hookX - 6} y={145} t="صنارة" />
    </>
  )
}

/** Paternoster: lead at the end of the line, hooks on short droppers above it. */
function Paternoster({ droppers, grip }: { droppers: number[]; grip?: boolean }) {
  return (
    <>
      <Seabed />
      <line x1="355" y1="46" x2="56" y2="46" stroke={MAIN} stroke-width="2" />
      <line x1="56" y1="46" x2="50" y2="100" stroke={MAIN} stroke-width="1.8" />
      <Label x={318} y={34} t="خيط 0.40" />
      {grip ? <Grip x={50} y={110} /> : <Sinker x={50} y={110} />}
      <Label x={50} y={146} t={grip ? 'رصاص بالمخالب' : 'رصاص في التالي'} />
      {droppers.map((x, i) => (
        <g key={x}>
          <Swivel x={x} y={46} />
          <line x1={x - 5} y1="48" x2={x - 38} y2="88" stroke={LEADER} stroke-width="1.3" />
          <Hook x={x - 38} y={100} />
          <Worm x={x - 38} y={100} />
          {i === 0 && <Label x={x - 30} y={62} t="فرع 30–60 سم" anchor="end" />}
        </g>
      ))}
      <Label x={droppers[droppers.length - 1] - 44} y={146} t="صنارة" />
    </>
  )
}

function Float() {
  return (
    <>
      <path d="M0 52 Q30 46 60 52 T120 52 T180 52 T240 52 T300 52 T360 52" fill="none" stroke="var(--deep)" stroke-width="1.6" />
      <path d="M0 52 Q30 46 60 52 T120 52 T180 52 T240 52 T300 52 T360 52 V150 H0Z" class="rig-water" />
      <line x1="355" y1="18" x2="196" y2="36" stroke={MAIN} stroke-width="1.8" />
      <Label x={318} y={14} t="الخيط 0.18" />
      <g transform="translate(190 50)">
        <line x1="0" y1="-24" x2="0" y2="-14" stroke={MAIN} stroke-width="1.8" />
        <ellipse cx="0" cy="-6" rx="5.5" ry="9" fill="#fff" stroke="#5f6b72" stroke-width="1.2" />
        <path d="M-5.5 -6 a5.5 9 0 0 1 11 0z" fill="var(--flare)" />
      </g>
      <Label x={190} y={20} t="فلوتور" />
      <line x1="190" y1="59" x2="190" y2="110" stroke={LEADER} stroke-width="1.3" />
      <circle cx="190" cy="80" r="3" fill={LEAD} />
      <circle cx="190" cy="92" r="2.5" fill={LEAD} />
      <Label x={200} y={90} t="رصاص صغير" anchor="start" />
      <Hook x={190} y={122} />
      <path d="M186 110 q-5 4 -2 8" fill="none" stroke="#e8d7a6" stroke-width="5" stroke-linecap="round" />
      <Label x={200} y={126} t="صنارة صغيرة" anchor="start" />
      <path d="M130 56 V120 M125 61 l5 -5 5 5 M125 115 l5 5 5 -5" fill="none" stroke="var(--ink-soft)" stroke-width="1.3" />
      <Label x={122} y={92} t="نص متر لمتر ونص" anchor="end" />
    </>
  )
}

const TITLES: Record<RigId, string> = {
  sliding: 'رسم التركيبة المنزلقة',
  twoHook: 'رسم التركيبة بفرعين',
  longLeader: 'رسم البادولين الطويل',
  grip: 'رسم تركيبة البحر الهايج',
  nightBig: 'رسم تركيبة الحوت الكبير',
  float: 'رسم التركيبة بالفلوتور',
  rock: 'رسم التركيبة القصيرة للصخر',
  liveBait: 'رسم تركيبة الحوتة الحيّة',
}

export function RigDiagram({ id }: { id: RigId }) {
  let body
  switch (id) {
    case 'sliding': body = <Sliding leader="1.5–3 م" hookX={70} />; break
    case 'longLeader': body = <Sliding leader="3–5 م طويل" hookX={30} sinkerLabel="رصاص خفيف" sinkerSize={0.8} />; break
    case 'nightBig': body = <Sliding leader="0.50" hookX={80} bait="fish" bigHook mainLabel="خيط غليظ" sinkerLabel="رصاص" />; break
    case 'rock': body = <Sliding leader="قصير" hookX={150} weakLink />; break
    case 'liveBait': body = <Sliding leader="متر" hookX={80} bait="live" sinkerLabel="رصاص خفيف" sinkerSize={0.75} bigHook />; break
    case 'twoHook': body = <Paternoster droppers={[260, 170]} />; break
    case 'grip': body = <Paternoster droppers={[200]} grip />; break
    case 'float': body = <Float />; break
  }
  return (
    <svg class="rig-diagram" viewBox="0 0 360 150" role="img" aria-label={TITLES[id]}>
      {body}
    </svg>
  )
}
