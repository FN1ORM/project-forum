import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAttachmentById } from '@/utils/data/attachments'
import Link from 'next/link'

export default async function ViewImageAttachmentPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ question?: string }>
}) {
  const { id } = await params
  const { question: questionId } = await searchParams
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }
  
  let attachment = null
  try {
    attachment = await getAttachmentById(id)
  } catch (error) {
    console.error(error)
  }
  
  if (!attachment || !attachment.mime_type.startsWith('image/')) {
    notFound()
  }

  // Generate a single short-lived signed URL for both the viewer and download button
  const { data } = await supabase.storage.from('attachments').createSignedUrl(attachment.storage_path, 15 * 60)
  
  if (!data?.signedUrl) {
    notFound()
  }

  const backUrl = questionId ? `/questions/${questionId}` : '/'

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 h-[90vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link prefetch={false} href={backUrl} className="text-sm font-medium text-zinc-500 hover:text-black dark:hover:text-white transition-colors">
              &larr; Back
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white truncate max-w-sm sm:max-w-md">
              {attachment.file_name}
            </h1>
          </div>
          <a 
            href={data.signedUrl} 
            download={attachment.file_name} 
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
          >
            Download Original
          </a>
        </div>
        
        <div className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center p-4">
          <img 
            src={data.signedUrl} 
            alt={attachment.file_name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </main>
    </div>
  )
}
