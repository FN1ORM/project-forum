'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit2, Trash2, Pin, PinOff, Loader2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { deleteAnnouncementAction, toggleAnnouncementPinAction } from '@/app/actions/announcements'

export function AnnouncementActions({ announcement }: { announcement: any }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingPin, setIsTogglingPin] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteAnnouncementAction(announcement.id)
    if (result.error) {
      alert(result.error) // Simple fallback for toast since no toast component exists
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
    // On success, Next.js revalidates the path and the item disappears
  }

  async function handleTogglePin() {
    setIsTogglingPin(true)
    const result = await toggleAnnouncementPinAction(announcement.id, !announcement.is_pinned)
    if (result.error) {
      alert(result.error)
    }
    setIsTogglingPin(false)
  }

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 text-destructive px-3 py-1.5 rounded-md text-sm">
        <span className="font-medium mr-2">Delete?</span>
        <Button variant="secondary" className="h-7 text-xs border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</Button>
        <Button variant="primary" className="h-7 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Confirm'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-md shadow-sm border border-border/50 p-1">
      <Button variant="ghost" className="h-8 w-8 px-0" onClick={handleTogglePin} disabled={isTogglingPin} title={announcement.is_pinned ? "Unpin" : "Pin"}>
        {isTogglingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : announcement.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
      </Button>
      <Button variant="ghost" className="h-8 w-8 px-0" onClick={() => window.location.href = `/teacher/announcements/${announcement.id}/edit`} title="Edit">
        <Edit2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" className="h-8 w-8 px-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setShowDeleteConfirm(true)} title="Delete">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}
