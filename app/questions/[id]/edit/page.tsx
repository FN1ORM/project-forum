import { notFound, redirect } from 'next/navigation'
import { getQuestionById, updateQuestion } from '@/utils/data/questions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let question = null
  try {
    question = await getQuestionById(id)
  } catch (e) {
    console.error(e)
  }
  
  if (!question) notFound()
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/questions/${id}`)
  }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isAuthor = user.id === question.author_id
  const isTeacherOrAdmin = profile && (profile.role === 'teacher' || profile.role === 'admin')
  const canEditQuestion = (isAuthor && !question.is_solved) || isTeacherOrAdmin
  
  if (!canEditQuestion) {
    redirect(`/questions/${id}`)
  }
  
  async function handleSave(formData: FormData) {
    'use server'
    const title = formData.get('title') as string
    const body = formData.get('body') as string
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    const isAuthor = user.id === question.author_id
    const isTeacherOrAdmin = profile && (profile.role === 'teacher' || profile.role === 'admin')
    const canEditQuestion = (isAuthor && !question.is_solved) || isTeacherOrAdmin
    
    if (!canEditQuestion) return
    
    try {
      await updateQuestion(id, title, body)
    } catch (e) {
      console.error(e)
      return
    }
    redirect(`/questions/${id}`)
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <Link href={`/questions/${id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Cancel
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-black dark:text-white">Edit Question</h1>
        
        <form action={handleSave} className="flex flex-col gap-6 p-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-medium text-black dark:text-white">
              Title
            </label>
            <input 
              type="text" 
              id="title"
              name="title" 
              defaultValue={question.title}
              required 
              className="p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="body" className="text-sm font-medium text-black dark:text-white">
              Body
            </label>
            <textarea 
              id="body"
              name="body" 
              defaultValue={question.body}
              rows={8}
              required 
              className="p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-y"
            />
          </div>
          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href={`/questions/${id}`} className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors">
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
