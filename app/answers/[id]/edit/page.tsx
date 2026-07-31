import { notFound, redirect } from 'next/navigation'
import { getAnswerById, updateAnswer } from '@/utils/data/answers'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function EditAnswerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let answer = null
  try {
    answer = await getAnswerById(id)
  } catch (e) {
    console.error(e)
  }
  
  if (!answer) notFound()
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== answer.author_id) {
    redirect(`/questions/${answer.question_id}`)
  }
  
  async function handleSave(formData: FormData) {
    'use server'
    const body = formData.get('body') as string
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== answer.author_id) return
    
    try {
      await updateAnswer(id, body)
    } catch (e) {
      console.error(e)
      return
    }
    redirect(`/questions/${answer.question_id}`)
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link href={`/questions/${answer.question_id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Cancel
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-black dark:text-white">Edit Answer</h1>
        
        <form action={handleSave} className="flex flex-col gap-6 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-col gap-2">
            <label htmlFor="body" className="text-sm font-medium text-black dark:text-white">
              Body
            </label>
            <textarea 
              id="body"
              name="body" 
              defaultValue={answer.body}
              rows={8}
              required 
              className="p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-y"
            />
          </div>
          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href={`/questions/${answer.question_id}`} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
              Cancel
            </Link>
            <button 
              type="submit"
              className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
