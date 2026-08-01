import { createClient } from '@/utils/supabase/server'

function mapTeacherQuestion(q: any) {
  return {
    ...q,
    voteCount: q.question_votes?.[0]?.count || 0,
    answerCount: q.answers?.[0]?.count || 0
  }
}

const selectString = '*, author:profiles!author_id(display_name), subjects(slug, name), question_votes(count), answers(count)'

export async function getUnsolvedQuestions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(selectString)
    .eq('is_solved', false)
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(`Failed to fetch unsolved questions: ${error.message}`)
  return data.map(mapTeacherQuestion)
}

export async function getRecentQuestions(limit: number = 20) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .select(selectString)
    .order('created_at', { ascending: false })
    .limit(limit)
    
  if (error) throw new Error(`Failed to fetch recent questions: ${error.message}`)
  return data.map(mapTeacherQuestion)
}

export async function getUnansweredQuestions() {
  const supabase = await createClient()
  
  // Fetch all questions and filter in Node.js to avoid DB View/RPC complexity
  const { data, error } = await supabase
    .from('questions')
    .select(selectString)
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(`Failed to fetch unanswered questions: ${error.message}`)
  
  const mapped = data.map(mapTeacherQuestion)
  return mapped.filter(q => q.answerCount === 0)
}
