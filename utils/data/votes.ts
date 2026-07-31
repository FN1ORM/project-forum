import { createClient } from '@/utils/supabase/server'

export async function getQuestionVoteCount(questionId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('question_votes')
    .select('*', { count: 'exact', head: true })
    .eq('question_id', questionId)
  if (error) throw new Error(`Failed to get question vote count: ${error.message}`)
  return count || 0
}

export async function getAnswerVoteCount(answerId: string) {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('answer_votes')
    .select('*', { count: 'exact', head: true })
    .eq('answer_id', answerId)
  if (error) throw new Error(`Failed to get answer vote count: ${error.message}`)
  return count || 0
}

export async function hasUserUpvotedQuestion(questionId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('question_votes')
    .select('user_id')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check question upvote: ${error.message}`)
  }
  return !!data
}

export async function hasUserUpvotedAnswer(answerId: string, userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('answer_votes')
    .select('user_id')
    .eq('answer_id', answerId)
    .eq('user_id', userId)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to check answer upvote: ${error.message}`)
  }
  return !!data
}

export async function toggleQuestionUpvote(questionId: string, userId: string) {
  const hasVoted = await hasUserUpvotedQuestion(questionId, userId)
  const supabase = await createClient()
  
  if (hasVoted) {
    const { error } = await supabase
      .from('question_votes')
      .delete()
      .eq('question_id', questionId)
      .eq('user_id', userId)
    if (error) throw new Error(`Failed to remove question upvote: ${error.message}`)
  } else {
    const { error } = await supabase
      .from('question_votes')
      .insert({ question_id: questionId, user_id: userId })
    if (error) throw new Error(`Failed to add question upvote: ${error.message}`)
  }
}

export async function toggleAnswerUpvote(answerId: string, userId: string) {
  const hasVoted = await hasUserUpvotedAnswer(answerId, userId)
  const supabase = await createClient()
  
  if (hasVoted) {
    const { error } = await supabase
      .from('answer_votes')
      .delete()
      .eq('answer_id', answerId)
      .eq('user_id', userId)
    if (error) throw new Error(`Failed to remove answer upvote: ${error.message}`)
  } else {
    const { error } = await supabase
      .from('answer_votes')
      .insert({ answer_id: answerId, user_id: userId })
    if (error) throw new Error(`Failed to add answer upvote: ${error.message}`)
  }
}
