import { createClient } from '@/utils/supabase/server'

export async function getAnswersByQuestion(questionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to fetch answers: ${error.message}`)
  }
  
  return data
}

export async function createAnswer(questionId: string, authorId: string, body: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('answers')
    .insert({
      question_id: questionId,
      author_id: authorId,
      body
    })
    .select()
    .single()
    
  if (error) {
    throw new Error(`Failed to create answer: ${error.message}`)
  }
  
  return data
}
