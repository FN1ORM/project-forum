import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getSubjects } from '@/utils/data/subjects'
import { getGlobalFeed } from '@/utils/data/questions'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SortTabs } from '@/components/ui/sort-tabs'
import { Pagination } from '@/components/ui/pagination'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { sort, page } = await searchParams
  const currentSort = sort || 'latest'
  const pageNumber = parseInt(page || '1', 10)
  const pageSize = 10

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let subjects: any[] = []
  let questions: any[] = []
  let totalPages = 0
  let profile = null

  if (user) {
    try {
      const { data } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
      profile = data
      subjects = await getSubjects()
      const feed = await getGlobalFeed(currentSort, user.id, pageNumber, pageSize)
      questions = feed.questions
      totalPages = Math.ceil(feed.totalCount / pageSize)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-12">
        {user ? (
          <div className="flex flex-col gap-4 w-full">
            <h1 className="text-3xl font-semibold text-black dark:text-white">
              Welcome, {profile?.display_name || ''}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
            <div className="mt-8 w-full text-left">
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                Subjects
              </h2>
              {subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subject) => (
                    <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                      <Card className="p-5 sm:p-6 hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors h-full flex items-center">
                        <h3 className="text-lg font-semibold tracking-tight">{subject.name}</h3>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>No subjects available at the moment.</p>
                </Card>
              )}
            </div>

            <div className="mt-12 w-full text-left">
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                Global Feed
              </h2>
              
              <SortTabs />

              <div className="flex flex-col gap-4">
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <Link key={q.id} href={`/questions/${q.id}`}>
                      <Card className="p-5 sm:p-6 hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg font-semibold tracking-tight">{q.title}</h3>
                          {q.is_solved && (
                            <Badge variant="success" className="shrink-0">
                              ✓ Solved
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2">{q.body}</p>
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
                          <div className="flex items-center gap-2">
                            <span>Asked by {q.author?.display_name}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>in {q.subjects?.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-foreground">▲ {q.voteCount}</span>
                            <span>{new Date(q.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    <p>No questions found for this filter.</p>
                  </Card>
                )}
              </div>

              <Pagination currentPage={pageNumber} totalPages={totalPages} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-black dark:text-white">
              Welcome to Project Forum
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              You are not signed in.
            </p>
            <div className="mt-4">
              <Link
                href="/login"
                className="px-6 py-3 rounded-full bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
