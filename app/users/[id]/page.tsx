import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getProfileById } from '@/utils/data/profiles'
import { getGlobalFeed } from '@/utils/data/questions'
import { getAnswersByUser } from '@/utils/data/answers'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/pagination'

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const { id } = await params
  const { tab, page } = await searchParams
  
  const currentTab = tab === 'answers' ? 'answers' : 'questions'
  const pageNumber = parseInt(page || '1', 10)
  const pageSize = 10

  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (!currentUser) {
    redirect('/login')
  }

  const { data: currentProfile } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single()

  let profile = null
  try {
    profile = await getProfileById(id)
  } catch (e) {
    console.error(e)
  }
  
  if (!profile) {
    notFound()
  }

  const isSelf = currentUser.id === id
  const isAdminOrTeacher = currentProfile && ['admin', 'teacher'].includes(currentProfile.role)
  const showEmail = isSelf || isAdminOrTeacher
  const showRole = currentProfile?.role === 'admin'

  let questions: any[] = []
  let answers: any[] = []
  let totalCount = 0

  if (currentTab === 'questions') {
    try {
      const feed = await getGlobalFeed('latest', currentUser.id, pageNumber, pageSize, id)
      questions = feed.questions
      totalCount = feed.totalCount
    } catch (e) {
      console.error(e)
    }
  } else {
    try {
      const res = await getAnswersByUser(id, pageNumber, pageSize)
      answers = res.answers
      totalCount = res.totalCount
    } catch (e) {
      console.error(e)
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        
        {/* Profile Header */}
        <Card className="p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{profile.display_name}</h1>
              {showRole && (
                <Badge variant="secondary" className="uppercase">
                  {profile.role}
                </Badge>
              )}
              {profile.is_suspended && (
                <Badge variant="destructive" className="uppercase">
                  Suspended
                </Badge>
              )}
            </div>
            {showEmail && (
              <p className="text-lg text-muted-foreground">{profile.email}</p>
            )}
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border pb-4 mt-4">
          <Link prefetch={false} 
            href={`?tab=questions`}
            className={`text-sm font-medium ${currentTab === 'questions' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Questions
          </Link>
          <Link prefetch={false} 
            href={`?tab=answers`}
            className={`text-sm font-medium ${currentTab === 'answers' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Answers
          </Link>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4">
          {currentTab === 'questions' ? (
            questions.length > 0 ? (
              questions.map((q) => (
                <Link prefetch={false} key={q.id} href={`/questions/${q.id}`}>
                  <Card className="p-5 sm:p-6 hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold tracking-tight">{q.title}</h3>
                      {q.is_solved && (
                        <Badge variant="success" className="shrink-0">
                          ✓ Solved
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-muted-foreground gap-2">
                      <div className="flex items-center gap-2">
                        <span>in {q.subjects?.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>{new Date(q.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <p>No questions posted yet.</p>
              </Card>
            )
          ) : (
            answers.length > 0 ? (
              answers.map((a) => (
                <Link prefetch={false} key={a.id} href={`/questions/${a.question_id}`}>
                  <Card className="p-5 sm:p-6 hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">Answered on:</span>
                        <span className="text-sm font-medium tracking-tight line-clamp-1">{a.question?.title}</span>
                      </div>
                      <p className="text-muted-foreground line-clamp-2 mt-2">{a.body}</p>
                      <div className="mt-4 flex justify-end text-xs text-muted-foreground">
                        <span>{new Date(a.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <Card className="p-8 text-center text-muted-foreground">
                <p>No answers posted yet.</p>
              </Card>
            )
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination currentPage={pageNumber} totalPages={totalPages} />
          </div>
        )}
      </main>
    </div>
  )
}
