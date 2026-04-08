import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useProfile } from './hooks/useProfile'
import Auth from './components/Auth'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'
import Friends from './components/Friends'
import FriendRequests from './components/FriendRequests'
import AddFriend from './components/AddFriend'
import FriendDashboard from './components/FriendDashboard'
import BottomNav from './components/BottomNav'

export default function App() {
  const { user, loading } = useAuth()
  const { profile, update } = useProfile(user)

  if (loading) {
    return <div className="min-h-full flex items-center justify-center opacity-50">Загрузка…</div>
  }

  if (!user) return <Auth />

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard user={user} profile={profile} />} />
        <Route path="/friends" element={<Friends user={user} profile={profile} onUpdateProfile={update} />} />
        <Route path="/friends/requests" element={<FriendRequests user={user} />} />
        <Route path="/friends/add" element={<AddFriend user={user} />} />
        <Route path="/friends/:id" element={<FriendDashboard user={user} />} />
        <Route path="/settings" element={<Settings user={user} profile={profile} onUpdate={update} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </>
  )
}
