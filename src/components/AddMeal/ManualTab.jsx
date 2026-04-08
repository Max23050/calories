import { useState } from 'react'

const MEALS = [
  ['breakfast', 'Завтрак'],
  ['lunch', 'Обед'],
  ['dinner', 'Ужин'],
  ['snack', 'Перекус'],
]

export default function ManualTab({ onSave, defaultMealType = 'breakfast' }) {
  const [form, setForm] = useState({
    name: '', calories: '', protein: '', fat: '', carbs: '', weight_g: '',
    meal_type: defaultMealType,
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        name: form.name,
        calories: Number(form.calories) || 0,
        protein: Number(form.protein) || 0,
        fat: Number(form.fat) || 0,
        carbs: Number(form.carbs) || 0,
        weight_g: form.weight_g ? Number(form.weight_g) : null,
        meal_type: form.meal_type,
        source: 'manual',
      })
      setForm({ ...form, name: '', calories: '', protein: '', fat: '', carbs: '', weight_g: '' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 animate-fade-in">
      <div>
        <label className="label">Название</label>
        <input required className="input" value={form.name} onChange={set('name')} placeholder="Овсянка с бананом" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Калории</label>
          <input required type="number" inputMode="numeric" className="input" value={form.calories} onChange={set('calories')} />
        </div>
        <div>
          <label className="label">Вес (г)</label>
          <input type="number" inputMode="numeric" className="input" value={form.weight_g} onChange={set('weight_g')} />
        </div>
        <div>
          <label className="label">Белки</label>
          <input type="number" step="0.1" className="input" value={form.protein} onChange={set('protein')} />
        </div>
        <div>
          <label className="label">Жиры</label>
          <input type="number" step="0.1" className="input" value={form.fat} onChange={set('fat')} />
        </div>
        <div className="col-span-2">
          <label className="label">Углеводы</label>
          <input type="number" step="0.1" className="input" value={form.carbs} onChange={set('carbs')} />
        </div>
      </div>
      <div>
        <label className="label">Приём пищи</label>
        <div className="grid grid-cols-4 gap-2">
          {MEALS.map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setForm({ ...form, meal_type: v })}
              className={`px-2 py-2 rounded-xl text-sm border transition ${
                form.meal_type === v ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/10'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <button className="btn w-full" disabled={saving}>{saving ? '...' : 'Сохранить'}</button>
    </form>
  )
}
