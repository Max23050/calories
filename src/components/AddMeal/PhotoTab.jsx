import { useState, useRef } from 'react'
import { compressImage, blobToBase64 } from '../../lib/imageUtils'
import { analyzeFood } from '../../lib/ai'
import { supabase } from '../../lib/supabase'
import ResultEditor from './ResultEditor'

export default function PhotoTab({ user, onSave, defaultMealType }) {
  const [preview, setPreview] = useState(null)
  const [items, setItems] = useState(null)
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
    if (!file) return
    setError(null); setItems(null); setLoading(true)
    try {
      const blob = await compressImage(file)
      const url = URL.createObjectURL(blob)
      setPreview(url)

      // Upload to Storage
      const path = `${user.id}/${Date.now()}.jpg`
      const { error: upErr } = await supabase.storage.from('meal-photos').upload(path, blob, {
        contentType: 'image/jpeg',
      })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('meal-photos').getPublicUrl(path)
      setPhotoUrl(pub.publicUrl)

      // Analyze
      const b64 = await blobToBase64(blob)
      const result = await analyzeFood({ image_base64: b64 })
      setItems(result)
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => { setPreview(null); setItems(null); setPhotoUrl(null); setError(null) }

  return (
    <div className="space-y-4 animate-fade-in">
      {!preview && (
        <div className="card flex flex-col items-center text-center py-10">
          <div className="text-5xl mb-3">📷</div>
          <div className="opacity-70 mb-4 text-sm">Сфотографируйте еду или загрузите фото</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button onClick={() => inputRef.current?.click()} className="btn">Открыть камеру</button>
        </div>
      )}

      {preview && (
        <div className="relative">
          <img src={preview} alt="" className="w-full rounded-2xl object-cover max-h-72" />
          {!loading && items && (
            <button onClick={reset} className="absolute top-2 right-2 bg-black/60 rounded-full px-3 py-1 text-sm">↻</button>
          )}
        </div>
      )}

      {loading && <div className="text-center opacity-70 text-sm">Распознаём…</div>}
      {error && <div className="text-sm text-red-400">{error}</div>}

      {items && (
        <ResultEditor
          items={items}
          source="photo"
          photoUrl={photoUrl}
          defaultMealType={defaultMealType}
          onSaveAll={onSave}
          onDiscard={reset}
        />
      )}
    </div>
  )
}
