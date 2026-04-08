import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'

export default function Settings({ profile, onUpdate }) {
  const [form, setForm] = useState(profile || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setForm(profile || {}) }, [profile])

  const set = (k) => (e) => setForm({ ...form, [k]: Number(e.target.value) || 0 })

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onUpdate({
        daily_calories_goal: form.daily_calories_goal,
        daily_protein_goal: form.daily_protein_goal,
        daily_fat_goal: form.daily_fat_goal,
        daily_carbs_goal: form.daily_carbs_goal,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="opacity-70 hover:opacity-100">← Назад</Link>
        <h1 className="font-semibold">Настройки</h1>
        <span className="w-10" />
      </div>

      <form onSubmit={save} className="card space-y-4">
        <h2 className="font-medium">Дневные цели</h2>
        <div>
          <label className="label">Калории, ккал</label>
          <input type="number" className="input" value={form.daily_calories_goal ?? ''} onChange={set('daily_calories_goal')} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">Белки, г</label>
            <input type="number" className="input" value={form.daily_protein_goal ?? ''} onChange={set('daily_protein_goal')} />
          </div>
          <div>
            <label className="label">Жиры, г</label>
            <input type="number" className="input" value={form.daily_fat_goal ?? ''} onChange={set('daily_fat_goal')} />
          </div>
          <div>
            <label className="label">Углев., г</label>
            <input type="number" className="input" value={form.daily_carbs_goal ?? ''} onChange={set('daily_carbs_goal')} />
          </div>
        </div>
        <button className="btn w-full" disabled={saving}>
          {saving ? '...' : saved ? '✓ Сохранено' : 'Сохранить'}
        </button>
      </form>

      <button
        onClick={() => supabase.auth.signOut()}
        className="btn-ghost w-full mt-4"
      >
        Выйти из аккаунта
      </button>
    </div>
  )
}
