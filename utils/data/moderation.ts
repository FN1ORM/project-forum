import { createClient } from '@/utils/supabase/server'

export async function submitReport({
  questionId,
  answerId,
  reason,
  description
}: {
  questionId?: string
  answerId?: string
  reason: string
  description?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    question_id: questionId || null,
    answer_id: answerId || null,
    reason,
    description: description || null,
    status: 'open'
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already reported this content.')
    }
    throw new Error(`Failed to submit report: ${error.message}`)
  }
}

export async function getReports(status: 'open' | 'dismissed' | 'resolved' = 'open') {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:profiles!reporter_id(display_name, email),
      question:questions!question_id(title, body, is_hidden, author_id, author:profiles!author_id(display_name, email, is_suspended)),
      answer:answers!answer_id(body, is_hidden, question_id, author_id, author:profiles!author_id(display_name, email, is_suspended))
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch reports: ${error.message}`)
  return data
}

export async function updateReportStatus(reportId: string, status: 'open' | 'dismissed' | 'resolved') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', reportId)
    
  if (error) throw new Error(`Failed to update report status: ${error.message}`)
}

export async function toggleQuestionHidden(questionId: string, isHidden: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('questions')
    .update({ is_hidden: isHidden })
    .eq('id', questionId)
    
  if (error) throw new Error(`Failed to toggle question visibility: ${error.message}`)
}

export async function toggleAnswerHidden(answerId: string, isHidden: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('answers')
    .update({ is_hidden: isHidden })
    .eq('id', answerId)
    
  if (error) throw new Error(`Failed to toggle answer visibility: ${error.message}`)
}

export async function toggleUserSuspension(userId: string, isSuspended: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_suspended: isSuspended })
    .eq('id', userId)
    
  if (error) throw new Error(`Failed to toggle user suspension: ${error.message}`)
}
