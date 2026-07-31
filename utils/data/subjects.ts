import { createClient } from '@/utils/supabase/server'

export async function getSubjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to fetch subjects: ${error.message}`)
  }
  
  return data
}

export async function getSubjectBySlug(slug: string) {
  const supabase = await createClient()
  
  // The 'slug' column has a UNIQUE constraint in the database, 
  // ensuring this query utilizes the underlying unique index for optimized lookups.
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means no rows returned, which is expected for a 404
      return null
    }
    throw new Error(`Failed to fetch subject by slug: ${error.message}`)
  }
  
  return data
}
