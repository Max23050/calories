import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Avatar from './Avatar'
import { timeAgo } from '../lib/format'

// Compact friend card showing today's progress %.
export default function FriendCard({ friendId, profile }) {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    let ignore = false
    const today = new Date().toISOString().slice(0, 10)
    supabase
      .rpc('get_friend_daily_summary', { p_friend_id: friendId, p_date: today })
      .then(({ data }) => {
        if (!ignore) setSummary(data)
      })
    return () => { ignore = true }
  }, [friendId])

  const goal = profile?.daily_calories_goal || summary?.profile?.daily_calories_goal || 2000
  const cals = summary?.totals?.calories || 0
  const pct = Math.min(1, cals / goal)
  const done = cals >= goal * 0.9 && cals <= goal * 1.1
  const lastMeal = summary?.meals?.[summary.meals.length - 1]

  // Ring
  const size = 56, stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r

  return (
    <Link to={`/friends/${friendId}`} className="card flex items-center gap-3 animate-slide-up hover:bg-white/[.07] transition">
      <Avatar url={profile?.avatar_url} name={profile?.username} size={48} />
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate flex items-center gap-2">
          {profile?.username || '...'}
          {summary && (done
            ? <span className="text-green-400 text-sm">✓</span>
            : (cals > 0 && <span className="text-xs opacity-50">{Math.round(pct * 100)}%</span>))}
        </div>
        <div className="text-xs opacity-60 truncate">
          {summary == null
            ? '...'
            : summary.meals?.length
              ? `${lastMeal?.name} · ${timeAgo(lastMeal?.created_at)}`
              : 'Пока ничего не записал'}
        </div>
      </div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,.1)" strokeWidth={stroke} fill="none" />
          <circle
            cx={size/2} cy={size/2} r={r}
            stroke={done ? '#4ade80' : '#a3e635'}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${c * pct} ${c}`}
            style={{ transition: 'stroke-dasharray .6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] tabular-nums opacity-80">
          {Math.round(cals)}
        </div>
      </div>
    </Link>
  )
}
