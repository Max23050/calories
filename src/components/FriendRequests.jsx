import { Link } from 'react-router-dom'
import { useFriends } from '../hooks/useFriends'
import Avatar from './Avatar'

export default function FriendRequests({ user }) {
  const { pendingIncoming, pendingOutgoing, acceptRequest, rejectRequest, removeFriend } = useFriends(user)

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <Link to="/friends" className="opacity-70 hover:opacity-100">← Назад</Link>
        <h1 className="font-semibold">Запросы</h1>
        <span className="w-10" />
      </div>

      <h2 className="text-xs uppercase tracking-wider opacity-60 mb-2 px-1">Входящие</h2>
      <div className="space-y-2 mb-6">
        {pendingIncoming.length === 0 && (
          <div className="text-xs opacity-40 px-1">—</div>
        )}
        {pendingIncoming.map(({ friendship, profile, friendId }) => (
          <div key={friendship.id} className="card flex items-center gap-3 animate-slide-up">
            <Avatar url={profile?.avatar_url} name={profile?.username} />
            <div className="flex-1 truncate font-medium">{profile?.username || friendId.slice(0, 8)}</div>
            <button onClick={() => acceptRequest(friendship.id)} className="btn !px-3 !py-2 text-sm">Принять</button>
            <button onClick={() => rejectRequest(friendship.id)} className="btn-ghost !px-3 !py-2 text-sm">✕</button>
          </div>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-wider opacity-60 mb-2 px-1">Исходящие</h2>
      <div className="space-y-2">
        {pendingOutgoing.length === 0 && (
          <div className="text-xs opacity-40 px-1">—</div>
        )}
        {pendingOutgoing.map(({ friendship, profile, friendId }) => (
          <div key={friendship.id} className="card flex items-center gap-3 animate-slide-up">
            <Avatar url={profile?.avatar_url} name={profile?.username} />
            <div className="flex-1 truncate">
              <div className="font-medium">{profile?.username || friendId.slice(0, 8)}</div>
              <div className="text-xs opacity-50">Ожидает</div>
            </div>
            <button onClick={() => removeFriend(friendship.id)} className="btn-ghost !px-3 !py-2 text-sm">Отменить</button>
          </div>
        ))}
      </div>
    </div>
  )
}
