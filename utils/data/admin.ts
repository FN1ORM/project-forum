import { createClient } from '@/utils/supabase/server'

export async function getAllUsers(searchQuery?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('profiles')
    .select('*')
    .order('display_name', { ascending: true })

  if (searchQuery) {
    const term = `%${searchQuery.toLowerCase()}%`
    query = query.or(`display_name.ilike.${term},email.ilike.${term}`)
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch users: ${error.message}`)
  return data
}

export async function updateUserRole(userId: string, newRole: string) {
  const validRoles = ['student', 'teacher', 'admin']
  if (!validRoles.includes(newRole)) throw new Error('Invalid role')

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)
    
  if (error) throw new Error(`Failed to update role: ${error.message}`)
}

export async function countAdmins() {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')
    
  if (error) throw new Error(`Failed to count admins: ${error.message}`)
  return count || 0
}

export async function getUserRole(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
    
  if (error) throw new Error(`Failed to get user role: ${error.message}`)
  return data?.role
}
