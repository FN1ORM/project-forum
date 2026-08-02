import { notFound, redirect } from 'next/navigation'
import { getQuestionById, markQuestionSolved, deleteQuestion } from '@/utils/data/questions'
import { getAnswersByQuestion, createAnswer, deleteAnswer } from '@/utils/data/answers'
import { hasUserUpvotedQuestion, hasUserUpvotedAnswers, toggleQuestionUpvote, toggleAnswerUpvote } from '@/utils/data/votes'
import { getQuestionAttachments, getAnswersAttachments, createAttachment, deleteAttachment, getAttachmentById } from '@/utils/data/attachments'
import { createClient } from '@/utils/supabase/server'
import { getUserAndProfile } from '@/utils/data/user'
import Link from 'next/link'
import { DeleteButton } from './delete-button'
import { ValidatedForm } from '@/components/validated-form'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SubmitButton } from '@/components/submit-button'
import { ReportDialog } from '@/components/ui/report-dialog'

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  const [questionResult, userResult] = await Promise.allSettled([
    getQuestionById(id),
    getUserAndProfile()
  ])
  
  const question = questionResult.status === 'fulfilled' ? questionResult.value : null
  const { user, profile: userProfile } = userResult.status === 'fulfilled' ? userResult.value : { user: null, profile: null }

  if (!question) {
    notFound()
  }
  
  if (question.isHiddenByModerator) {
    return (
      <div className="flex flex-col flex-1 bg-background text-foreground items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md p-8 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Content Removed</h1>
          <p className="text-muted-foreground">
            This content has been removed by a moderator for violating our community guidelines.
          </p>
          <Link href="/" className="inline-block mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  const validQuestion = question as any

  const [answersResult, questionAttachmentsResult, upvoteResult] = await Promise.allSettled([
    getAnswersByQuestion(validQuestion.id),
    getQuestionAttachments(validQuestion.id),
    user ? hasUserUpvotedQuestion(validQuestion.id, user.id) : Promise.resolve(false)
  ])

  const answers = answersResult.status === 'fulfilled' ? (answersResult.value as any[]) : []
  const questionAttachments = questionAttachmentsResult.status === 'fulfilled' ? questionAttachmentsResult.value : []
  const hasUpvotedQuestion = upvoteResult.status === 'fulfilled' ? upvoteResult.value : false

  const subjectSlug = validQuestion.subjects?.slug
  const subjectName = validQuestion.subjects?.name

  const hasPermission = userProfile && (
    validQuestion.author_id === userProfile.id || 
    userProfile.role === 'teacher' || 
    userProfile.role === 'admin'
  );

  const isAuthor = user && user.id === validQuestion.author_id;
  const isTeacherOrAdmin = userProfile && (userProfile.role === 'teacher' || userProfile.role === 'admin');
  const canEditQuestion = (isAuthor && !validQuestion.is_solved) || isTeacherOrAdmin;

  const answerIds = answers.map(a => a.id)
  
  const [userUpvotedAnswersResult, answerAttachmentsMapResult] = await Promise.allSettled([
    user && answerIds.length > 0 ? hasUserUpvotedAnswers(answerIds, user.id) : Promise.resolve({}),
    answerIds.length > 0 ? getAnswersAttachments(answerIds) : Promise.resolve({})
  ])
  
  const userUpvotedAnswers: Record<string, boolean> = userUpvotedAnswersResult.status === 'fulfilled' ? userUpvotedAnswersResult.value : {}
  const answerAttachmentsMap: Record<string, any[]> = answerAttachmentsMapResult.status === 'fulfilled' ? answerAttachmentsMapResult.value : {}

  async function handleQuestionUpvote() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;
    
    if (validQuestion.author_id === user.id) {
       console.error("Cannot upvote your own question");
       return;
    }

    await toggleQuestionUpvote(validQuestion.id, user.id)
    redirect(`/questions/${validQuestion.id}`)
  }

  async function handleAnswerUpvote(formData: FormData) {
    'use server'
    const answerId = formData.get('answerId') as string
    if (!answerId) return;

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;

    const { data: answerData } = await supabase.from('answers').select('author_id').eq('id', answerId).single()
    if (!answerData || answerData.author_id === user.id) {
       console.error("Cannot upvote your own answer");
       return;
    }

    await toggleAnswerUpvote(answerId, user.id)
    redirect(`/questions/${validQuestion.id}`)
  }

  async function submitAnswer(formData: FormData) {
    'use server'
    
    let body = formData.get('body') as string
    body = body?.trim() || ''

    if (!body) {
      console.error('Answer body must not be empty.')
      return
    }
    
    const attachment = formData.get('attachment') as File | null
    if (attachment && attachment.size > 0) {
      if (attachment.size > 10 * 1024 * 1024) return
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
      if (!allowed.includes(attachment.type)) return
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('User not authenticated')
      return
    }

    try {
      const answer = await createAnswer(validQuestion.id, user.id, body)
      if (attachment && attachment.size > 0) {
        await createAttachment(attachment, null, answer.id)
      }
    } catch (error) {
      console.error(error)
      return
    }

    redirect(`/questions/${validQuestion.id}`)
  }

  async function handleMarkSolved() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;
    
    const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
    if (!profile) return;
    
    const canSolve = validQuestion.author_id === profile.id || profile.role === 'teacher' || profile.role === 'admin'
    if (!canSolve) {
       console.error("Unauthorized to mark as solved")
       return;
    }

    try {
      await markQuestionSolved(validQuestion.id, profile.id)
    } catch (e) {
      console.error(e)
      return
    }

    redirect(`/questions/${validQuestion.id}`)
  }
  
  async function handleDeleteQuestion() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
    if (!profile) return
    
    const canDelete = validQuestion.author_id === profile.id || profile.role === 'teacher' || profile.role === 'admin'
    if (!canDelete) return
    
    await deleteQuestion(validQuestion.id)
    redirect(`/subjects/${subjectSlug}`) 
  }
  
  async function handleDeleteAnswer(formData: FormData) {
    'use server'
    const answerId = formData.get('answerId') as string
    if (!answerId) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
    if (!profile) return
    
    const { data: answerData } = await supabase.from('answers').select('author_id').eq('id', answerId).single()
    if (!answerData) return
    
    const canDelete = answerData.author_id === profile.id || profile.role === 'teacher' || profile.role === 'admin'
    if (!canDelete) return
    
    await deleteAnswer(answerId)
    redirect(`/questions/${validQuestion.id}`)
  }

  async function handleDeleteAttachment(formData: FormData) {
    'use server'
    const attachmentId = formData.get('attachmentId') as string
    if (!attachmentId) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data: profile } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
    if (!profile) return
    
    const attData = await getAttachmentById(attachmentId)
    if (!attData) return
    
    const canDelete = attData.uploaded_by === profile.id || profile.role === 'teacher' || profile.role === 'admin'
    if (!canDelete) return
    
    await deleteAttachment(attachmentId)
    redirect(`/questions/${validQuestion.id}`)
  }

  function renderAttachments(attachments: any[]) {
    if (!attachments || attachments.length === 0) return null
    return (
      <div className="flex flex-wrap gap-4 mt-6">
        {attachments.map(att => {
          const canDelete = userProfile && (att.uploaded_by === userProfile.id || userProfile.role === 'teacher' || userProfile.role === 'admin')
          return (
            <div key={att.id} className="relative group border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center max-w-sm">
              {att.mime_type.startsWith('image/') ? (
                <Link href={`/attachments/image/${att.id}?question=${validQuestion.id}`} className="block overflow-hidden rounded">
                  <img 
                    src={att.signedUrl} 
                    alt={att.file_name} 
                    className="max-w-full h-auto max-h-64 object-contain cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:brightness-105" 
                  />
                </Link>
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <span className="text-2xl">📄</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-black dark:text-white truncate max-w-[200px]">{att.file_name}</span>
                    <div className="flex items-center gap-3 mt-1">
                      <Link href={`/attachments/view/${att.id}?question=${validQuestion.id}`} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">View PDF</Link>
                      <a href={att.signedUrl} download={att.file_name} className="text-xs text-zinc-600 dark:text-zinc-400 hover:underline">Download</a>
                    </div>
                  </div>
                </div>
              )}
              {canDelete && (
                <form action={handleDeleteAttachment} className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="attachmentId" value={att.id} />
                  <button type="submit" className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm hover:bg-red-600 transition-colors" title="Delete Attachment">
                    &times;
                  </button>
                </form>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16">
        <div className="mb-8">
          <Link href={subjectSlug ? `/subjects/${subjectSlug}` : '/'} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Back {subjectName ? `to ${subjectName}` : ''}
          </Link>
        </div>
        
        <Card className="mb-12 p-6 sm:p-8">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl font-bold tracking-tight mb-4">
              {validQuestion.title}
            </h1>
            {validQuestion.is_solved && (
              <Badge variant="success" className="shrink-0 text-sm py-1 px-3">
                ✓ Solved
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-6 flex flex-col gap-1">
            <span>Asked by: <Link href={`/users/${validQuestion.author_id}`} className="hover:underline text-foreground">{validQuestion.author?.display_name}</Link></span>
            {validQuestion.is_solved && validQuestion.solver?.display_name && (
              <span className="text-success font-medium">Solved by: <Link href={`/users/${validQuestion.solver_id}`} className="hover:underline">{validQuestion.solver.display_name}</Link></span>
            )}
          </div>
          <p className="text-foreground whitespace-pre-wrap mb-6">
            {validQuestion.body}
          </p>

          {renderAttachments(questionAttachments)}
          
          <div className="flex items-center justify-between mb-6 mt-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg">▲ {validQuestion.voteCount}</span>
              {user && user.id !== validQuestion.author_id && (
                <form action={handleQuestionUpvote}>
                  <Button type="submit" variant={hasUpvotedQuestion ? 'primary' : 'secondary'} className="px-3 py-1.5 h-auto">
                    {hasUpvotedQuestion ? '▲ Upvoted' : '▲ Upvote'}
                  </Button>
                </form>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {canEditQuestion && (
                <Link href={`/questions/${validQuestion.id}/edit`} className="px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                  Edit
                </Link>
              )}
              {userProfile && (validQuestion.author_id === userProfile.id || userProfile.role === 'teacher' || userProfile.role === 'admin') && (
                <DeleteButton action={handleDeleteQuestion} />
              )}
              {user && user.id !== validQuestion.author_id && (
                <ReportDialog targetType="question" targetId={validQuestion.id} />
              )}
            </div>
          </div>

          {!validQuestion.is_solved && hasPermission && (
             <form action={handleMarkSolved} className="mt-2">
               <Button type="submit" className="bg-success hover:bg-success/90 text-white">
                 Mark as Solved
               </Button>
             </form>
          )}
        </Card>

        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Answers ({answers.length})
        </h2>

        <div className="flex flex-col gap-4 mb-12">
          {answers.length > 0 ? (
            answers.map((answer) => (
              <Card key={answer.id} className="p-6">
                <div className="text-sm font-medium text-foreground mb-2">
                  Answered by: <Link href={`/users/${answer.author_id}`} className="hover:underline">{answer.author?.display_name}</Link>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">{answer.body}</p>
                
                {renderAttachments(answerAttachmentsMap[answer.id])}

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {new Date(answer.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {user && user.id === answer.author_id && (
                        <Link href={`/answers/${answer.id}/edit`} className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                          Edit
                        </Link>
                      )}
                      {userProfile && (answer.author_id === userProfile.id || userProfile.role === 'teacher' || userProfile.role === 'admin') && (
                        <DeleteButton action={handleDeleteAnswer}>
                          <input type="hidden" name="answerId" value={answer.id} />
                        </DeleteButton>
                      )}
                      {user && user.id !== answer.author_id && (
                        <ReportDialog targetType="answer" targetId={answer.id} />
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm">▲ {answer.voteCount}</span>
                      {user && user.id !== answer.author_id && (
                        <form action={handleAnswerUpvote}>
                          <input type="hidden" name="answerId" value={answer.id} />
                          <Button type="submit" variant={userUpvotedAnswers[answer.id] ? 'primary' : 'secondary'} className="px-2.5 py-1 h-auto text-xs">
                            {userUpvotedAnswers[answer.id] ? '▲ Upvoted' : '▲ Upvote'}
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No answers yet. Be the first to answer!</p>
            </Card>
          )}
        </div>

        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          Your Answer
        </h2>

        <Card className="p-8">
          <ValidatedForm action={submitAnswer} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Textarea 
                name="body" 
                rows={5}
                required 
                placeholder="Write your answer..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="attachment" className="text-sm font-medium">
                Attachment (Optional)
              </label>
              <Input 
                type="file" 
                id="attachment" 
                name="attachment" 
                accept="image/png, image/jpeg, image/webp, application/pdf"
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-surface-elevated file:text-foreground hover:file:bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Max size 10MB. Allowed: PNG, JPG, WEBP, PDF.</p>
            </div>
            <div className="pt-2">
              <SubmitButton className="w-full" pendingText="Posting...">
                Post Answer
              </SubmitButton>
            </div>
          </ValidatedForm>
        </Card>
      </div>
    </div>
  )
}
