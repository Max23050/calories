import { useState } from 'react'
import PhotoTab from './PhotoTab'
import ChatTab from './ChatTab'
import ManualTab from './ManualTab'

const TABS = [
  ['photo', '📷 Фото'],
  ['chat', '💬 Чат'],
  ['manual', '✏️ Вручную'],
]

export default function AddMeal({ user, onClose, onSave, defaultMealType }) {
  const [tab, setTab] = useState('photo')

  const save = async (entry) => {
    await onSave(entry)
    // close after first successful save for snappier UX
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-lg bg-bg-soft rounded-t-3xl sm:rounded-3xl border border-white/10 max-h-[92vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-bg-soft z-10 p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-semibold">Добавить еду</h2>
          <button onClick={onClose} className="opacity-60 hover:opacity-100 px-2 text-xl leading-none">×</button>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4 no-scrollbar overflow-x-auto">
            {TABS.map(([v, l]) => (
              <button
                key={v}
                onClick={() => setTab(v)}
                className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap border transition ${
                  tab === v ? 'bg-accent text-black border-accent' : 'bg-white/5 border-white/10'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {tab === 'photo' && <PhotoTab user={user} onSave={save} defaultMealType={defaultMealType} />}
          {tab === 'chat' && <ChatTab onSave={save} defaultMealType={defaultMealType} />}
          {tab === 'manual' && <ManualTab onSave={save} defaultMealType={defaultMealType} />}
        </div>
      </div>
    </div>
  )
}
