import { createClient } from '@/utils/supabase/server'

const feedSelect = '*, author:profiles!author_id(display_name), subjects!subject_id(slug, name), question_vote_count, question_answer_count'

function applySort(query: any, sort: string, currentUserId?: string) {
  switch (sort) {
    case 'upvotes':
      return query.order('question_vote_count', { ascending: false }).order('created_at', { ascending: false })
    case 'unanswered':
      return query.eq('question_answer_count', 0).order('created_at', { ascending: false })
    case 'solved':
      return query.eq('is_solved', true).order('created_at', { ascending: false })
    case 'my':
      if (currentUserId) {
        return query.eq('author_id', currentUserId).order('created_at', { ascending: false })
      }
      return query.order('created_at', { ascending: false })
    case 'latest':
    default:
      return query.order('created_at', { ascending: false })
  }
}

function mapFeedQuestion(q: any) {
  return {
    ...q,
    voteCount: q.question_vote_count || 0,
    answerCount: q.question_answer_count || 0
  }
}

export async function getGlobalFeed(sort: string = 'latest', currentUserId?: string, pageNumber: number = 1, pageSize: number = 10, authorIdFilter?: string) {
  const supabase = await createClient()
  let query = supabase.from('questions').select(feedSelect, { count: 'exact' })
  
  if (authorIdFilter) {
    query = query.eq('author_id', authorIdFilter)
  }
  
  query = applySort(query, sort, currentUserId)
  
  const from = (pageNumber - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)
  
  const { data, error, count } = await query
  
  if (error) {
    throw new Error(`Failed to fetch global feed: ${error.message}`)
  }
  
  return { 
    questions: data.map(mapFeedQuestion), 
    totalCount: count || 0 
  }
}

export async function getSubjectFeed(subjectId: string, sort: string = 'latest', currentUserId?: string, pageNumber: number = 1, pageSize: number = 10) {
  const supabase = await createClient()
  let query = supabase.from('questions').select(feedSelect, { count: 'exact' }).eq('subject_id', subjectId)
  
  query = applySort(query, sort, currentUserId)
  
  const from = (pageNumber - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)
  
  const { data, error, count } = await query
  
  if (error) {
    throw new Error(`Failed to fetch subject feed: ${error.message}`)
  }
  
  return { 
    questions: data.map(mapFeedQuestion), 
    totalCount: count || 0 
  }
}

export async function createQuestion(subjectId: string, authorId: string, title: string, body: string) {
  title = title.trim()
  body = body.trim()
  if (!title || !body) throw new Error('Title and body must not be empty')

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

export async function updateQuestion(questionId: string, title: string, body: string) {
  title = title.trim()
  body = body.trim()
  if (!title || !body) throw new Error('Title and body must not be empty')
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('questions')
    .update({ title, body })
    .eq('id', questionId)
    .select()
    .single()
    
  if (error) throw new Error(`Failed to update question: ${error.message}`)
  return data
}

export async function deleteQuestion(questionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)
    
  if (error) throw new Error(`Failed to delete question: ${error.message}`)
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
      const { data: isHidden } = await supabase.rpc('check_question_hidden_status', { q_id: id })
      if (isHidden) {
        return { isHiddenByModerator: true }
      }
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
