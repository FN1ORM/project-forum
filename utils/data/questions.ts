import { createClient } from '@/utils/supabase/server'

export async function getQuestionsBySubject(subjectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select('*, author:profiles!author_id(display_name), question_votes(count)')
    .eq('subject_id', subjectId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch questions: ${error.message}`)
  }
  
  return data.map(q => ({
    ...q,
    voteCount: q.question_votes?.[0]?.count || 0
  }))
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
    .select('id, title, body, created_at, subject_id, subjects(slug, name), author_id, author:profiles!author_id(display_name), is_solved, solved_at, solved_by, solver:profiles!solved_by(display_name), question_votes(count)')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch question: ${error.message}`)
  }
  
  return {
    ...data,
    voteCount: data.question_votes?.[0]?.count || 0
  }
}

export async function markQuestionSolved(questionId: string, solvedBy: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .update({
      is_solved: true,
      solved_at: new Date().toISOString(),
      solved_by: solvedBy
    })
    .eq('id', questionId)
    .select()
    .single()
    
  if (error) {
    throw new Error(`Failed to mark question as solved: ${error.message}`)
  }
  
  return data
}
