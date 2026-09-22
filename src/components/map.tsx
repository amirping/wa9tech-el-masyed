import { useEffect, useRef } from 'preact/hooks'
import type { Map as LeafletMap } from 'leaflet'

export interface MapPoint {
  id: string
  lat: number
  lon: number
  label: string
  stars?: number
  href?: string
}

/**
 * OpenStreetMap via Leaflet: free, no key. Leaflet is loaded only when a map is shown,
 * so the day list stays light. Each pin shows the spot's star count.
 */
export function SpotMap({ points, height = 220, zoom }: { points: MapPoint[]; height?: number; zoom?: number }) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<LeafletMap | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [{ default: L }] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')])
      if (cancelled || !el.current) return
      const m = L.map(el.current, { zoomControl: true, attributionControl: true, scrollWheelZoom: false })
      map.current = m
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap',
      }).addTo(m)

      for (const p of points) {
        const icon = L.divIcon({
          className: '',
          html: `<div class="pin s${p.stars ?? 0}"><span>${p.stars ?? ''}</span></div>`,
          iconSize: [30, 38],
          iconAnchor: [15, 36],
        })
        const marker = L.marker([p.lat, p.lon], { icon, title: p.label, keyboard: true }).addTo(m)
        marker.bindTooltip(p.label, { direction: 'top', offset: [0, -34] })
        if (p.href) marker.on('click', () => (location.hash = p.href!))
      }

      if (points.length === 1) m.setView([points[0].lat, points[0].lon], zoom ?? 13)
      else m.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lon] as [number, number])), { padding: [24, 24] })
    })()
    return () => {
      cancelled = true
      map.current?.remove()
      map.current = null
    }
  }, [points.map((p) => `${p.id}:${p.stars}`).join(',')])

  // Leaflet lays out controls for left-to-right pages, so the map box stays LTR.
  return <div ref={el} class="map" dir="ltr" style={{ height }} />
}

export const googleMapsUrl = (lat: number, lon: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
export const directionsUrl = (lat: number, lon: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
