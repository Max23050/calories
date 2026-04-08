import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFriends(user) {
  const [friendships, setFriendships] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data: fs } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    const list = fs ?? []
    setFriendships(list)

    const ids = Array.from(
      new Set(list.flatMap((f) => [f.requester_id, f.addressee_id]).filter((id) => id !== user.id))
    )
    if (ids.length) {
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, daily_calories_goal')
        .in('id', ids)
      const map = {}
      for (const p of profs ?? []) map[p.id] = p
      setProfilesById(map)
    } else {
      setProfilesById({})
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  // Realtime
  useEffect(() => {
    if (!user) return
    const ch = supabase
      .channel('friendships-' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [user, load])

  const otherId = (f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id)

  const friends = friendships
    .filter((f) => f.status === 'accepted')
    .map((f) => ({ friendship: f, profile: profilesById[otherId(f)], friendId: otherId(f) }))

  const pendingIncoming = friendships
    .filter((f) => f.status === 'pending' && f.addressee_id === user?.id)
    .map((f) => ({ friendship: f, profile: profilesById[f.requester_id], friendId: f.requester_id }))

  const pendingOutgoing = friendships
    .filter((f) => f.status === 'pending' && f.requester_id === user?.id)
    .map((f) => ({ friendship: f, profile: profilesById[f.addressee_id], friendId: f.addressee_id }))

  const sendRequest = async (username) => {
    const { data: target, error } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .maybeSingle()
    if (error) throw error
    if (!target) throw new Error('Пользователь не найден')
    if (target.id === user.id) throw new Error('Нельзя добавить себя')

    const { error: insErr } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, addressee_id: target.id, status: 'pending' })
    if (insErr) throw insErr
    await load()
  }

  const sendRequestById = async (friendId) => {
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, addressee_id: friendId, status: 'pending' })
    if (error) throw error
    await load()
  }

  const acceptRequest = async (id) => {
    await supabase.from('friendships').update({ status: 'accepted', updated_at: new Date().toISOString() }).eq('id', id)
    await load()
  }
  const rejectRequest = async (id) => {
    await supabase.from('friendships').delete().eq('id', id)
    await load()
  }
  const removeFriend = async (id) => {
    await supabase.from('friendships').delete().eq('id', id)
    await load()
  }

  const searchUsers = async (query) => {
    if (!query || query.length < 2) return []
    const { data } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .not('username', 'is', null)
      .limit(15)
    const existing = new Set([
      user.id,
      ...friendships.map(otherId),
    ])
    return (data ?? []).filter((u) => !existing.has(u.id))
  }

  const getFriendSummary = async (friendId, date) => {
    const dateStr = (date instanceof Date ? date : new Date(date)).toISOString().slice(0, 10)
    const { data, error } = await supabase.rpc('get_friend_daily_summary', {
      p_friend_id: friendId,
      p_date: dateStr,
    })
    if (error) throw error
    return data
  }

  return {
    loading,
    friends,
    pendingIncoming,
    pendingOutgoing,
    sendRequest,
    sendRequestById,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
    getFriendSummary,
    reload: load,
  }
}
