import { supabase } from './supabase'

// Calls the analyze-food Edge Function with either an image (base64) or text.
// Returns: array of { name, calories, protein, fat, carbs, weight_g }
export async function analyzeFood({ image_base64, text }) {
  const { data, error } = await supabase.functions.invoke('analyze-food', {
    body: { image_base64, text },
  })
  if (error) throw error
  if (!data || !Array.isArray(data.items)) {
    throw new Error('Invalid AI response')
  }
  return data.items
}
