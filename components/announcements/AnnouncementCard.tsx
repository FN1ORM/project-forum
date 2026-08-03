import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pin, FileText } from 'lucide-react'
import type { Announcement } from '@/utils/data/announcements'

function isNew(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  if (diffTime < 0) return false // Future date
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

interface AnnouncementCardProps {
  announcement: Announcement
  actions?: React.ReactNode
}

export function AnnouncementCard({ announcement, actions }: AnnouncementCardProps) {
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
              <Badge variant="secondary" className="text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-950/50">
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
        
        {actions && (
          <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            {actions}
          </div>
        )}
      </div>

      <div className="text-sm text-foreground/90 whitespace-pre-wrap">
        {announcement.message}
      </div>

      {announcement.resources && announcement.resources.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border/50">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resources</span>
          <div className="flex flex-col gap-2">
            {announcement.resources.map((res, i) => (
              <a 
                key={i} 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                aria-label={`Open resource: ${res.label}`}
              >
                <FileText className="w-4 h-4 text-muted-foreground" />
                {res.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
