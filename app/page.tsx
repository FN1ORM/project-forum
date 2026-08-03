import { Suspense } from 'react'
import { getUserAndProfile } from '@/utils/data/user'
import Link from 'next/link'
import { getSubjects } from '@/utils/data/subjects'
import { getGlobalFeed } from '@/utils/data/questions'
import { getPinnedAnnouncements, getLatestAnnouncements } from '@/utils/data/announcements'
import type { Announcement } from '@/utils/data/announcements'
import { Card } from '@/components/ui/card'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { Skeleton } from '@/components/ui/skeleton'
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

function AnnouncementsFallback() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  )
}

async function AnnouncementsSection() {
  let pinned: Announcement[] = []
  let unpinned: Announcement[] = []
  
  try {
    const [p, l] = await Promise.all([
      getPinnedAnnouncements(),
      getLatestAnnouncements(3)
    ])
    pinned = p
    unpinned = l
  } catch (error) {
    console.error(error)
  }

  // Filter out duplicates
  const pinnedIds = new Set(pinned.map(a => a.id))
  const displayUnpinned = unpinned.filter(a => !pinnedIds.has(a.id)).slice(0, 3)

  const totalDisplayed = pinned.length + displayUnpinned.length

  if (totalDisplayed === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
        <p>No announcements yet.</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {pinned.map(a => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
      {displayUnpinned.map(a => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
      <div className="flex justify-end mt-2">
        <Link prefetch={false} href="/announcements" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 text-primary">
          View All Announcements →
        </Link>
      </div>
    </div>
  )
}

async function GlobalFeed({ currentSort, pageNumber, pageSize }: { currentSort: string, pageNumber: number, pageSize: number }) {
  let questions: any[] = []
  let totalPages = 0
  
  try {
    const { user } = await getUserAndProfile()
    const feed = await getGlobalFeed(currentSort, user?.id, pageNumber, pageSize)
    questions = feed.questions
    totalPages = Math.ceil(feed.totalCount / pageSize)
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
            <p>No questions found for this filter.</p>
          </Card>
        )}
      </div>
      <Pagination currentPage={pageNumber} totalPages={totalPages} />
    </>
  )
}

async function HomeHeader() {
  const { user, profile } = await getUserAndProfile()
  
  let subjects: any[] = []

  if (user) {
    try {
      subjects = await getSubjects()
    } catch (error) {
      console.error(error)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-black dark:text-white">
          Welcome to Project Forum
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          You are not signed in.
        </p>
        <div className="mt-4">
          <Link prefetch={false}                 href="/login"
            className="px-6 py-3 rounded-full bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium"
          >
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-3xl font-semibold text-foreground">
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
              <Link prefetch={false} key={subject.id} href={`/subjects/${subject.slug}`}>
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
    </div>
  )
}

function HomeHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full animate-pulse">
      <div className="h-9 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      <div className="h-7 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      <div className="mt-8 w-full text-left">
        <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
          <div className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; page?: string }>
}) {
  const { sort, page } = await searchParams
  const currentSort = sort || 'latest'
  const pageNumber = parseInt(page || '1', 10)
  const pageSize = 10

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-12">
        <Suspense fallback={<HomeHeaderSkeleton />}>
          <HomeHeader />
        </Suspense>

        <div className="mt-12 w-full text-left">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Announcements
          </h2>
          <Suspense fallback={<AnnouncementsFallback />}>
            <AnnouncementsSection />
          </Suspense>
        </div>

        <div className="mt-8 w-full text-left">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Global Feed
          </h2>
          
          <SortTabs />

          <Suspense fallback={<QuestionListFallback />} key={`${currentSort}-${pageNumber}`}>
            <GlobalFeed currentSort={currentSort} pageNumber={pageNumber} pageSize={pageSize} />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
