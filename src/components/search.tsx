import { useState } from 'preact/hooks'
import { IconSearch, IconX } from '@tabler/icons-preact'
import { SPOTS, KIND_NAMES, areaOf } from '../data/spots'

/** Loose Arabic matching: ignore hamza forms, ta marbuta, alef maqsura, shadda and short vowels. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
}

const INDEX = SPOTS.map((spot) => ({ spot, key: norm(`${spot.name} ${areaOf(spot).name} ${spot.id}`) }))

/** Search box: type part of a spot or area name and jump to that spot for the given day. */
export function SpotSearch({ date }: { date: string }) {
  const [q, setQ] = useState('')
  const nq = norm(q)
  const hits = nq.length < 2 ? [] : INDEX.filter((x) => nq.split(' ').every((w) => x.key.includes(w))).slice(0, 8)

  return (
    <div class="search" role="search">
      <label class="search-box">
        <IconSearch size={20} stroke={2} />
        <input
          type="search"
          value={q}
          onInput={(e) => setQ((e.target as HTMLInputElement).value)}
          placeholder="لوّج على بلاصة: المرسى، لا قروت…"
          aria-label="لوّج على بلاصة"
          enterKeyHint="search"
        />
        {q && (
          <button class="search-clear" onClick={() => setQ('')} aria-label="فسّخ">
            <IconX size={18} stroke={2} />
          </button>
        )}
      </label>
      {nq.length >= 2 && (
        <ul class="search-hits">
          {hits.length ? (
            hits.map(({ spot }) => (
              <li key={spot.id}>
                <a href={`#/day/${date}/${spot.id}`} onClick={() => setQ('')}>
                  <strong>{spot.name}</strong>
                  <span>
                    {areaOf(spot).name} · {KIND_NAMES[spot.kind]}
                  </span>
                </a>
              </li>
            ))
          ) : (
            <li class="search-none">ما لقيتش. جرّب اسم المنطقة.</li>
          )}
        </ul>
      )}
    </div>
  )
}
