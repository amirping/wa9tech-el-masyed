import { useState } from 'preact/hooks'
import { REGIONS, type RegionId } from '../data/spots'
import { BAITS, RIGS } from '../data/tackle'
import type { DayResult, SpotDay, WindowResult } from '../lib/score'
import { compass, moonName, seaText, STAR_WORDS } from '../lib/text'
import { dateLabel, dayLabel, fmtTime, weekday } from '../lib/time'
import { Moon, Stars, Strip, StripLegend, WindArrow, range } from './bits'

export type Region = RegionId | 'all'

const inRegion = (s: SpotDay, r: Region) => r === 'all' || s.spot.region === r

// ---------------- shared ----------------

export function RegionChips({ value, onChange }: { value: Region; onChange: (r: Region) => void }) {
  const opts: { id: Region; name: string }[] = [{ id: 'all', name: 'الكل' }, ...REGIONS]
  return (
    <nav class="chips" aria-label="الجهة">
      {opts.map((o) => (
        <button key={o.id} class="chip" aria-pressed={value === o.id} onClick={() => onChange(o.id)}>
          {o.name}
        </button>
      ))}
    </nav>
  )
}

function BackBar({ href, label }: { href: string; label: string }) {
  return (
    <a class="back" href={href}>
      <span aria-hidden="true">→</span> {label}
    </a>
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
                    <p class="day-date">{dayLabel(d.date, today) === weekday(d.date) ? '' : `${weekday(d.date)} `}{dateLabel(d.date)}</p>
                  </div>
                  <div class="day-score">
                    <Stars n={best.stars} size="lg" />
                    <span class="star-word">{STAR_WORDS[best.stars]}</span>
                  </div>
                </div>
                <dl class="day-best">
                  <div>
                    <dt>أحسن بلاصة</dt>
                    <dd>{best.spot.name}</dd>
                  </div>
                  <div>
                    <dt>أحسن وقت</dt>
                    <dd>
                      {w.name} <span class="time">{range(w.primeStart, w.primeEnd)}</span>
                    </dd>
                  </div>
                </dl>
                <Strip hours={best.strip} sunrise={best.sunrise} sunset={best.sunset} now={now} />
                <p class="day-cond">
                  <span>
                    <WindArrow from={w.cond.windDir} /> ريح {compass(w.cond.windDir)} {Math.round(w.cond.wind)} كم/س
                  </span>
                  <span>موج {w.cond.effHs.toFixed(1)} م</span>
                  <span>
                    <Moon phase={d.moon.phase} size={20} /> {moonName(d.moon.phase, d.moon.illum)}
                  </span>
                </p>
                {w.fish.length > 0 && (
                  <p class="day-fish">{w.fish.slice(0, 3).map((f) => f.species.name).join('، ')}</p>
                )}
              </a>
            </li>
          )
        })}
      </ol>
      <StripLegend />
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
          <li>☀ طلوع {fmtTime(any.sunrise)}</li>
          <li>غروب {fmtTime(any.sunset)}</li>
          <li>
            <Moon phase={day.moon.phase} size={20} /> {moonName(day.moon.phase, day.moon.illum)} ({Math.round(day.moon.illum * 100)}%)
          </li>
          {day.majors.length > 0 && <li>وقت القمرة القوي: {day.majors.map(fmtTime).join(' و ')}</li>}
        </ul>
      </header>
      <RegionChips value={region} onChange={setRegion} />
      <ol class="spots">
        {spots.map((s) => (
          <li key={s.spot.id}>
            <a class="spot-row" href={`#/day/${day.date}/${s.spot.id}`}>
              <div class="spot-top">
                <h2>{s.spot.name}</h2>
                <Stars n={s.stars} />
              </div>
              <p class="spot-best">
                {s.best.danger ? <strong class="warn">خطر</strong> : null} {s.best.name}{' '}
                <span class="time">{range(s.best.primeStart, s.best.primeEnd)}</span> · {seaText(s.best.cond.effHs)}
              </p>
              <Strip hours={s.strip} sunrise={s.sunrise} sunset={s.sunset} now={now} />
            </a>
          </li>
        ))}
      </ol>
      <StripLegend />
    </>
  )
}

// ---------------- spot ----------------

export function SpotView({ day, spot, today, now }: { day: DayResult; spot: SpotDay; today: string; now: number }) {
  const [sel, setSel] = useState(spot.best.id)
  const w = spot.windows.find((x) => x.id === sel) ?? spot.best
  return (
    <>
      <BackBar href={`#/day/${day.date}`} label={`كل البلايص ${dayLabel(day.date, today)}`} />
      <header class="page-head">
        <h1>{spot.spot.name}</h1>
        <p class="muted">
          {dayLabel(day.date, today)} {dateLabel(day.date)} · {bottomName(spot.spot.bottom)}
        </p>
        <div class="spot-score">
          <Stars n={spot.stars} size="lg" />
          <span class="star-word">{STAR_WORDS[spot.stars]}</span>
        </div>
        <Strip hours={spot.strip} sunrise={spot.sunrise} sunset={spot.sunset} now={now} />
      </header>

      <div class="tabs" role="tablist" aria-label="وقت الصيد">
        {spot.windows.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === w.id}
            class={`tab${x.past ? ' past' : ''}${x.danger ? ' danger' : ''}`}
            onClick={() => setSel(x.id)}
          >
            <span class="tab-name">{x.name}</span>
            <Stars n={x.stars} size="sm" />
            {x.past ? <span class="tab-past">فات</span> : x.danger ? <span class="tab-past">خطر</span> : null}
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
  return (
    <section class="detail" role="tabpanel">
      <p class="prime">
        <span class="prime-label">أحسن وقت</span>
        <span class="prime-time">{range(w.primeStart, w.primeEnd)}</span>
      </p>
      {w.danger && <p class="alert">{w.notes[0]}</p>}

      <h3>الحوت اللي ينجم يطلع</h3>
      {w.fish.length ? (
        <ul class="fish">
          {w.fish.map((f) => (
            <li key={f.species.id}>
              <div class="fish-top">
                <strong>{f.species.name}</strong>
                <Meter value={f.fit} />
              </div>
              <p>{f.species.note}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p class="muted">الوقت هذا ما فيهش حوت يستاهل. شوف وقت آخر.</p>
      )}

      <h3>الطعم</h3>
      <ul class="baits">
        {w.baits.map((b) => (
          <li key={b}>
            <strong>{BAITS[b].name}</strong>
            <span>{BAITS[b].tip}</span>
          </li>
        ))}
      </ul>

      <h3>التركيبة</h3>
      <div class="rig">
        <strong>{rig.name}</strong>
        <p>{rig.how}</p>
        <dl>
          <div>
            <dt>الصنارة</dt>
            <dd>{rig.hook}</dd>
          </div>
          <div>
            <dt>البلومب</dt>
            <dd>{w.sinker}</dd>
          </div>
        </dl>
      </div>

      <h3>البحر والطقس</h3>
      <ul class="notes">
        {w.notes.map((n, i) => (w.danger && i === 0 ? null : <li key={i}>{n}</li>))}
      </ul>
      <dl class="cond">
        <div>
          <dt>الموج في الشط</dt>
          <dd>{w.cond.effHs.toFixed(1)} م</dd>
        </div>
        <div>
          <dt>الموج في البحر</dt>
          <dd>{w.cond.hs.toFixed(1)} م</dd>
        </div>
        <div>
          <dt>الريح</dt>
          <dd>
            <WindArrow from={w.cond.windDir} /> {Math.round(w.cond.wind)} كم/س
          </dd>
        </div>
        <div>
          <dt>الرّفّات</dt>
          <dd>{Math.round(w.cond.gust)} كم/س</dd>
        </div>
        <div>
          <dt>سخانة الماء</dt>
          <dd>{w.cond.sst.toFixed(0)}°</dd>
        </div>
        <div>
          <dt>سخانة الهواء</dt>
          <dd>{w.cond.airTemp.toFixed(0)}°</dd>
        </div>
      </dl>
    </section>
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
