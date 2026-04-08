import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFriends } from '../hooks/useFriends'
import ProgressRing from './ProgressRing'
import MacroBar from './MacroBar'
import Avatar from './Avatar'

const MEAL_TYPES = [
  ['breakfast', 'Завтрак'],
  ['lunch', 'Обед'],
  ['dinner', 'Ужин'],
  ['snack', 'Перекус'],
]

const SOURCE_ICON = { photo: '📷', chat: '💬', manual: '✏️' }

function fmtDate(d) {
  const t = new Date(); t.setHours(0,0,0,0)
  const day = new Date(d); day.setHours(0,0,0,0)
  const diff = (day - t) / 86400000
  if (diff === 0) return 'Сегодня'
  if (diff === -1) return 'Вчера'
  return day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function FriendDashboard({ user }) {
  const { id } = useParams()
  const { getFriendSummary } = useFriends(user)
  const [date, setDate] = useState(() => new Date())
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false
    setSummary(null); setError(null)
    getFriendSummary(id, date)
      .then((s) => { if (!ignore) setSummary(s) })
      .catch((e) => { if (!ignore) setError(e.message || String(e)) })
    return () => { ignore = true }
  }, [id, date]) // eslint-disable-line

  const shift = (n) => { const d = new Date(date); d.setDate(d.getDate() + n); setDate(d) }

  const profile = summary?.profile
  const totals = summary?.totals || { calories: 0, protein: 0, fat: 0, carbs: 0 }
  const meals = summary?.meals || []

  const grouped = MEAL_TYPES.map(([key, label]) => ({
    key, label, items: meals.filter((m) => m.meal_type === key),
  }))

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <Link to="/friends" className="opacity-70 hover:opacity-100">← Назад</Link>
        <div className="flex items-center gap-2">
          <Avatar url={profile?.avatar_url} name={profile?.username} size={32} />
          <span className="font-semibold">{profile?.username || '...'}</span>
        </div>
        <span className="w-10" />
      </div>

      <div className="flex items-center justify-between mb-5">
        <button onClick={() => shift(-1)} className="btn-ghost !px-3 !py-2">‹</button>
        <div className="text-center">
          <div className="font-semibold">{fmtDate(date)}</div>
          <div className="text-xs opacity-50">
            {date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
        </div>
        <button onClick={() => shift(1)} className="btn-ghost !px-3 !py-2">›</button>
      </div>

      {error && <div className="text-red-400 text-sm mb-3">{error}</div>}

      <div className="card flex flex-col items-center">
        <ProgressRing
          value={Number(totals.calories) || 0}
          goal={profile?.daily_calories_goal || 2000}
        />
        <div className="grid grid-cols-1 gap-3 w-full mt-5">
          <MacroBar label="Белки"   value={Number(totals.protein) || 0} goal={profile?.daily_protein_goal || 150} color="#a3e635" />
          <MacroBar label="Жиры"    value={Number(totals.fat) || 0}     goal={profile?.daily_fat_goal || 70}      color="#fbbf24" />
          <MacroBar label="Углеводы" value={Number(totals.carbs) || 0}  goal={profile?.daily_carbs_goal || 250}   color="#22d3ee" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {grouped.map((g) => (
          <div key={g.key}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm uppercase tracking-wider opacity-60">{g.label}</h3>
              <span className="text-xs opacity-50 tabular-nums">
                {g.items.reduce((s, m) => s + m.calories, 0)} ккал
              </span>
            </div>
            <div className="space-y-2">
              {g.items.length === 0 && <div className="text-xs opacity-40 px-1">—</div>}
              {g.items.map((m, i) => (
                <div key={i} className="card flex items-center gap-3 animate-slide-up">
                  {m.photo_url ? (
                    <img src={m.photo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                      {SOURCE_ICON[m.source] || '🍽'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{m.name}</div>
                    <div className="text-xs opacity-70 mt-0.5 tabular-nums">
                      {m.calories} ккал · Б {Number(m.protein).toFixed(0)} · Ж {Number(m.fat).toFixed(0)} · У {Number(m.carbs).toFixed(0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
