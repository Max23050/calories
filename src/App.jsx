import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'

export default function App() {
  const { user, loading } = useAuth()
  const { profile, update } = useProfile(user)

  if (loading) {
    return <div className="min-h-full flex items-center justify-center opacity-50">Загрузка…</div>
  }

  if (!user) return <Auth />

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} profile={profile} />} />
      <Route path="/settings" element={<Settings profile={profile} onUpdate={update} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
