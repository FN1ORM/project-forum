import { notFound, redirect } from 'next/navigation'
import { getQuestionById, markQuestionSolved } from '@/utils/data/questions'
import { getAnswersByQuestion, createAnswer } from '@/utils/data/answers'
import { hasUserUpvotedQuestion, hasUserUpvotedAnswer, toggleQuestionUpvote, toggleAnswerUpvote } from '@/utils/data/votes'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

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

  let hasUpvotedQuestion = false;
  let userUpvotedAnswers: Record<string, boolean> = {};
  if (user) {
    hasUpvotedQuestion = await hasUserUpvotedQuestion(validQuestion.id, user.id)
    await Promise.all(answers.map(async (a) => {
      userUpvotedAnswers[a.id] = await hasUserUpvotedAnswer(a.id, user.id)
    }))
  }

  async function handleQuestionUpvote() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return;
    
    // Check self-upvote on server
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

    // Prevent self-upvote on server, query db directly
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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('User not authenticated')
      return
    }

    try {
      await createAnswer(validQuestion.id, user.id, body)
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
          
          <div className="flex items-center gap-4 mb-6">
            <span className="font-semibold text-lg text-black dark:text-white">▲ {validQuestion.voteCount}</span>
            {user && user.id !== validQuestion.author_id && (
              <form action={handleQuestionUpvote}>
                <button type="submit" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${hasUpvotedQuestion ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white hover:bg-zinc-300 dark:hover:bg-zinc-700'}`}>
                  {hasUpvotedQuestion ? '▲ Upvoted' : '▲ Upvote'}
                </button>
              </form>
            )}
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
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-zinc-500">
                    {new Date(answer.created_at).toLocaleDateString()}
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
            ))
          ) : (
            <p className="text-zinc-500">No answers yet. Be the first to answer!</p>
          )}
        </div>

        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          Your Answer
        </h2>

        <form action={submitAnswer} className="flex flex-col gap-6 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-col gap-2">
            <textarea 
              name="body" 
              rows={5}
              required 
              className="p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-y"
              placeholder="Write your answer..."
            />
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
