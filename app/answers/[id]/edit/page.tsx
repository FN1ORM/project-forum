import { notFound, redirect } from 'next/navigation'
import { getAnswerById, updateAnswer } from '@/utils/data/answers'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { SubmitButton } from '@/components/submit-button'

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
        
        <h1 className="text-3xl font-bold tracking-tight mb-8">Edit Answer</h1>
        
        <Card className="p-8">
          <form action={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="body" className="text-sm font-medium">
                Body
              </label>
              <Textarea 
                id="body"
                name="body" 
                defaultValue={answer.body}
                rows={8}
                required 
              />
            </div>
            <div className="pt-4 flex items-center justify-end gap-4">
              <Link href={`/questions/${answer.question_id}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
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
