export default function MacroBar({ label, value, goal, color = '#a3e635' }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, goal)) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs opacity-80 mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(value)} / {goal} г</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="bar-fill h-full rounded-full" style={{ width: pct + '%', background: color }} />
      </div>
    </div>
  )
}
