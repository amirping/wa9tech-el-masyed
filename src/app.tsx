import { useEffect, useMemo, useState } from 'preact/hooks'
import { cachedForecast, fetchForecast, isStale, type Forecast } from './lib/api'
import { analyse } from './lib/score'
import { fmtTime, localDate } from './lib/time'
import { IconClock, IconFishHook, IconHeart, IconRefresh, IconWifiOff } from '@tabler/icons-preact'
import { ShareButton } from './components/share'
import { DayView, Home, RigsView, SpotView, type Region } from './components/views'

const REGION_KEY = 'masyed-region'

function readRegion(): Region {
  try {
    return (localStorage.getItem(REGION_KEY) as Region) || 'all'
  } catch {
    return 'all'
  }
}

function useHash() {
  const [hash, setHash] = useState(location.hash)
  useEffect(() => {
    const on = () => {
      setHash(location.hash)
      window.scrollTo(0, 0)
    }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])
  return hash
}

export function App() {
  const [forecast, setForecast] = useState<Forecast | null>(() => cachedForecast())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [region, setRegionState] = useState<Region>(readRegion)
  const hash = useHash()

  const setRegion = (r: Region) => {
    setRegionState(r)
    try {
      localStorage.setItem(REGION_KEY, r)
    } catch {
      // Not critical: the filter just resets next time.
    }
  }

  const refresh = async () => {
    setLoading(true)
    setError(false)
    try {
      setForecast(await fetchForecast())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!forecast || isStale(forecast)) refresh()
  }, [])

  const now = Date.now()
  const today = localDate(now)
  const days = useMemo(() => (forecast ? analyse(forecast, now) : []), [forecast])

  // Routes: #/  ·  #/day/2026-09-23  ·  #/day/2026-09-23/kelibia
  const [, dayId, spotId] = hash.match(/^#\/day\/([\d-]+)(?:\/(\w+))?/) ?? []
  const day = dayId ? days.find((d) => d.date === dayId) : undefined
  const spot = day && spotId ? day.spots.find((s) => s.spot.id === spotId) : undefined

  return (
    <div class="shell">
      <header class="masthead">
        <a href="#/" class="brand">
          <h1>
            <IconFishHook size={30} stroke={2} class="brand-ico" /> وقتاش المصيد
          </h1>
          <p>الصيد بالقصبة في الشط، من كاب نيقرو لهرقلة</p>
        </a>
        <div class="status">
          {forecast && (
            <span class="updated">
              <IconClock size={16} stroke={2} /> آخر نشرة {fmtTime(forecast.fetchedAt)}
            </span>
          )}
          <button class="refresh" onClick={refresh} disabled={loading}>
            <IconRefresh size={18} stroke={2} class={loading ? 'spin' : undefined} />
            {loading ? 'قاعد نحدّث…' : 'حدّث'}
          </button>
          <ShareButton />
        </div>
      </header>

      <main>
        {error && (
          <p class="banner" role="alert">
            <IconWifiOff size={20} stroke={2} />
            {forecast
              ? `ما نجمتش نحدّث (ما فماش إنترنت؟). هاذي نشرة ${fmtTime(forecast.fetchedAt)}.`
              : 'ما نجمتش نجيب الطقس. ثبّت في الإنترنت وعاود.'}
          </p>
        )}
        {!forecast && loading && <p class="loading">قاعد نجيب الطقس والبحر لـ 24 بلاصة…</p>}
        {!forecast && error && (
          <button class="refresh big" onClick={refresh}>
            عاود
          </button>
        )}

        {hash === '#/rigs' ? (
          <RigsView />
        ) : days.length > 0 &&
          (spot && day ? (
            <SpotView key={`${day.date}-${spot.spot.id}`} day={day} spot={spot} today={today} now={now} />
          ) : day ? (
            <DayView day={day} today={today} now={now} region={region} setRegion={setRegion} />
          ) : (
            <Home days={days} today={today} now={now} region={region} setRegion={setRegion} />
          ))}
      </main>

      <footer class="foot">
        <p>
          <a href="#/rigs" class="foot-link">
            <IconFishHook size={16} stroke={2} /> كل التركيبات
          </a>
        </p>
        <p>البحر يتبدّل: ديما شوف بعينك قبل ما تدخل.</p>
        <p class="dedication">
          <IconHeart size={16} stroke={2} /> عملها أمير لبوه سي مختار. ربي يجيب الخير في كل خرجة.
        </p>
      </footer>
    </div>
  )
}
