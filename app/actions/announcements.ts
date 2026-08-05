'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { 
  createAnnouncement as dbCreateAnnouncement,
  updateAnnouncement as dbUpdateAnnouncement,
  deleteAnnouncement as dbDeleteAnnouncement,
  setAnnouncementPin
} from '@/utils/data/announcements'

type Resource = { label: string; url: string }

function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function validateResources(resources: any): Resource[] {
  if (!Array.isArray(resources)) throw new Error('Resources must be an array')
  
  return resources.map((res: any, index: number) => {
    if (!res || typeof res !== 'object') throw new Error(`Resource at index ${index} must be an object`)
    
    const label = typeof res.label === 'string' ? res.label.trim() : ''
    const url = typeof res.url === 'string' ? res.url.trim() : ''
    
    if (!label) throw new Error(`Resource at index ${index} is missing a label`)
    if (!url) throw new Error(`Resource at index ${index} is missing a URL`)
    if (!validateUrl(url)) throw new Error(`Resource at index ${index} has an invalid URL. Only http and https protocols are allowed.`)
    
    return { label, url }
  })
}

async function authorizeTeacherOrAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || (profile.role !== 'teacher' && profile.role !== 'admin')) {
    throw new Error('Forbidden: Only teachers and admins can perform this action')
  }
  
  return user.id
}

type AnnouncementPayload = {
  title: string
  message: string
  resources: any[]
  isPinned?: boolean
}

export async function createAnnouncementAction(payload: AnnouncementPayload) {
  try {
    const userId = await authorizeTeacherOrAdmin()
    
    const title = payload.title?.trim()
    const message = payload.message?.trim()
    const isPinned = !!payload.isPinned
    
    if (!title || title.length === 0) return { error: 'Title is required' }
    if (title.length > 200) return { error: 'Title must be under 200 characters' }
// message is optional
    
    let validatedResources: Resource[] = []
    try {
      validatedResources = validateResources(payload.resources || [])
    } catch (e: any) {
      return { error: e.message }
    }
    
    await dbCreateAnnouncement(userId, title, message, validatedResources, isPinned)
    
    revalidatePath('/')
    revalidatePath('/announcements')
    revalidatePath('/teacher')
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function updateAnnouncementAction(id: string, payload: AnnouncementPayload) {
  try {
    await authorizeTeacherOrAdmin()
    
    if (!id) return { error: 'Announcement ID is required' }

    const title = payload.title?.trim()
    const message = payload.message?.trim()
    const isPinned = !!payload.isPinned
    
    if (!title || title.length === 0) return { error: 'Title is required' }
    if (title.length > 200) return { error: 'Title must be under 200 characters' }
// message is optional
    
    let validatedResources: Resource[] = []
    try {
      validatedResources = validateResources(payload.resources || [])
    } catch (e: any) {
      return { error: e.message }
    }
    
    await dbUpdateAnnouncement(id, title, message, validatedResources, isPinned)
    
    revalidatePath('/')
    revalidatePath('/announcements')
    revalidatePath('/teacher')
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    await authorizeTeacherOrAdmin()
    
    if (!id) return { error: 'Announcement ID is required' }
    
    await dbDeleteAnnouncement(id)
    
    revalidatePath('/')
    revalidatePath('/announcements')
    revalidatePath('/teacher')
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' }
  }
}

export async function toggleAnnouncementPinAction(id: string, isPinned: boolean) {
  try {
    await authorizeTeacherOrAdmin()
    
    if (!id) return { error: 'Announcement ID is required' }
    
    await setAnnouncementPin(id, isPinned)
    
    revalidatePath('/')
    revalidatePath('/announcements')
    revalidatePath('/teacher')
    
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'An unexpected error occurred' }
  }
}
