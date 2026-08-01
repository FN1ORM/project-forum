import { notFound, redirect } from 'next/navigation'
import { getSubjectBySlug } from '@/utils/data/subjects'
import { createQuestion } from '@/utils/data/questions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ValidatedForm } from '@/components/validated-form'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SubmitButton } from '@/components/submit-button'

export default async function AskQuestionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  
  let subject = null;
  try {
    subject = await getSubjectBySlug(slug)
  } catch (error) {
    console.error(error)
  }

  if (!subject) {
    notFound()
  }

  const validSubject = subject

  // Server Action
  async function submitQuestion(formData: FormData) {
    'use server'
    
    let title = formData.get('title') as string
    let body = formData.get('body') as string

    // Trim the inputs
    title = title?.trim() || ''
    body = body?.trim() || ''

    if (!title || !body) {
      console.error('Title and body must not be empty after trimming.')
      return
    }
    
    const attachment = formData.get('attachment') as File | null
    if (attachment && attachment.size > 0) {
      if (attachment.size > 10 * 1024 * 1024) {
        console.error('File size exceeds 10MB')
        return
      }
      const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
      if (!allowed.includes(attachment.type)) {
        console.error('Invalid file type')
        return
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('User not authenticated')
      return
    }

    try {
      const question = await createQuestion(validSubject.id, user.id, title, body)
      if (attachment && attachment.size > 0) {
        // dynamic import or explicit import at the top
        const { createAttachment } = await import('@/utils/data/attachments')
        await createAttachment(attachment, question.id, null)
      }
    } catch (error) {
      console.error(error)
      return
    }

    redirect(`/subjects/${validSubject.slug}`)
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16">
        <div className="mb-8">
          <Link href={`/subjects/${validSubject.slug}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Back to {validSubject.name}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Ask a Question
        </h1>
        
        <Card className="p-8">
          <ValidatedForm action={submitQuestion} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="font-medium text-sm">
                Title
              </label>
              <Input 
                type="text" 
                id="title" 
                name="title" 
                required 
                placeholder="What is your question?"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="body" className="font-medium text-sm">
                Body
              </label>
              <Textarea 
                id="body" 
                name="body" 
                rows={6}
                required 
                placeholder="Explain your question in detail..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="attachment" className="font-medium text-sm">
                Attachment (Optional)
              </label>
              <Input 
                type="file" 
                id="attachment" 
                name="attachment" 
                accept="image/png, image/jpeg, image/webp, application/pdf"
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-surface-elevated file:text-foreground hover:file:bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Max size 10MB. Allowed: PNG, JPG, WEBP, PDF.</p>
            </div>

            <div className="pt-4">
              <SubmitButton className="w-full" pendingText="Submitting...">
                Submit Question
              </SubmitButton>
            </div>
          </ValidatedForm>
        </Card>
      </div>
    </div>
  )
}
