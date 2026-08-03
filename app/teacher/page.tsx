import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getUnsolvedQuestions, getUnansweredQuestions, getRecentQuestions } from '@/utils/data/teacher'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (!profile || profile.role !== 'teacher') {
    redirect('/')
  }

  let unsolved: any[] = []
  let unanswered: any[] = []
  let recent: any[] = []
  
  try {
    const [u1, u2, u3] = await Promise.all([
      getUnsolvedQuestions(),
      getUnansweredQuestions(),
      getRecentQuestions(20)
    ])
    unsolved = u1
    unanswered = u2
    recent = u3
  } catch (e) {
    console.error(e)
  }

  function renderQuestionCard(question: any) {
    return (
      <Card key={question.id} className="relative p-5 sm:p-6 hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors">
        <Link prefetch={false} href={`/questions/${question.id}`} className="absolute inset-0 z-0" aria-label={question.title} />
        <div className="relative z-10 pointer-events-none flex flex-col h-full">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-lg font-semibold tracking-tight">{question.title}</h3>
            {question.is_solved && (
              <Badge variant="success" className="shrink-0 pointer-events-auto">
                ✓ Solved
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mb-4 flex flex-col sm:flex-row sm:items-center sm:gap-2 pointer-events-auto">
            <span>Asked by <Link prefetch={false} href={`/users/${question.author_id}`} className="hover:underline text-foreground">{question.author?.display_name}</Link></span>
            <span className="hidden sm:inline">•</span>
            <span>Subject: {question.subjects?.name}</span>
            <span className="hidden sm:inline">•</span>
            <span>{new Date(question.created_at).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-foreground">
            <span>▲ {question.voteCount}</span>
            <span>💬 {question.answerCount} Answers</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight">Unsolved Questions</h2>
        <div className="flex flex-col gap-4">
          {unsolved.length > 0 ? unsolved.map(renderQuestionCard) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No unsolved questions.</p>
            </Card>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight">Unanswered Questions</h2>
        <div className="flex flex-col gap-4">
          {unanswered.length > 0 ? unanswered.map(renderQuestionCard) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No unanswered questions.</p>
            </Card>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold tracking-tight">Recently Created Questions</h2>
        <div className="flex flex-col gap-4">
          {recent.length > 0 ? recent.map(renderQuestionCard) : (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No recent questions.</p>
            </Card>
          )}
        </div>
      </section>
    </>
  )
}
