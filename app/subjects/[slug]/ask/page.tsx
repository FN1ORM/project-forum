import { notFound, redirect } from 'next/navigation'
import { getSubjectBySlug } from '@/utils/data/subjects'
import { createQuestion } from '@/utils/data/questions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

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
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <div className="max-w-2xl w-full mx-auto">
        <div className="mb-8">
          <Link href={`/subjects/${validSubject.slug}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Back to {validSubject.name}
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-black dark:text-white mb-8">
          Ask a Question
        </h1>
        
        <form action={submitQuestion} encType="multipart/form-data" className="flex flex-col gap-6 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="font-medium text-black dark:text-white">
              Title
            </label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              required 
              className="p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              placeholder="What is your question?"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="body" className="font-medium text-black dark:text-white">
              Body
            </label>
            <textarea 
              id="body" 
              name="body" 
              rows={6}
              required 
              className="p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-y"
              placeholder="Explain your question in detail..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="attachment" className="font-medium text-black dark:text-white">
              Attachment (Optional)
            </label>
            <input 
              type="file" 
              id="attachment" 
              name="attachment" 
              accept="image/png, image/jpeg, image/webp, application/pdf"
              className="p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-sm"
            />
            <p className="text-xs text-zinc-500">Max size 10MB. Allowed: PNG, JPG, WEBP, PDF.</p>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full py-3 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
            >
              Submit Question
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
