import { Suspense } from 'react'
import Link from 'next/link'
import { getPinnedAnnouncements, getAllAnnouncements } from '@/utils/data/announcements'
import type { Announcement } from '@/utils/data/announcements'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Pagination } from '@/components/ui/pagination'

export const metadata = {
  title: 'Announcements',
  description: 'Important announcements and updates.',
}

function AnnouncementsFallback() {
  return (
    <div className="flex flex-col gap-4 w-full">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  )
}

async function AnnouncementsList({ pageNumber, pageSize }: { pageNumber: number, pageSize: number }) {
  let pinned: Announcement[] = []
  let all = { announcements: [] as Announcement[], totalCount: 0 }
  
  try {
    const [p, a] = await Promise.all([
      getPinnedAnnouncements(),
      getAllAnnouncements(pageNumber, pageSize)
    ])
    pinned = p
    all = a
  } catch (error) {
    console.error(error)
  }

  // Filter out duplicates (if pinned items appear in the paginated list)
  const pinnedIds = new Set(pinned.map((a: Announcement) => a.id))
  const unpinned = all.announcements.filter((a: Announcement) => !pinnedIds.has(a.id))

  const totalDisplayed = (pageNumber === 1 ? pinned.length : 0) + unpinned.length

  if (totalDisplayed === 0) {
    return (
      <Card className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
        <h3 className="font-medium text-foreground text-lg">No announcements have been published.</h3>
        <p>Check back later for updates.</p>
      </Card>
    )
  }

  const totalPages = Math.ceil(all.totalCount / pageSize)

  return (
    <div className="flex flex-col gap-4">
      {pageNumber === 1 && pinned.map(a => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
      {unpinned.map(a => (
        <AnnouncementCard key={a.id} announcement={a} />
      ))}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={pageNumber} totalPages={totalPages} />
        </div>
      )}
    </div>
  )
}

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page } = await searchParams
  const pageNumber = parseInt(page || '1', 10)
  const pageSize = 10

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-4xl mx-auto flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Announcements</h1>
            <p className="text-muted-foreground">Important updates and resources from your teachers.</p>
          </div>
          <Link 
            prefetch={false} 
            href="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <Suspense fallback={<AnnouncementsFallback />} key={pageNumber}>
          <AnnouncementsList pageNumber={pageNumber} pageSize={pageSize} />
        </Suspense>
      </main>
    </div>
  )
}
