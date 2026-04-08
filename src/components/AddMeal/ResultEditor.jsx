import { useState, useEffect } from 'react'

const MEALS = [
  ['breakfast', 'Завтрак'],
  ['lunch', 'Обед'],
  ['dinner', 'Ужин'],
  ['snack', 'Перекус'],
]

// Editable list of AI-detected items, then "save all" with chosen meal_type.
export default function ResultEditor({ items, source, photoUrl, onSaveAll, onDiscard, defaultMealType = 'breakfast' }) {
  const [list, setList] = useState(items)
  const [mealType, setMealType] = useState(defaultMealType)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setList(items) }, [items])

  const update = (i, k, v) => {
    const next = [...list]
    next[i] = { ...next[i], [k]: v }
    setList(next)
  }
  const removeItem = (i) => setList(list.filter((_, idx) => idx !== i))

  const save = async () => {
    setSaving(true)
    try {
      for (const it of list) {
        await onSaveAll({
          name: it.name,
          calories: Number(it.calories) || 0,
          protein: Number(it.protein) || 0,
          fat: Number(it.fat) || 0,
          carbs: Number(it.carbs) || 0,
          weight_g: it.weight_g ? Number(it.weight_g) : null,
          source,
          meal_type: mealType,
          photo_url: photoUrl || null,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  if (!list?.length) return <div className="opacity-60 text-sm">Ничего не распознано.</div>

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="text-sm opacity-70">Проверьте и отредактируйте:</div>
      {list.map((it, i) => (
        <div key={i} className="card space-y-2">
          <div className="flex items-center gap-2">
            <input className="input flex-1" value={it.name} onChange={(e) => update(i, 'name', e.target.value)} />
            <button onClick={() => removeItem(i)} className="opacity-50 hover:opacity-100 px-2">✕</button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <Field label="ккал" value={it.calories} onChange={(v) => update(i, 'calories', v)} />
            <Field label="Б" value={it.protein} onChange={(v) => update(i, 'protein', v)} />
            <Field label="Ж" value={it.fat} onChange={(v) => update(i, 'fat', v)} />
            <Field label="У" value={it.carbs} onChange={(v) => update(i, 'carbs', v)} />
            <Field label="г" value={it.weight_g} onChange={(v) => update(i, 'weight_g', v)} />
          </div>
        </div>
      ))}

      <div>
        <div className="label">Приём пищи</div>
        <div className="grid grid-cols-4 gap-2">
          {MEALS.map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setMealType(v)}
              className={`px-2 py-2 rounded-xl text-sm border transition ${
                mealType === v ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/10'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={onDiscard} className="btn-ghost flex-1">Отмена</button>
        <button onClick={save} className="btn flex-1" disabled={saving}>
          {saving ? '...' : 'Сохранить всё'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase opacity-50">{label}</span>
      <input
        type="number"
        step="0.1"
        className="input !px-2 !py-2 text-sm"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
