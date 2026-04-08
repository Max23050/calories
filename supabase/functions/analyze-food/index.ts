// Supabase Edge Function: analyze-food
// Proxies requests to OpenAI GPT-4o (vision + text) and returns parsed nutrition JSON.
// Deploy: supabase functions deploy analyze-food
// Set secret: supabase secrets set OPENAI_API_KEY=sk-...

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SYSTEM_PHOTO =
  'Ты нутрициолог. Определи все блюда и продукты на фото. Для каждого верни JSON: ' +
  '{name: string, calories: number, protein: number, fat: number, carbs: number, weight_g: number}. ' +
  'Отвечай ТОЛЬКО валидным JSON-массивом, без markdown.'

const SYSTEM_TEXT =
  'Ты нутрициолог-ассистент. Пользователь описывает что съел. Проанализируй и верни JSON-массив блюд: ' +
  '[{name, calories, protein, fat, carbs, weight_g}]. ' +
  'Если пользователь не указал вес — используй стандартную порцию. ' +
  'Отвечай ТОЛЬКО валидным JSON-массивом.'

function extractJson(text: string): any {
  // Try direct parse, then extract first [...] block.
  try { return JSON.parse(text) } catch (_) {}
  const match = text.match(/\[[\s\S]*\]/)
  if (match) {
    try { return JSON.parse(match[0]) } catch (_) {}
  }
  throw new Error('Failed to parse JSON from model response')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set')

    const { image_base64, text } = await req.json()

    let messages: any[]
    if (image_base64) {
      messages = [
        { role: 'system', content: SYSTEM_PHOTO },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Что на этом фото? Верни JSON-массив.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image_base64}` } },
          ],
        },
      ]
    } else if (text) {
      messages = [
        { role: 'system', content: SYSTEM_TEXT },
        { role: 'user', content: text },
      ]
    } else {
      return new Response(JSON.stringify({ error: 'Provide image_base64 or text' }), {
        status: 400,
        headers: { ...CORS, 'content-type': 'application/json' },
      })
    }

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.2,
      }),
    })

    if (!r.ok) {
      const err = await r.text()
      throw new Error(`OpenAI error: ${r.status} ${err}`)
    }

    const data = await r.json()
    const content: string = data.choices?.[0]?.message?.content ?? '[]'
    const items = extractJson(content)

    const normalized = (Array.isArray(items) ? items : []).map((it: any) => ({
      name: String(it.name ?? 'Блюдо'),
      calories: Math.round(Number(it.calories) || 0),
      protein: Number(it.protein) || 0,
      fat: Number(it.fat) || 0,
      carbs: Number(it.carbs) || 0,
      weight_g: it.weight_g ? Math.round(Number(it.weight_g)) : null,
    }))

    return new Response(JSON.stringify({ items: normalized }), {
      headers: { ...CORS, 'content-type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { ...CORS, 'content-type': 'application/json' },
    })
  }
})
