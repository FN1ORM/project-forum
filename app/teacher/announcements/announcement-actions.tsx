'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Edit2, Trash2, Pin, PinOff, Loader2 } from 'lucide-react'
import { deleteAnnouncementAction, toggleAnnouncementPinAction } from '@/app/actions/announcements'
import { toast } from 'sonner'
import type { Announcement } from '@/utils/data/announcements'
import * as AlertDialog from '@radix-ui/react-alert-dialog'

export function AnnouncementActions({ announcement }: { announcement: Announcement }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingPin, setIsTogglingPin] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteAnnouncementAction(announcement.id)
    if (result.error) {
      toast.error(result.error)
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    } else {
      toast.success('Announcement deleted')
    }
  }

  async function handleTogglePin() {
    setIsTogglingPin(true)
    const result = await toggleAnnouncementPinAction(announcement.id, !announcement.is_pinned)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(announcement.is_pinned ? 'Announcement unpinned' : 'Announcement pinned')
    }
    setIsTogglingPin(false)
  }

  return (
    <>
      <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md shadow-sm border border-border/50 p-1">
        <Button 
          variant="ghost" 
          className="h-8 w-8 px-0" 
          onClick={handleTogglePin} 
          disabled={isTogglingPin} 
          title={announcement.is_pinned ? "Unpin" : "Pin"}
          aria-label={announcement.is_pinned ? "Unpin announcement" : "Pin announcement"}
        >
          {isTogglingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : announcement.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </Button>
        <Button 
          variant="ghost" 
          className="h-8 w-8 px-0" 
          onClick={() => router.push(`/teacher/announcements/${announcement.id}/edit`)} 
          title="Edit"
          aria-label="Edit announcement"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          className="h-8 w-8 px-0 text-destructive hover:text-destructive hover:bg-destructive/10" 
          onClick={() => setShowDeleteConfirm(true)} 
          title="Delete"
          aria-label="Delete announcement"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <AlertDialog.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full">
            <AlertDialog.Title className="text-lg font-semibold">
              Delete Announcement
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-muted-foreground">
              This action cannot be undone. This will permanently delete this announcement.
            </AlertDialog.Description>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-2">
              <AlertDialog.Cancel asChild>
                <Button variant="secondary" disabled={isDeleting}>Cancel</Button>
              </AlertDialog.Cancel>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Delete
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
