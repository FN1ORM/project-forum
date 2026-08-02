import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { getSubjectBySlug } from '@/utils/data/subjects'
import { getSubjectFeed } from '@/utils/data/questions'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SortTabs } from '@/components/ui/sort-tabs'
import { Pagination } from '@/components/ui/pagination'
import { QuestionCardSkeleton } from '@/components/skeletons/question-card-skeleton'

function QuestionListFallback() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <QuestionCardSkeleton key={i} />
      ))}
    </div>
  )
}

async function SubjectFeed({ slug, currentSort, pageNumber, pageSize }: { slug: string, currentSort: string, pageNumber: number, pageSize: number }) {
  let questions: any[] = []
  let totalPages = 0
  
  try {
    const supabase = await createClient()
    const [{ data: { user } }, subject] = await Promise.all([
      supabase.auth.getUser(),
      getSubjectBySlug(slug)
    ])
    
    if (subject) {
      const feed = await getSubjectFeed(subject.id, currentSort, user?.id, pageNumber, pageSize)
      questions = feed.questions
      totalPages = Math.ceil(feed.totalCount / pageSize)
    }
  } catch (error) {
    console.error(error)
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {questions.length > 0 ? (
          questions.map((q) => (
            <Card key={q.id} className="relative p-5 sm:p-6 hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors">
              <Link prefetch={false} href={`/questions/${q.id}`} className="absolute inset-0 z-0" aria-label={q.title} />
              <div className="relative z-10 pointer-events-none flex flex-col h-full">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-lg font-semibold tracking-tight">{q.title}</h3>
                  {q.is_solved && (
                    <Badge variant="success" className="shrink-0 pointer-events-auto">
                      ✓ Solved
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2">{q.body}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="pointer-events-auto">
                    <span>Asked by <Link prefetch={false} href={`/users/${q.author_id}`} className="hover:underline text-foreground">{q.author?.display_name}</Link></span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-foreground">▲ {q.voteCount}</span>
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <p>No questions yet in this subject. Be the first to ask!</p>
          </Card>
        )}
      </div>
      <Pagination currentPage={pageNumber} totalPages={totalPages} />
    </>
  )
}

async function SubjectHeader({ slug }: { slug: string }) {
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
    <>
      <div className="mb-8 flex justify-between items-center">
        <Link prefetch={false} href="/" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          &larr; Back to Home
        </Link>
        <Link prefetch={false} 
          href={`/subjects/${subject.slug}/ask`}
          className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium"
        >
          Ask Question
        </Link>
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-6">
        {subject.name}
      </h1>
    </>
  )
}

function SubjectHeaderSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 flex justify-between items-center">
        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="h-9 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
      <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
    </div>
  )
}

export default async function SubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { slug } = await params
  const { sort, page } = await searchParams
  const currentSort = sort || 'latest'
  const pageNumber = parseInt(page || '1', 10)
  const pageSize = 10

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        <Suspense fallback={<SubjectHeaderSkeleton />}>
          <SubjectHeader slug={slug} />
        </Suspense>
        
        <SortTabs />
        
        <Suspense fallback={<QuestionListFallback />} key={`${slug}-${currentSort}-${pageNumber}`}>
          <SubjectFeed slug={slug} currentSort={currentSort} pageNumber={pageNumber} pageSize={pageSize} />
        </Suspense>
      </div>
    </div>
  )
}
