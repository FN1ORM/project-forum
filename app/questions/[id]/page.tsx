import { notFound, redirect } from 'next/navigation'
import { getQuestionById } from '@/utils/data/questions'
import { getAnswersByQuestion, createAnswer } from '@/utils/data/answers'
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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <div className="max-w-3xl w-full mx-auto">
        <div className="mb-8">
          <Link href={subjectSlug ? `/subjects/${subjectSlug}` : '/'} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Back {subjectName ? `to ${subjectName}` : ''}
          </Link>
        </div>
        
        <div className="mb-12 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-4">
            {validQuestion.title}
          </h1>
          <div className="text-sm text-zinc-500 mb-6">
            Asked by: {validQuestion.author?.display_name}
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
            {validQuestion.body}
          </p>
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
                <div className="mt-4 text-xs text-zinc-500">
                  {new Date(answer.created_at).toLocaleDateString()}
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
