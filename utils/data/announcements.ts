import { createClient } from '@/utils/supabase/server'

const selectFields = 'id, title, message, resources, author_id, is_pinned, created_at, updated_at, author:profiles!author_id(display_name)'

export async function getPinnedAnnouncements() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select(selectFields)
    .eq('is_pinned', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch pinned announcements: ${error.message}`)
  return data
}

export async function getLatestAnnouncements(limit: number = 3) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select(selectFields)
    .eq('is_pinned', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(`Failed to fetch latest announcements: ${error.message}`)
  return data
}

export async function getAllAnnouncements(pageNumber: number = 1, pageSize: number = 10) {
  const supabase = await createClient()
  const from = (pageNumber - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('announcements')
    .select(selectFields, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) throw new Error(`Failed to fetch all announcements: ${error.message}`)
  
  return {
    announcements: data,
    totalCount: count || 0
  }
}

export async function getAnnouncementById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .select(selectFields)
    .eq('id', id)
    .single()

  if (error) throw new Error(`Failed to fetch announcement: ${error.message}`)
  return data
}

export async function createAnnouncement(authorId: string, title: string, message: string, resources: any[], isPinned: boolean = false) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .insert({
      author_id: authorId,
      title,
      message,
      resources,
      is_pinned: isPinned
    })
    .select(selectFields)
    .single()

  if (error) throw new Error(`Failed to create announcement: ${error.message}`)
  return data
}

export async function updateAnnouncement(id: string, title: string, message: string, resources: any[], isPinned: boolean) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('announcements')
    .update({
      title,
      message,
      resources,
      is_pinned: isPinned
    })
    .eq('id', id)
    .select(selectFields)
    .single()

  if (error) throw new Error(`Failed to update announcement: ${error.message}`)
  return data
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)

  if (error) throw new Error(`Failed to delete announcement: ${error.message}`)
  return true
}

export async function setAnnouncementPin(id: string, isPinned: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('announcements')
    .update({ is_pinned: isPinned })
    .eq('id', id)

  if (error) throw new Error(`Failed to update pin status: ${error.message}`)
  return true
}
