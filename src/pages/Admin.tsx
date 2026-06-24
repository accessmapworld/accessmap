import { useEffect, useState } from 'react'
import { Check, X, ShieldAlert } from 'lucide-react'
import Layout from '../components/Layout'
import { getAlerts, getPlaces, resolveAlert } from '../lib/data'
import { useStore } from '../store/useStore'
import { scoreColor } from '../components/ScoreRing'
import type { Alert, Place } from '../types'

export default function Admin() {
  const user = useStore((s) => s.user)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [places, setPlaces] = useState<Place[]>([])

  async function load() {
    setAlerts(await getAlerts(undefined, true))
    setPlaces(await getPlaces())
  }
  useEffect(() => { load() }, [])

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="mx-auto max-w-md text-center">
          <ShieldAlert className="mx-auto text-alert" size={40} />
          <h1 className="mt-3 font-display text-2xl">Admin only</h1>
          <p className="mt-1 text-muted">Sign in with an admin account to access this dashboard.</p>
        </div>
      </Layout>
    )
  }

  async function act(id: string) {
    await resolveAlert(id)
    load()
  }

  const queue = alerts.filter((a) => a.photoUrl)
  const placeName = (id: string) => places.find((p) => p.id === id)?.name ?? id

  return (
    <Layout>
      <h1 className="font-display text-3xl">Admin dashboard</h1>

      <section className="mt-8">
        <h2 className="label mb-3">Pending AI verification ({queue.length})</h2>
        {queue.length === 0 && <p className="text-muted">Nothing in the verification queue.</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          {queue.map((a) => (
            <div key={a.id} className="card flex gap-3 p-3">
              <img src={a.photoUrl} alt={`Photo evidence for report at ${placeName(a.placeId)}`} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{placeName(a.placeId)}</p>
                <p className="truncate text-xs text-muted">{a.description}</p>
                <p className="label mt-1">confidence {((a.aiConfidence ?? 0) * 100).toFixed(0)}%</p>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => act(a.id)} className="btn-primary px-2.5 py-1 text-xs"><Check size={14} /> Approve</button>
                  <button onClick={() => act(a.id)} className="btn-ghost px-2.5 py-1 text-xs"><X size={14} /> Reject</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="label mb-3">Active reports ({alerts.length})</h2>
        <div className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="card flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{a.description}</p>
                <p className="label">{placeName(a.placeId)} · {a.type}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => act(a.id)} className="btn-primary px-2.5 py-1 text-xs"><Check size={14} /> Resolve</button>
                <button onClick={() => act(a.id)} className="btn-ghost px-2.5 py-1 text-xs"><X size={14} /> Dismiss</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="label mb-3">Place data ({places.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="label text-left">
                <th className="py-2">Place</th><th>Mob</th><th>Sen</th><th>Hear</th><th>Vis</th>
              </tr>
            </thead>
            <tbody>
              {places.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-2 pr-3">{p.name}</td>
                  {(['mobility', 'sensory', 'hearing', 'vision'] as const).map((k) => (
                    <td key={k} className="font-mono" style={{ color: scoreColor(p.scores[k]) }}>{p.scores[k]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  )
}
