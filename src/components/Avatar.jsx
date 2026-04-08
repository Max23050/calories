import { initials } from '../lib/format'

export default function Avatar({ url, name, size = 48 }) {
  const s = { width: size, height: size }
  if (url) return <img src={url} alt="" style={s} className="rounded-full object-cover" />
  return (
    <div
      style={s}
      className="rounded-full bg-gradient-to-br from-accent to-cyan-400 text-black font-bold flex items-center justify-center"
    >
      {initials(name)}
    </div>
  )
}
