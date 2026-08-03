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

function isNew(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  if (diffTime < 0) return false // Future date
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:p-6 transition-colors hover:border-primary/50 relative group">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {announcement.is_pinned && (
              <Badge variant="default" className="bg-primary text-primary-foreground">
                <Pin className="w-3 h-3 mr-1" /> Pinned
              </Badge>
            )}
            {isNew(announcement.created_at) && (
              <Badge variant="secondary" className="text-blue-500 border-blue-500">
                NEW
              </Badge>
            )}
            <h3 className="text-lg font-semibold tracking-tight">{announcement.title}</h3>
          </div>
          
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>{announcement.author?.display_name || 'Anonymous'}</span>
            <span>•</span>
            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <AnnouncementActions announcement={announcement} />
        </div>
      </div>

      <div className="text-sm text-foreground/90 whitespace-pre-wrap max-h-32 overflow-hidden relative">
        {announcement.message}
        {announcement.message.length > 200 && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>

      {announcement.resources && announcement.resources.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 border-t border-border/50 pt-4">
          <LinkIcon className="w-4 h-4" />
          <span>{announcement.resources.length} resource{announcement.resources.length === 1 ? '' : 's'} attached</span>
        </div>
      )}
    </Card>
  )
}

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
      {pinned.map(a => <AnnouncementCard key={a.id} announcement={a} />)}
      {unpinned.map(a => <AnnouncementCard key={a.id} announcement={a} />)}
    </div>
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
