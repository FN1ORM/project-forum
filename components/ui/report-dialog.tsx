'use client'

import { useState } from 'react'
import { submitReportAction } from '@/app/actions/moderation'
import { Button } from './button'

interface ReportDialogProps {
  targetType: 'question' | 'answer'
  targetId: string
  trigger?: React.ReactNode
}

const REASONS = [
  'Spam',
  'Harassment',
  'Offensive Content',
  'Wrong Subject',
  'Other'
]

export function ReportDialog({ targetType, targetId, trigger }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0])
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.append('targetType', targetType)
    formData.append('targetId', targetId)
    formData.append('reason', reason)
    if (description) {
      formData.append('description', description)
    }

    const result = await submitReportAction(formData)
    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        // Reset state after closing
        setTimeout(() => setSuccess(false), 300)
      }, 1500)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <button className="text-sm text-red-500 hover:text-red-700 transition-colors">
            Report
          </button>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Report {targetType === 'question' ? 'Question' : 'Answer'}</h2>
              
              {success ? (
                <div className="py-8 text-center text-green-600 font-medium">
                  Report submitted successfully. Thank you.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Reason</label>
                    <select 
                      value={reason} 
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      required
                    >
                      {REASONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  
                  {reason === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Description (Required)</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                        placeholder="Please explain the reason..."
                      />
                    </div>
                  )}

                  {error && (
                    <div className="text-sm text-red-500">{error}</div>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="danger" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
