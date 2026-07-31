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
              <div key={q.id} className="p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <h3 className="font-semibold text-lg text-black dark:text-white mb-2">{q.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 line-clamp-2">{q.body}</p>
                <div className="mt-4 text-xs text-zinc-500">
                  {new Date(q.created_at).toLocaleDateString()}
                </div>
              </div>
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
