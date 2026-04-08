import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function dayBounds(date) {
  const start = new Date(date); start.setHours(0, 0, 0, 0)
  const end = new Date(date); end.setHours(23, 59, 59, 999)
  return { start: start.toISOString(), end: end.toISOString() }
}

export function useMeals(user, date) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { start, end } = dayBounds(date)
    const { data } = await supabase
      .from('meal_entries')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true })
    setMeals(data ?? [])
    setLoading(false)
  }, [user, date])

  useEffect(() => { load() }, [load])

  // Realtime updates
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('meal_entries-' + user.id)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meal_entries', filter: `user_id=eq.${user.id}` },
        () => load()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, load])

  const add = async (entry) => {
    const { data, error } = await supabase
      .from('meal_entries')
      .insert({ ...entry, user_id: user.id })
      .select()
      .single()
    if (error) throw error
    setMeals((prev) => [...prev, data])
    return data
  }

  const remove = async (id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id))
    await supabase.from('meal_entries').delete().eq('id', id)
  }

  const totals = meals.reduce(
    (acc, m) => ({
      calories: acc.calories + (m.calories || 0),
      protein: acc.protein + Number(m.protein || 0),
      fat: acc.fat + Number(m.fat || 0),
      carbs: acc.carbs + Number(m.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

  return { meals, loading, add, remove, totals, reload: load }
}
