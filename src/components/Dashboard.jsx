import { useState } from 'react'
import ProgressRing from './ProgressRing'
import MacroBar from './MacroBar'
import MealCard from './MealCard'
import AddMeal from './AddMeal'
import { useMeals } from '../hooks/useMeals'

const MEAL_TYPES = [
  ['breakfast', 'Завтрак'],
  ['lunch', 'Обед'],
  ['dinner', 'Ужин'],
  ['snack', 'Перекус'],
]

function fmtDate(d) {
  const t = new Date(); t.setHours(0,0,0,0)
  const day = new Date(d); day.setHours(0,0,0,0)
  const diff = (day - t) / 86400000
  if (diff === 0) return 'Сегодня'
  if (diff === -1) return 'Вчера'
  if (diff === 1) return 'Завтра'
  return day.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function Dashboard({ user, profile }) {
  const [date, setDate] = useState(() => new Date())
  const [showAdd, setShowAdd] = useState(false)
  const { meals, totals, add, remove } = useMeals(user, date)

  const shift = (n) => {
    const d = new Date(date); d.setDate(d.getDate() + n); setDate(d)
  }

  const grouped = MEAL_TYPES.map(([key, label]) => ({
    key, label, items: meals.filter((m) => m.meal_type === key),
  }))

  return (
    <div className="max-w-md mx-auto px-4 py-5 pb-28 animate-fade-in">
      {/* Header */}
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

      {/* Ring */}
      <div className="card flex flex-col items-center">
        <ProgressRing value={totals.calories} goal={profile?.daily_calories_goal || 2000} />
        <div className="grid grid-cols-1 gap-3 w-full mt-5">
          <MacroBar label="Белки" value={totals.protein} goal={profile?.daily_protein_goal || 150} color="#a3e635" />
          <MacroBar label="Жиры" value={totals.fat} goal={profile?.daily_fat_goal || 70} color="#fbbf24" />
          <MacroBar label="Углеводы" value={totals.carbs} goal={profile?.daily_carbs_goal || 250} color="#22d3ee" />
        </div>
      </div>

      {/* Meals */}
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
              {g.items.length === 0 && (
                <div className="text-xs opacity-40 px-1">—</div>
              )}
              {g.items.map((m) => (
                <MealCard key={m.id} meal={m} onDelete={remove} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 btn !px-6 !py-3 shadow-2xl shadow-accent/20 z-30"
      >
        + Добавить еду
      </button>

      {showAdd && (
        <AddMeal
          user={user}
          onClose={() => setShowAdd(false)}
          onSave={add}
        />
      )}
    </div>
  )
}
