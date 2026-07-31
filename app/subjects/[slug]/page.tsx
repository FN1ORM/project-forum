import { notFound } from 'next/navigation'
import { getSubjectBySlug } from '@/utils/data/subjects'
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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <div className="max-w-3xl w-full mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold text-black dark:text-white mb-6">
          {subject.name}
        </h1>
        
        <div className="p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <p className="text-zinc-600 dark:text-zinc-400">
            No questions yet.
          </p>
        </div>
      </div>
    </div>
  )
}
