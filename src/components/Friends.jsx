import { Link } from 'react-router-dom'
import { useFriends } from '../hooks/useFriends'
import FriendCard from './FriendCard'
import UsernamePrompt from './UsernamePrompt'

export default function Friends({ user, profile, onUpdateProfile }) {
  const { friends, pendingIncoming, loading } = useFriends(user)

  if (!profile?.username) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-fade-in">
        <Header />
        <UsernamePrompt onSave={(username) => onUpdateProfile({ username })} />
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-28 animate-fade-in">
      <Header />

      <div className="grid grid-cols-2 gap-2 mb-4">
        <Link to="/friends/add" className="btn-ghost">+ Добавить</Link>
        <Link to="/friends/requests" className="btn-ghost relative">
          Запросы
          {pendingIncoming.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-accent text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {pendingIncoming.length}
            </span>
          )}
        </Link>
      </div>

      {loading && <div className="opacity-50 text-sm">Загрузка…</div>}
      {!loading && friends.length === 0 && (
        <div className="card text-center opacity-60 text-sm py-8">
          У тебя пока нет друзей.<br />
          Добавь первого по username 👋
        </div>
      )}

      <div className="space-y-2">
        {friends.map((f) => (
          <FriendCard key={f.friendship.id} friendId={f.friendId} profile={f.profile} />
        ))}
      </div>
    </div>
  )
}

function Header() {
  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-2xl font-bold">Друзья</h1>
    </div>
  )
}
