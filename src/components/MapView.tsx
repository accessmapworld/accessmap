import { useEffect, useRef } from 'react'
import L from 'leaflet'
import type { Place } from '../types'
import { categoryColor, type Poi } from '../lib/overpass'

interface Props {
  places: Place[]
  pois?: Poi[]
  alertPlaceIds: Set<string>
  userLocation?: { lat: number; lng: number } | null
  focus?: { lat: number; lng: number; zoom?: number } | null
  onSelect?: (place: Place) => void
  onCenterChange?: (lat: number, lng: number) => void
  className?: string
}

function teardrop(color: string, dot = '#fff') {
  return L.divIcon({
    className: 'am-pin',
    html: `<div style="animation:pinDrop 460ms cubic-bezier(0.34,1.56,0.64,1) both">
      <svg width="28" height="36" viewBox="0 0 24 30" fill="none" style="filter:drop-shadow(0 2px 3px rgba(60,64,67,0.4))">
        <path d="M12 0C6 0 1.5 4.5 1.5 10.5c0 7.5 10.5 19 10.5 19s10.5-11.5 10.5-19C22.5 4.5 18 0 12 0Z" fill="${color}"/>
        <circle cx="12" cy="10.5" r="3.4" fill="${dot}"/>
      </svg></div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
  })
}

const PLACE_ICON = teardrop('#0ABFBF')
const ALERT_ICON = teardrop('#f9ab00')

const SPONSOR_ICON = L.divIcon({
  className: 'am-pin',
  html: `<div style="animation:pinDrop 460ms cubic-bezier(0.34,1.56,0.64,1) both">
    <svg width="34" height="42" viewBox="0 0 24 30" fill="none" style="filter:drop-shadow(0 2px 4px rgba(180,140,0,0.55))">
      <path d="M12 0C6 0 1.5 4.5 1.5 10.5c0 7.5 10.5 19 10.5 19s10.5-11.5 10.5-19C22.5 4.5 18 0 12 0Z" fill="#f5b50a"/>
      <path d="M12 5.2l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff"/>
    </svg></div>`,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
})
const poiIconCache = new Map<string, L.DivIcon>()
const poiIcon = (color: string) => {
  let ic = poiIconCache.get(color)
  if (!ic) { ic = teardrop(color); poiIconCache.set(color, ic) }
  return ic
}

const gmaps = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

export default function MapView({ places, pois = [], alertPlaceIds, userLocation, focus, onSelect, onCenterChange, className }: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const placeLayer = useRef<L.LayerGroup | null>(null)
  const poiLayer = useRef<L.LayerGroup | null>(null)
  const userMarker = useRef<L.Marker | null>(null)
  const onCenterRef = useRef(onCenterChange)
  onCenterRef.current = onCenterChange

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, { zoomControl: true, attributionControl: false }).setView([39.5, -20], 3)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
    placeLayer.current = L.layerGroup().addTo(map)
    poiLayer.current = L.layerGroup().addTo(map)
    mapRef.current = map
    const emit = () => { const c = map.getCenter(); onCenterRef.current?.(c.lat, c.lng) }
    map.on('moveend', emit)
    emit()
    setTimeout(() => map.invalidateSize(), 100)
    return () => { map.remove(); mapRef.current = null }
  }, [])

  // accessibility seed places (teal / amber when alert) → click selects
  useEffect(() => {
    const layer = placeLayer.current
    if (!layer) return
    layer.clearLayers()
    places.forEach((p) => {
      const icon = p.sponsored ? SPONSOR_ICON : alertPlaceIds.has(p.id) ? ALERT_ICON : PLACE_ICON
      const m = L.marker([p.lat, p.lng], { icon })
      m.bindTooltip(p.sponsored ? `★ ${p.name}` : p.name, { direction: 'top', offset: [0, -34] })
      m.on('click', () => onSelect?.(p))
      m.addTo(layer)
    })
  }, [places, alertPlaceIds, onSelect])

  // category POIs (red) → popup with directions
  useEffect(() => {
    const layer = poiLayer.current
    if (!layer) return
    layer.clearLayers()
    pois.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: poiIcon(categoryColor(p.category)) })
      m.bindPopup(
        `<div style="min-width:160px">
          <strong style="font-size:14px;color:#202124">${p.name}</strong>
          ${p.address ? `<div style="color:#5f6368;font-size:12px;margin-top:2px">${p.address}</div>` : ''}
          <a href="${gmaps(p.lat, p.lng)}" target="_blank" rel="noreferrer"
            style="display:inline-block;margin-top:8px;color:#1a73e8;font-size:13px;font-weight:600">Directions ↗</a>
        </div>`,
      )
      m.addTo(layer)
    })
  }, [pois])

  // user location blue dot
  useEffect(() => {
    if (!mapRef.current) return
    userMarker.current?.remove()
    if (!userLocation) return
    userMarker.current = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.divIcon({
        className: 'am-user',
        html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:#1a73e8;border:3px solid #fff;box-shadow:0 0 0 2px rgba(26,115,232,0.4),0 1px 4px rgba(0,0,0,0.3)"></span>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      }),
    }).addTo(mapRef.current).bindTooltip('You are here')
  }, [userLocation])

  useEffect(() => {
    if (focus && mapRef.current) mapRef.current.flyTo([focus.lat, focus.lng], focus.zoom ?? 15, { duration: 1 })
  }, [focus])

  return <div ref={elRef} className={className ?? 'h-full w-full'} />
}
