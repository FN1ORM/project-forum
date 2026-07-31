import { createClient } from '@/utils/supabase/server'

export async function getAnswersByQuestion(questionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('answers')
    .select('*, author:profiles(display_name), vote_count')
    .eq('question_id', questionId)
    .order('vote_count', { ascending: false })
    .order('created_at', { ascending: true })
  
  if (error) {
    throw new Error(`Failed to fetch answers: ${error.message}`)
  }
  
  return data.map(a => ({
    ...a,
    voteCount: Number(a.vote_count) || 0
  }))
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
