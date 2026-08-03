import { Suspense } from 'react'
import Link from 'next/link'

import { getPinnedAnnouncements, getAllAnnouncements } from '@/utils/data/announcements'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Pin, Trash2, Edit2, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { AnnouncementActions } from './announcement-actions'
import type { Announcement } from '@/utils/data/announcements'

import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
async function AnnouncementsFeed({ searchParams }: { searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || '1')
  
  const [pinned, all] = await Promise.all([
    getPinnedAnnouncements(),
    getAllAnnouncements(page, 20)
  ])

  // Filter out pinned from all to avoid duplicates
  const pinnedIds = new Set(pinned.map(a => a.id))
  const unpinned = all.announcements.filter(a => !pinnedIds.has(a.id))

  const totalDisplayed = pinned.length + unpinned.length

  if (totalDisplayed === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground/50" />
        <div className="flex flex-col gap-1">
          <h3 className="font-medium text-foreground text-lg">No announcements yet.</h3>
          <p>Create the first announcement for your students.</p>
        </div>
        <Link prefetch={false} href="/teacher/announcements/new" className="mt-4 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:opacity-90">
          Create Announcement
        </Link>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-4">
          {pinned.map(a => (
            <AnnouncementCard 
              key={a.id} 
              announcement={a} 
              actions={<AnnouncementActions announcement={a} />}
            />
          ))}
          {unpinned.map(a => (
            <AnnouncementCard 
              key={a.id} 
              announcement={a} 
              actions={<AnnouncementActions announcement={a} />}
            />
          ))}</div>
  )
}

export default function TeacherAnnouncementsPage({ searchParams }: { searchParams: { page?: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Announcements</h2>
        <Link prefetch={false} href="/teacher/announcements/new" className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-primary text-primary-foreground hover:opacity-90">
          Create New
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      }>
        <AnnouncementsFeed searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
