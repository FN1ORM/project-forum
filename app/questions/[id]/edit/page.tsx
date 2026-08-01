import { notFound, redirect } from 'next/navigation'
import { getQuestionById, updateQuestion } from '@/utils/data/questions'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SubmitButton } from '@/components/submit-button'

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let question = null
  try {
    question = await getQuestionById(id)
  } catch (e) {
    console.error(e)
  }
  
  if (!question) notFound()
  
  if (question.isHiddenByModerator) {
    return (
      <div className="flex flex-col flex-1 bg-background text-foreground items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md p-8 text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Content Removed</h1>
          <p className="text-muted-foreground">
            This content has been removed by a moderator for violating our community guidelines.
          </p>
          <Link href="/" className="inline-block mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }
  
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
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        <div className="flex items-center gap-4">
          <Link href={`/questions/${id}`} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            &larr; Cancel
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Question</h1>
        
        <Card className="p-8">
          <form action={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input 
                type="text" 
                id="title"
                name="title" 
                defaultValue={question.title}
                required 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="body" className="text-sm font-medium">
                Body
              </label>
              <Textarea 
                id="body"
                name="body" 
                defaultValue={question.body}
                rows={8}
                required 
              />
            </div>
            <div className="pt-4 flex items-center justify-end gap-4">
              <Link href={`/questions/${id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </Link>
              <SubmitButton pendingText="Saving...">
                Save Changes
              </SubmitButton>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
