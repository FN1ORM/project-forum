import { Suspense } from 'react'
import { searchQuestions } from '@/utils/data/search'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

async function SearchResults({ query, pageNumber, pageSize }: { query: string, pageNumber: number, pageSize: number }) {
  const { questions, totalCount } = await searchQuestions(query, pageNumber, pageSize)
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <>
      <p className="text-muted-foreground mb-6">
        {query ? `Found ${totalCount} results for "${query}"` : 'Enter a search term.'}
      </p>
      
      <div className="flex flex-col gap-4">
        {questions.length > 0 ? (
          questions.map((q: any) => (
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
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span>Asked by <Link prefetch={false} href={`/users/${q.author_id}`} className="hover:underline text-foreground">{q.author?.display_name}</Link></span>
                  <span className="hidden sm:inline">•</span>
                  <span>in {q.subjects?.name}</span>
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
            <p>{query ? 'No results found.' : 'Use the search bar above to find questions.'}</p>
          </Card>
        )}
      </div>

      <Pagination currentPage={pageNumber} totalPages={totalPages} />
    </>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  const { q, page } = await searchParams
  
  const query = q || ''
  const pageNumber = parseInt(page || '1', 10)
  const pageSize = 10

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">
          Search Results
        </h1>
        
        <Suspense fallback={<QuestionListFallback />} key={`${query}-${pageNumber}`}>
          <SearchResults query={query} pageNumber={pageNumber} pageSize={pageSize} />
        </Suspense>
      </div>
    </div>
  )
}
