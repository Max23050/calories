import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { compressImage } from '../lib/imageUtils'
import Avatar from './Avatar'

export default function Settings({ user, profile, onUpdate }) {
  const [form, setForm] = useState(profile || {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [usernameSaving, setUsernameSaving] = useState(false)
  const [usernameErr, setUsernameErr] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)

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

  const saveUsername = async (e) => {
    e.preventDefault()
    setUsernameErr(null); setUsernameSaving(true)
    try {
      await onUpdate({ username: (form.username || '').trim().toLowerCase() })
    } catch (e) {
      setUsernameErr(e.message || String(e))
    } finally {
      setUsernameSaving(false)
    }
  }

  const uploadAvatar = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const blob = await compressImage(file, { maxDim: 512, targetBytes: 200_000 })
      const path = `${user.id}/avatar.jpg`
      const { error } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      })
      if (error) throw error
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      await onUpdate({ avatar_url: url })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Link to="/" className="opacity-70 hover:opacity-100">← Назад</Link>
        <h1 className="font-semibold">Настройки</h1>
        <span className="w-10" />
      </div>

      {/* Profile */}
      <div className="card mb-4">
        <h2 className="font-medium mb-3">Профиль</h2>
        <div className="flex items-center gap-4 mb-4">
          <Avatar url={profile?.avatar_url} name={profile?.username} size={64} />
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadAvatar(e.target.files?.[0])}
            />
            <button onClick={() => fileRef.current?.click()} className="btn-ghost text-sm" disabled={uploading}>
              {uploading ? '...' : 'Загрузить фото'}
            </button>
          </div>
        </div>
        <form onSubmit={saveUsername} className="space-y-2">
          <label className="label">Username</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              minLength={3}
              pattern="[a-z0-9_]+"
              placeholder="username"
              value={form.username || ''}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <button className="btn" disabled={usernameSaving}>OK</button>
          </div>
          {usernameErr && <div className="text-sm text-red-400">{usernameErr}</div>}
        </form>
      </div>

      {/* Goals */}
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

      <button onClick={() => supabase.auth.signOut()} className="btn-ghost w-full mt-4">
        Выйти из аккаунта
      </button>
    </div>
  )
}
