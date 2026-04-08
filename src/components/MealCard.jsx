const SOURCE_ICON = { photo: '📷', chat: '💬', manual: '✏️' }

export default function MealCard({ meal, onDelete }) {
  return (
    <div className="card flex items-center gap-3 animate-slide-up">
      {meal.photo_url ? (
        <img src={meal.photo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
          {SOURCE_ICON[meal.source] || '🍽'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{meal.name}</span>
          {meal.weight_g ? <span className="text-xs opacity-50">{meal.weight_g} г</span> : null}
        </div>
        <div className="text-xs opacity-70 mt-0.5 tabular-nums">
          {meal.calories} ккал · Б {Number(meal.protein).toFixed(0)} · Ж {Number(meal.fat).toFixed(0)} · У {Number(meal.carbs).toFixed(0)}
        </div>
      </div>
      <button onClick={() => onDelete(meal.id)} className="opacity-50 hover:opacity-100 transition px-2 py-1" aria-label="Удалить">
        ✕
      </button>
    </div>
  )
}
