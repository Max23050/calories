import { NavLink } from 'react-router-dom'

const ITEMS = [
  { to: '/', label: 'Дневник', icon: '🍽' },
  { to: '/friends', label: 'Друзья', icon: '👥' },
  { to: '/settings', label: 'Настройки', icon: '⚙' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-bg/90 backdrop-blur border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-3">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2.5 text-[11px] transition ${
                isActive ? 'text-accent' : 'opacity-60 hover:opacity-100'
              }`
            }
          >
            <span className="text-xl leading-none mb-0.5">{it.icon}</span>
            {it.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
