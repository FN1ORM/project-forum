import { createClient } from '@/utils/supabase/server'

export async function getProfileById(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, email, role, is_suspended')
    .eq('id', userId)
    .single()
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }
  return data
}
