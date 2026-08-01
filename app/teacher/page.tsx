import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUnsolvedQuestions, getUnansweredQuestions, getRecentQuestions } from '@/utils/data/teacher'
import Link from 'next/link'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (!profile || profile.role !== 'teacher') {
    redirect('/')
  }

  let unsolved: any[] = []
  let unanswered: any[] = []
  let recent: any[] = []
  
  try {
    const [u1, u2, u3] = await Promise.all([
      getUnsolvedQuestions(),
      getUnansweredQuestions(),
      getRecentQuestions(20)
    ])
    unsolved = u1
    unanswered = u2
    recent = u3
  } catch (e) {
    console.error(e)
  }

  function renderQuestionCard(question: any) {
    return (
      <Link key={question.id} href={`/questions/${question.id}`} className="block p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="font-semibold text-lg text-black dark:text-white">{question.title}</h3>
          {question.is_solved && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">
              ✓ Solved
            </span>
          )}
        </div>
        <div className="text-sm text-zinc-500 mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span>Asked by: {question.author?.display_name}</span>
          <span className="hidden sm:inline">•</span>
          <span>Subject: {question.subjects?.name}</span>
          <span className="hidden sm:inline">•</span>
          <span>{new Date(question.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <span>▲ {question.voteCount}</span>
          <span>💬 {question.answerCount} Answers</span>
        </div>
      </Link>
    )
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-12">
        <h1 className="text-4xl font-bold text-black dark:text-white">Teacher Dashboard</h1>
        
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">Unsolved Questions</h2>
          <div className="flex flex-col gap-4">
            {unsolved.length > 0 ? unsolved.map(renderQuestionCard) : <p className="text-zinc-500">No unsolved questions.</p>}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">Unanswered Questions</h2>
          <div className="flex flex-col gap-4">
            {unanswered.length > 0 ? unanswered.map(renderQuestionCard) : <p className="text-zinc-500">No unanswered questions.</p>}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-black dark:text-white">Recently Created Questions</h2>
          <div className="flex flex-col gap-4">
            {recent.length > 0 ? recent.map(renderQuestionCard) : <p className="text-zinc-500">No recent questions.</p>}
          </div>
        </section>
      </main>
    </div>
  )
}
