import { useState } from 'preact/hooks'
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBeach,
  IconBrandGoogleMaps,
  IconClock,
  IconCloud,
  IconFishHook,
  IconMapPin,
  IconMoonStars,
  IconMountain,
  IconNavigation,
  IconRipple,
  IconSunrise,
  IconSunset,
  IconSwimming,
  IconTemperatureSun,
  IconWaveSine,
  IconWeight,
  IconWind,
  IconWindsock,
} from '@tabler/icons-preact'
import { REGIONS, type RegionId } from '../data/spots'
import { BAITS, RIGS } from '../data/tackle'
import type { DayResult, SpotDay, WindowResult } from '../lib/score'
import { compass, moonName, seaText, STAR_WORDS } from '../lib/text'
import { dateLabel, dayLabel, fmtTime, weekday } from '../lib/time'
import { Moon, Stars, Strip, WindArrow, range } from './bits'
import { BaitIcon, IconFishSide, IconWorm, NoteIcon, WindowIcon } from './icons'
import { SpotMap, directionsUrl, googleMapsUrl } from './map'
import { RigDiagram } from './rigs'

/** A region, everything, or only spots with rocks to fish from (rock or mixed bottom). */
export type Region = RegionId | 'all' | 'rocks'

const inRegion = (s: SpotDay, r: Region) =>
  r === 'all' || (r === 'rocks' ? s.spot.bottom !== 'sand' : s.spot.region === r)
const I = { size: 20, stroke: 2 }

// ---------------- shared ----------------

export function RegionChips({ value, onChange }: { value: Region; onChange: (r: Region) => void }) {
  const opts: { id: Region; name: string }[] = [{ id: 'all', name: 'الكل' }, { id: 'rocks', name: 'فيها صخر' }, ...REGIONS]
  return (
    <nav class="chips" aria-label="الجهة">
      {opts.map((o) => (
        <button key={o.id} class="chip" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.id === 'all' ? null : o.id === 'rocks' ? <IconMountain size={16} stroke={2} /> : <IconMapPin size={16} stroke={2} />}
          {o.name}
        </button>
      ))}
    </nav>
  )
}

function BackBar({ href, label }: { href: string; label: string }) {
  return (
    <a class="back" href={href}>
      <IconArrowRight {...I} /> {label}
    </a>
  )
}

function DateLine({ date, today }: { date: string; today: string }) {
  const label = dayLabel(date, today)
  return (
    <p class="day-date">
      {label === weekday(date) ? '' : `${weekday(date)} `}
      {dateLabel(date)}
    </p>
  )
}

// ---------------- home ----------------

export function Home({ days, today, now, region, setRegion }: {
  days: DayResult[]
  today: string
  now: number
  region: Region
  setRegion: (r: Region) => void
}) {
  return (
    <>
      <RegionChips value={region} onChange={setRegion} />
      <ol class="days">
        {days.map((d) => {
          const best = d.spots.find((s) => inRegion(s, region))
          if (!best) return null
          const w = best.best
          return (
            <li key={d.date}>
              <a class={`day-card s${best.stars}`} href={`#/day/${d.date}`}>
                <div class="day-head">
                  <div>
                    <h2 class="day-name">{dayLabel(d.date, today)}</h2>
                    <DateLine date={d.date} today={today} />
                  </div>
                  <div class="day-score">
                    <Stars n={best.stars} size="lg" />
                    <span class="star-word">{STAR_WORDS[best.stars]}</span>
                  </div>
                </div>
                <dl class="day-best">
                  <div>
                    <dt>
                      <IconMapPin size={15} stroke={2} /> أحسن بلاصة
                    </dt>
                    <dd>{best.spot.name}</dd>
                  </div>
                  <div>
                    <dt>
                      <WindowIcon id={w.id} size={15} /> أحسن وقت
                    </dt>
                    <dd>
                      {w.name} <span class="time">{range(w.primeStart, w.primeEnd)}</span>
                    </dd>
                  </div>
                </dl>
                <Strip hours={best.strip} sunrise={best.sunrise} sunset={best.sunset} now={now} />
                <p class="day-cond">
                  <span>
                    <IconWind size={17} stroke={2} /> {compass(w.cond.windDir)} {Math.round(w.cond.wind)} كم/س
                    <WindArrow from={w.cond.windDir} size={15} />
                  </span>
                  <span>
                    <IconRipple size={17} stroke={2} /> موج {w.cond.effHs.toFixed(1)} م
                  </span>
                  <span>
                    <Moon phase={d.moon.phase} size={18} /> {moonName(d.moon.phase, d.moon.illum)}
                  </span>
                </p>
                {w.fish.length > 0 && (
                  <p class="day-fish">
                    <IconFishSide size={17} /> {w.fish.slice(0, 3).map((f) => f.species.name).join('، ')}
                  </p>
                )}
              </a>
            </li>
          )
        })}
      </ol>
    </>
  )
}

// ---------------- day ----------------

export function DayView({ day, today, now, region, setRegion }: {
  day: DayResult
  today: string
  now: number
  region: Region
  setRegion: (r: Region) => void
}) {
  const spots = day.spots.filter((s) => inRegion(s, region))
  const any = day.spots[0]
  return (
    <>
      <BackBar href="#/" label="السبعة أيام" />
      <header class="page-head">
        <h1>
          {dayLabel(day.date, today)} <span class="muted">{dateLabel(day.date)}</span>
        </h1>
        <ul class="sky">
          <li>
            <IconSunrise {...I} /> طلوع {fmtTime(any.sunrise)}
          </li>
          <li>
            <IconSunset {...I} /> غروب {fmtTime(any.sunset)}
          </li>
          <li>
            <Moon phase={day.moon.phase} size={20} /> {moonName(day.moon.phase, day.moon.illum)} ({Math.round(day.moon.illum * 100)}%)
          </li>
          {day.majors.length > 0 && (
            <li>
              <IconMoonStars {...I} /> وقت القمرة القوي: {day.majors.map(fmtTime).join(' و ')}
            </li>
          )}
        </ul>
      </header>
      <RegionChips value={region} onChange={setRegion} />
      <SpotMap
        height={260}
        points={spots.map((s) => ({
          id: s.spot.id,
          lat: s.spot.lat,
          lon: s.spot.lon,
          label: s.spot.name,
          stars: s.stars,
          href: `#/day/${day.date}/${s.spot.id}`,
        }))}
      />
      <p class="map-hint">
        <IconMapPin size={15} stroke={2} /> الرقم في كل بلاصة هو عدد النجوم. دزّ عليه باش تحلّ التفاصيل.
      </p>
      <ol class="spots">
        {spots.map((s) => (
          <li key={s.spot.id}>
            <a class="spot-row" href={`#/day/${day.date}/${s.spot.id}`}>
              <div class="spot-top">
                <h2>
                  {s.spot.name}
                  {s.spot.bottom !== 'sand' && (
                    <span class="badge">
                      <IconMountain size={13} stroke={2} /> {s.spot.bottom === 'rock' ? 'صخر' : 'رملة وصخر'}
                    </span>
                  )}
                </h2>
                <Stars n={s.stars} />
              </div>
              <p class="spot-best">
                {s.best.danger && (
                  <strong class="warn">
                    <IconAlertTriangle size={16} stroke={2} /> خطر
                  </strong>
                )}
                <WindowIcon id={s.best.id} size={17} /> {s.best.name} <span class="time">{range(s.best.primeStart, s.best.primeEnd)}</span>
                <span class="sep">·</span>
                <IconRipple size={17} stroke={2} /> {seaText(s.best.cond.effHs)}
              </p>
              <Strip hours={s.strip} sunrise={s.sunrise} sunset={s.sunset} now={now} />
            </a>
          </li>
        ))}
      </ol>
    </>
  )
}

// ---------------- spot ----------------

export function SpotView({ day, spot, today, now }: { day: DayResult; spot: SpotDay; today: string; now: number }) {
  const [sel, setSel] = useState(spot.best.id)
  const w = spot.windows.find((x) => x.id === sel) ?? spot.best
  const { lat, lon } = spot.spot
  return (
    <>
      <BackBar href={`#/day/${day.date}`} label={`كل البلايص ${dayLabel(day.date, today)}`} />
      <header class="page-head">
        <h1>{spot.spot.name}</h1>
        <p class="muted icon-line">
          {dayLabel(day.date, today)} {dateLabel(day.date)}
          <span class="sep">·</span>
          <IconBeach size={18} stroke={2} /> {bottomName(spot.spot.bottom)}
        </p>
        <div class="spot-score">
          <Stars n={spot.stars} size="lg" />
          <span class="star-word">{STAR_WORDS[spot.stars]}</span>
        </div>
        <Strip hours={spot.strip} sunrise={spot.sunrise} sunset={spot.sunset} now={now} />
      </header>

      <section class="place">
        <SpotMap points={[{ id: spot.spot.id, lat, lon, label: spot.spot.name, stars: spot.stars }]} height={200} zoom={12} />
        <div class="place-actions">
          <a class="btn" href={directionsUrl(lat, lon)} target="_blank" rel="noopener">
            <IconNavigation {...I} /> الطريق
          </a>
          <a class="btn ghost" href={googleMapsUrl(lat, lon)} target="_blank" rel="noopener">
            <IconBrandGoogleMaps {...I} /> Google Maps
          </a>
        </div>
      </section>

      <div class="tabs" role="tablist" aria-label="وقت الصيد">
        {spot.windows.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === w.id}
            class={`tab${x.past ? ' past' : ''}${x.danger ? ' danger' : ''}`}
            onClick={() => setSel(x.id)}
          >
            <WindowIcon id={x.id} size={22} />
            <span class="tab-name">{x.name}</span>
            <Stars n={x.stars} size="sm" />
            {x.past ? <span class="tab-flag">فات</span> : x.danger ? <span class="tab-flag">خطر</span> : null}
          </button>
        ))}
      </div>

      <WindowDetail w={w} />
    </>
  )
}

function bottomName(b: string) {
  return b === 'sand' ? 'قاع رملة' : b === 'rock' ? 'قاع صخر' : 'رملة وصخر'
}

function WindowDetail({ w }: { w: WindowResult }) {
  const rig = RIGS[w.rig]
  const danger = w.notes.find((n) => n.k === 'danger')
  return (
    <section class="detail" role="tabpanel">
      <p class="prime">
        <span class="prime-label">
          <IconClock size={16} stroke={2} /> أحسن وقت
        </span>
        <span class="prime-time">{range(w.primeStart, w.primeEnd)}</span>
      </p>
      {danger && (
        <p class="alert">
          <IconAlertTriangle size={22} stroke={2} /> {danger.t}
        </p>
      )}

      <h3>
        <IconFishSide size={20} /> الحوت اللي ينجم يطلع
      </h3>
      {w.fish.length ? (
        <ul class="fish">
          {w.fish.map((f) => (
            <li key={f.species.id}>
              <div class="fish-top">
                <strong>
                  <IconFishSide size={24} class="fish-ico" /> {f.species.name}
                </strong>
                <Meter value={f.fit} />
              </div>
              <p>{f.species.note}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p class="muted">الوقت هذا ما فيهش حوت يستاهل. شوف وقت آخر.</p>
      )}

      <h3>
        <IconWorm size={20} /> الطعم
      </h3>
      <ul class="baits">
        {w.baits.map((b) => (
          <li key={b}>
            <span class="bait-ico">
              <BaitIcon id={b} />
            </span>
            <div>
              <strong>{BAITS[b].name}</strong>
              <span>{BAITS[b].tip}</span>
            </div>
          </li>
        ))}
      </ul>

      <h3>
        <IconFishHook {...I} /> التركيبة
      </h3>
      <div class="rig">
        <strong>{rig.name}</strong>
        <RigDiagram id={w.rig} />
        <p>{rig.how}</p>
        <dl>
          <div>
            <dt>
              <IconFishHook size={15} stroke={2} /> الصنارة
            </dt>
            <dd>{rig.hook}</dd>
          </div>
          <div>
            <dt>
              <IconWeight size={15} stroke={2} /> الرصاص
            </dt>
            <dd>{w.sinker}</dd>
          </div>
        </dl>
      </div>

      <h3>
        <IconCloud {...I} /> البحر والطقس
      </h3>
      <ul class="notes">
        {w.notes
          .filter((n) => n.k !== 'danger')
          .map((n, i) => (
            <li key={i} class={`note-${n.k}`}>
              <NoteIcon k={n.k} />
              <span>{n.t}</span>
            </li>
          ))}
      </ul>
      <dl class="cond">
        <Cond icon={<IconRipple {...I} />} label="الموج في الشط" value={`${w.cond.effHs.toFixed(1)} م`} />
        <Cond icon={<IconWaveSine {...I} />} label="الموج في البحر" value={`${w.cond.hs.toFixed(1)} م`} />
        <Cond
          icon={<IconWind {...I} />}
          label={`الريح ${compass(w.cond.windDir)}`}
          value={
            <>
              {Math.round(w.cond.wind)} كم/س <WindArrow from={w.cond.windDir} size={16} />
            </>
          }
        />
        <Cond icon={<IconWindsock {...I} />} label="الرّفّات" value={`${Math.round(w.cond.gust)} كم/س`} />
        <Cond icon={<IconSwimming {...I} />} label="سخانة الماء" value={`${w.cond.sst.toFixed(0)}°`} />
        <Cond icon={<IconTemperatureSun {...I} />} label="سخانة الهواء" value={`${w.cond.airTemp.toFixed(0)}°`} />
      </dl>
    </section>
  )
}

function Cond({ icon, label, value }: { icon: preact.ComponentChildren; label: string; value: preact.ComponentChildren }) {
  return (
    <div>
      <dt>
        {icon}
        {label}
      </dt>
      <dd>{value}</dd>
    </div>
  )
}

function Meter({ value }: { value: number }) {
  const n = value >= 0.6 ? 3 : value >= 0.4 ? 2 : 1
  const label = ['', 'ينجم', 'فرصة باهية', 'فرصة كبيرة'][n]
  return (
    <span class="meter" aria-label={label}>
      <span class={`meter-bars m${n}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {label}
    </span>
  )
}

// ---------------- all rigs ----------------

export function RigsView() {
  return (
    <>
      <BackBar href="#/" label="السبعة أيام" />
      <header class="page-head">
        <h1>
          <IconFishHook size={26} stroke={2} /> كل التركيبات
        </h1>
        <p class="muted">القصبة على اليمين، والبحر على اليسار.</p>
      </header>
      <ul class="rig-list">
        {(Object.keys(RIGS) as (keyof typeof RIGS)[]).map((id) => (
          <li key={id} class="rig">
            <strong>{RIGS[id].name}</strong>
            <RigDiagram id={id} />
            <p>{RIGS[id].how}</p>
            <p class="icon-line">
              <IconFishHook size={16} stroke={2} /> الصنارة: {RIGS[id].hook}
            </p>
          </li>
        ))}
      </ul>
    </>
  )
}
