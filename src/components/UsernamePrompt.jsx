import { useState } from 'react'

export default function UsernamePrompt({ onSave }) {
  const [v, setV] = useState('')
  const [err, setErr] = useState(null)
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(null); setSaving(true)
    try {
      await onSave(v.trim().toLowerCase())
    } catch (e) {
      setErr(e.message || String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card animate-fade-in">
      <h3 className="font-semibold mb-1">Установи username</h3>
      <p className="text-sm opacity-70 mb-3">
        Чтобы друзья могли тебя найти и добавить.
      </p>
      <form onSubmit={submit} className="flex gap-2">
        <input
          required
          minLength={3}
          pattern="[a-z0-9_]+"
          className="input flex-1"
          placeholder="username"
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
        <button className="btn" disabled={saving}>OK</button>
      </form>
      {err && <div className="text-sm text-red-400 mt-2">{err}</div>}
    </div>
  )
}
