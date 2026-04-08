import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULTS = {
  daily_calories_goal: 2000,
  daily_protein_goal: 150,
  daily_fat_goal: 70,
  daily_carbs_goal: 250,
}

export function useProfile(user) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
    if (!data) {
      const { data: created } = await supabase
        .from('profiles')
        .insert({ id: user.id, ...DEFAULTS })
        .select()
        .single()
      setProfile(created ?? { id: user.id, ...DEFAULTS })
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const update = async (patch) => {
    const { data } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select()
      .single()
    if (data) setProfile(data)
  }

  return { profile, loading, update, reload: load }
}
