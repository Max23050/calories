import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFriends } from '../hooks/useFriends'
import Avatar from './Avatar'

export default function AddFriend({ user }) {
  const { searchUsers, sendRequestById } = useFriends(user)
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const r = await searchUsers(q.trim())
        setResults(r)
      } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [q]) // eslint-disable-line

  const send = async (id) => {
    setError(null)
    try {
      await sendRequestById(id)
      setSent((s) => ({ ...s, [id]: true }))
    } catch (e) {
      setError(e.message || String(e))
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <Link to="/friends" className="opacity-70 hover:opacity-100">← Назад</Link>
        <h1 className="font-semibold">Добавить друга</h1>
        <span className="w-10" />
      </div>

      <input
        autoFocus
        className="input mb-4"
        placeholder="Поиск по username"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {error && <div className="text-sm text-red-400 mb-3">{error}</div>}
      {loading && <div className="opacity-50 text-sm">Поиск…</div>}

      <div className="space-y-2">
        {results.map((u) => (
          <div key={u.id} className="card flex items-center gap-3 animate-slide-up">
            <Avatar url={u.avatar_url} name={u.username} />
            <div className="flex-1 truncate font-medium">{u.username}</div>
            {sent[u.id] ? (
              <span className="text-sm opacity-60">Отправлено ✓</span>
            ) : (
              <button onClick={() => send(u.id)} className="btn !px-3 !py-2 text-sm">+ В друзья</button>
            )}
          </div>
        ))}
        {!loading && q && results.length === 0 && (
          <div className="opacity-50 text-sm px-1">Никого не найдено</div>
        )}
      </div>
    </div>
  )
}
