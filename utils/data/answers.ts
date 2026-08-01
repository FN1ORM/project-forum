import { createClient } from '@/utils/supabase/server'

export async function getAnswersByQuestion(questionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('answers')
    .select('*, author:profiles!author_id(display_name), vote_count')
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

export async function getAnswerById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      const { data: isHidden } = await supabase.rpc('check_answer_hidden_status', { a_id: id })
      if (isHidden) {
        return { isHiddenByModerator: true }
      }
      return null
    }
    throw new Error(`Failed to fetch answer: ${error.message}`)
  }
  return data
}

export async function createAnswer(questionId: string, authorId: string, body: string) {
  body = body.trim()
  if (!body) throw new Error('Body must not be empty')
  
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

export async function updateAnswer(answerId: string, body: string) {
  body = body.trim()
  if (!body) throw new Error('Body must not be empty')
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('answers')
    .update({ body })
    .eq('id', answerId)
    .select()
    .single()
    
  if (error) throw new Error(`Failed to update answer: ${error.message}`)
  return data
}

export async function deleteAnswer(answerId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('answers')
    .delete()
    .eq('id', answerId)
    
  if (error) throw new Error(`Failed to delete answer: ${error.message}`)
}
