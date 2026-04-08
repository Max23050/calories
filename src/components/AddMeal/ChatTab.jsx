import { useState } from 'react'
import { analyzeFood } from '../../lib/ai'
import ResultEditor from './ResultEditor'

export default function ChatTab({ onSave, defaultMealType }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', text }])
    setLoading(true); setError(null)
    try {
      const result = await analyzeFood({ text })
      setItems(result)
      setMessages((m) => [...m, { role: 'ai', text: `Распознано: ${result.length} блюд(а)` }])
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => setItems(null)

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="card max-h-60 overflow-y-auto space-y-2 text-sm">
        {messages.length === 0 && (
          <div className="opacity-50">Опишите что съели, например: «борщ 300г и два куска хлеба»</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
              m.role === 'user' ? 'bg-accent text-black' : 'bg-white/10'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="opacity-60">Думаем…</div>}
      </div>

      {!items && (
        <form onSubmit={send} className="flex gap-2">
          <input
            className="input flex-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Что вы съели?"
          />
          <button className="btn" disabled={loading || !input.trim()}>→</button>
        </form>
      )}

      {error && <div className="text-sm text-red-400">{error}</div>}

      {items && (
        <ResultEditor
          items={items}
          source="chat"
          defaultMealType={defaultMealType}
          onSaveAll={onSave}
          onDiscard={reset}
        />
      )}
    </div>
  )
}
