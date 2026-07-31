import { notFound } from 'next/navigation'
import { getSubjectBySlug } from '@/utils/data/subjects'
import { getQuestionsBySubject } from '@/utils/data/questions'
import Link from 'next/link'

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  let subject = null;
  try {
    subject = await getSubjectBySlug(slug)
  } catch (error) {
    console.error(error)
  }

  if (!subject) {
    notFound()
  }

  let questions: any[] = []
  try {
    questions = await getQuestionsBySubject(subject.id)
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <div className="max-w-3xl w-full mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Back to Home
          </Link>
          <Link 
            href={`/subjects/${subject.slug}/ask`}
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium"
          >
            Ask Question
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold text-black dark:text-white mb-6">
          {subject.name}
        </h1>
        
        <div className="flex flex-col gap-4">
          {questions.length > 0 ? (
            questions.map((q) => (
              <Link key={q.id} href={`/questions/${q.id}`} className="block p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-lg text-black dark:text-white">{q.title}</h3>
                  {q.is_solved && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 whitespace-nowrap">
                      ✓ Solved
                    </span>
                  )}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">{q.body}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                  <span>Asked by: {q.author?.display_name}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-black dark:text-white">▲ {q.voteCount}</span>
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <p className="text-zinc-600 dark:text-zinc-400">
                No questions yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
