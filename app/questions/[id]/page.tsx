import { notFound, redirect } from 'next/navigation'
import { getQuestionById, markQuestionSolved, deleteQuestion } from '@/utils/data/questions'
import { getAnswersByQuestion, createAnswer, deleteAnswer } from '@/utils/data/answers'
import { hasUserUpvotedQuestion, hasUserUpvotedAnswer, toggleQuestionUpvote, toggleAnswerUpvote } from '@/utils/data/votes'
import { getQuestionAttachments, getAnswerAttachments, createAttachment, deleteAttachment, getAttachmentById } from '@/utils/data/attachments'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { DeleteButton } from './delete-button'

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  let question = null
  try {
    question = await getQuestionById(id)
  } catch (error) {
    console.error(error)
  }

  if (!question) {
    notFound()
  }

  const validQuestion = question

  let answers: any[] = []
  try {
    answers = await getAnswersByQuestion(validQuestion.id)
  } catch (error) {
    console.error(error)
  }

  const subjectSlug = validQuestion.subjects?.slug
  const subjectName = validQuestion.subjects?.name

  let userProfile = null;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase.from('profiles').select('id, role').eq('id', user.id).single()
    userProfile = data;
  }

  const hasPermission = userProfile && (
    validQuestion.author_id === userProfile.id || 
    userProfile.role === 'teacher' || 
    userProfile.role === 'admin'
  );

  const isAuthor = user && user.id === validQuestion.author_id;
  const isTeacherOrAdmin = userProfile && (userProfile.role === 'teacher' || userProfile.role === 'admin');
  const canEditQuestion = (isAuthor && !validQuestion.is_solved) || isTeacherOrAdmin;

  let hasUpvotedQuestion = false;
  let userUpvotedAnswers: Record<string, boolean> = {};
  if (user) {
    hasUpvotedQuestion = await hasUserUpvotedQuestion(validQuestion.id, user.id)
    await Promise.all(answers.map(async (a) => {
      userUpvotedAnswers[a.id] = await hasUserUpvotedAnswer(a.id, user.id)
    }))
  }

  let questionAttachments: any[] = []
  let answerAttachmentsMap: Record<string, any[]> = {}
  try {
    questionAttachments = await getQuestionAttachments(validQuestion.id)
    await Promise.all(answers.map(async (a) => {
      answerAttachmentsMap[a.id] = await getAnswerAttachments(a.id)
    }))
  } catch (error) {
    console.error(error)
  }

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
                <img src={att.signedUrl} alt={att.file_name} className="max-w-full h-auto max-h-64 rounded object-contain" />
              ) : (
                <div className="flex items-center gap-3 p-4">
                  <span className="text-2xl">📄</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-black dark:text-white truncate max-w-[200px]">{att.file_name}</span>
                    <a href={att.signedUrl} download={att.file_name} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1">Download PDF</a>
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
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <div className="max-w-3xl w-full mx-auto">
        <div className="mb-8">
          <Link href={subjectSlug ? `/subjects/${subjectSlug}` : '/'} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Back {subjectName ? `to ${subjectName}` : ''}
          </Link>
        </div>
        
        <div className="mb-12 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
              {validQuestion.title}
            </h1>
            {validQuestion.is_solved && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">
                ✓ Solved
              </span>
            )}
          </div>
          <div className="text-sm text-zinc-500 mb-6 flex flex-col gap-1">
            <span>Asked by: {validQuestion.author?.display_name}</span>
            {validQuestion.is_solved && validQuestion.solver?.display_name && (
              <span className="text-green-700 dark:text-green-400">Solved by: {validQuestion.solver.display_name}</span>
            )}
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap mb-6">
            {validQuestion.body}
          </p>

          {renderAttachments(questionAttachments)}
          
          <div className="flex items-center justify-between mb-6 mt-6">
            <div className="flex items-center gap-4">
              <span className="font-semibold text-lg text-black dark:text-white">▲ {validQuestion.voteCount}</span>
              {user && user.id !== validQuestion.author_id && (
                <form action={handleQuestionUpvote}>
                  <button type="submit" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${hasUpvotedQuestion ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}>
                    {hasUpvotedQuestion ? '▲ Upvoted' : '▲ Upvote'}
                  </button>
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
            </div>
          </div>

          {!validQuestion.is_solved && hasPermission && (
             <form action={handleMarkSolved}>
               <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors">
                 Mark as Solved
               </button>
             </form>
          )}
        </div>

        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
          Answers ({answers.length})
        </h2>

        <div className="flex flex-col gap-4 mb-12">
          {answers.length > 0 ? (
            answers.map((answer) => (
              <div key={answer.id} className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="text-sm font-medium text-black dark:text-white mb-2">
                  Answered by: {answer.author?.display_name}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{answer.body}</p>
                
                {renderAttachments(answerAttachmentsMap[answer.id])}

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    {new Date(answer.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      {user && user.id === answer.author_id && (
                        <Link href={`/answers/${answer.id}/edit`} className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors">
                          Edit
                        </Link>
                      )}
                      {userProfile && (answer.author_id === userProfile.id || userProfile.role === 'teacher' || userProfile.role === 'admin') && (
                        <DeleteButton action={handleDeleteAnswer}>
                          <input type="hidden" name="answerId" value={answer.id} />
                        </DeleteButton>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-sm text-black dark:text-white">▲ {answer.voteCount}</span>
                      {user && user.id !== answer.author_id && (
                        <form action={handleAnswerUpvote}>
                          <input type="hidden" name="answerId" value={answer.id} />
                          <button type="submit" className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${userUpvotedAnswers[answer.id] ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}>
                            {userUpvotedAnswers[answer.id] ? '▲ Upvoted' : '▲ Upvote'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-zinc-500">No answers yet. Be the first to answer!</p>
          )}
        </div>

        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          Your Answer
        </h2>

        <form action={submitAnswer} encType="multipart/form-data" className="flex flex-col gap-6 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-col gap-2">
            <textarea 
              name="body" 
              rows={5}
              required 
              className="p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-y"
              placeholder="Write your answer..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="attachment" className="text-sm font-medium text-black dark:text-white">
              Attachment (Optional)
            </label>
            <input 
              type="file" 
              id="attachment" 
              name="attachment" 
              accept="image/png, image/jpeg, image/webp, application/pdf"
              className="p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
            />
            <p className="text-xs text-zinc-500">Max size 10MB. Allowed: PNG, JPG, WEBP, PDF.</p>
          </div>
          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
            >
              Post Answer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
