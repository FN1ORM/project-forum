'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pin, Link as LinkIcon, Plus, GripVertical, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { createAnnouncementAction, updateAnnouncementAction } from '@/app/actions/announcements'
import { toast } from 'sonner'
import type { AnnouncementResource, Announcement } from '@/utils/data/announcements'

type Resource = AnnouncementResource & { id: string }

interface AnnouncementFormProps {
  initialData?: Announcement
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function isValidUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const router = useRouter()
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title || '')
  const [message, setMessage] = useState(initialData?.message || '')
  const [isPinned, setIsPinned] = useState(initialData?.is_pinned || false)
  const [resources, setResources] = useState<Resource[]>(
    (initialData?.resources || []).map(r => ({ ...r, id: generateId() }))
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  // Validation state
  const titleValid = title.trim().length > 0 && title.trim().length <= 200
  const messageValid = message.trim().length > 0 && message.trim().length <= 2000
  const resourcesValid = resources.every(r => r.label.trim().length > 0 && isValidUrl(r.url))
  
  const isValid = titleValid && messageValid && resourcesValid

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  // Mark dirty
  const markDirty = () => !isDirty && setIsDirty(true)

  const handleAddResource = () => {
    setResources([...resources, { id: generateId(), label: '', url: '' }])
    markDirty()
  }

  const handleRemoveResource = (id: string) => {
    setResources(resources.filter(r => r.id !== id))
    markDirty()
  }

  const handleResourceChange = (id: string, field: 'label' | 'url', value: string) => {
    setResources(resources.map(r => r.id === id ? { ...r, [field]: value } : r))
    markDirty()
  }

  // Drag and Drop
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    // Hack for firefox
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === id) return
    
    const draggedIndex = resources.findIndex(r => r.id === draggedId)
    const hoverIndex = resources.findIndex(r => r.id === id)
    
    const newResources = [...resources]
    const [draggedItem] = newResources.splice(draggedIndex, 1)
    newResources.splice(hoverIndex, 0, draggedItem)
    setResources(newResources)
    markDirty()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)
    setErrorMsg('')
    
    // Strip the internal IDs before sending to server
    const cleanResources = resources.map(({ label, url }) => ({ label: label.trim(), url: url.trim() }))
    
    const payload = {
      title: title.trim(),
      message: message.trim(),
      isPinned,
      resources: cleanResources
    }

    let result
    if (isEditing) {
      result = await updateAnnouncementAction(initialData.id, payload)
    } else {
      result = await createAnnouncementAction(payload)
    }

    if (result.error) {
      setErrorMsg(result.error)
      toast.error('Failed to save announcement')
      setIsSubmitting(false)
    } else {
      setIsDirty(false)
      toast.success(isEditing ? 'Announcement updated' : 'Announcement published')
      // Navigate back to announcements list
      router.push('/teacher/announcements')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Editor Column */}
      <div className="flex flex-col gap-6 bg-surface-elevated/30 p-6 rounded-xl border border-border/50">
        <h2 className="text-xl font-semibold tracking-tight">{isEditing ? 'Edit Announcement' : 'New Announcement'}</h2>
        
        {errorMsg && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md flex items-start gap-2 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="title-input" className="text-sm font-medium">Title</label>
            <Input 
              id="title-input"
              value={title} 
              onChange={e => { setTitle(e.target.value); markDirty() }} 
              placeholder="e.g. Week 1 Notes Released" 
              maxLength={200}
              className={!titleValid && title.length > 0 ? 'border-destructive' : ''}
            />
            <span className="text-xs text-muted-foreground self-end">{title.length}/200</span>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="message-input" className="text-sm font-medium">Message</label>
            <Textarea 
              id="message-input"
              value={message} 
              onChange={e => { setMessage(e.target.value); markDirty() }} 
              placeholder="Write your announcement here..." 
              rows={6}
              maxLength={2000}
              className={`resize-none ${!messageValid && message.length > 0 ? 'border-destructive' : ''}`}
            />
            <span className="text-xs text-muted-foreground self-end">{message.length}/2000</span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Resources</label>
              <Button type="button" variant="secondary" onClick={handleAddResource} className="h-8 text-xs py-1 px-3">
                <Plus className="w-3 h-3 mr-1" /> Add Resource
              </Button>
            </div>
            
            {resources.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1 text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-md bg-background/50">
                <span className="font-medium text-foreground">No resources added</span>
                <span>Add links to external documents, slides, or websites.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {resources.map((res, index) => {
                  const isUrlValid = res.url.length === 0 || isValidUrl(res.url)
                  const isLabelValid = res.label.length === 0 || res.label.trim().length > 0
                  
                  return (
                    <div 
                      key={res.id} 
                      className={`flex gap-3 items-start bg-background p-3 rounded-md border shadow-sm transition-all ${draggedId === res.id ? 'opacity-50 border-primary' : 'border-border'}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, res.id)}
                      onDragOver={(e) => handleDragOver(e, res.id)}
                      onDragEnd={() => setDraggedId(null)}
                    >
                      <div className="mt-2.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                        <GripVertical className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <Input 
                            aria-label={`Label for resource ${index + 1}`}
                            value={res.label} 
                            onChange={(e) => handleResourceChange(res.id, 'label', e.target.value)}
                            placeholder="Label (e.g. Week 1 Slides)" 
                            className={`h-9 text-sm ${!isLabelValid ? 'border-destructive' : ''}`}
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Input 
                            aria-label={`URL for resource ${index + 1}`}
                            value={res.url} 
                            onChange={(e) => handleResourceChange(res.id, 'url', e.target.value)}
                            placeholder="URL (https://...)" 
                            className={`h-9 text-sm ${!isUrlValid ? 'border-destructive' : ''}`}
                          />
                        </div>
                      </div>

                      <Button type="button" variant="ghost" className="mt-1 h-8 w-8 px-0 text-destructive hover:bg-destructive/10" aria-label={`Remove resource ${index + 1}`} onClick={() => handleRemoveResource(res.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isPinned" 
              checked={isPinned} 
              onChange={e => { setIsPinned(e.target.checked); markDirty() }}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isPinned" className="text-sm font-medium cursor-pointer">Pin to top of feeds</label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                if (!isDirty || window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                  router.push('/teacher/announcements')
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Publish Announcement'}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Column */}
      <div className="flex flex-col gap-4 lg:sticky lg:top-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Live Preview (Student View)</h2>
        
        <Card className="flex flex-col gap-4 p-5 sm:p-6 shadow-md border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {isPinned && (
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    <Pin className="w-3 h-3 mr-1" /> Pinned
                  </Badge>
                )}
                {!isEditing && (
                  <Badge variant="secondary" className="text-blue-500 border-blue-500">
                    NEW
                  </Badge>
                )}
                <h3 className="text-lg font-semibold tracking-tight">{title || 'Your Title Here'}</h3>
              </div>
              
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Teacher Name</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="text-sm text-foreground/90 whitespace-pre-wrap">
            {message || 'Write your announcement message, and it will preview here.'}
          </div>

          {resources.length > 0 && resources.some(r => r.label.trim()) && (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border/50">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Resources</div>
              <div className="flex flex-col gap-2">
                {resources.filter(r => r.label.trim()).map(res => (
                  <a 
                    key={res.id} 
                    href={isValidUrl(res.url) ? res.url : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline w-fit"
                    onClick={e => { if(!isValidUrl(res.url)) e.preventDefault() }}
                  >
                    <LinkIcon className="w-4 h-4 shrink-0" />
                    <span className="font-medium">📄 {res.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
