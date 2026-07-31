import { createClient } from '@/utils/supabase/server'

export async function getQuestionsBySubject(subjectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*, author:profiles(display_name)')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }
  
  return data
}

export async function createQuestion(subjectId: string, authorId: string, title: string, body: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('questions')
    .insert({
      subject_id: subjectId,
      author_id: authorId,
      title,
      body
    })
    .select()
    .single()
    
  if (error) {
    throw new Error(`Failed to create question: ${error.message}`)
  }
  
  return data
}

export async function getQuestionById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('id, title, body, created_at, subject_id, subjects(slug, name), author:profiles(display_name)')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch question: ${error.message}`)
  }
  
  return data
}
