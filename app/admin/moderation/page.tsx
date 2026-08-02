import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getReports } from '@/utils/data/moderation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  updateReportStatusAction,
  toggleContentHiddenAction,
  toggleUserSuspensionAction
} from '@/app/actions/moderation'

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  const { status } = await searchParams
  const currentStatus = (status === 'closed' ? 'resolved' : status === 'dismissed' ? 'dismissed' : 'open') as 'open' | 'resolved' | 'dismissed'

  let reports: any[] = []
  try {
    reports = await getReports(currentStatus)
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-7xl mx-auto flex flex-col py-12 px-6 lg:px-8 gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Moderation Queue</h1>
          <Link prefetch={false} href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            &larr; Admin Dashboard
          </Link>
        </div>

        <div className="flex gap-4 border-b border-border pb-4">
          <Link prefetch={false} 
            href="?status=open"
            className={`text-sm font-medium ${currentStatus === 'open' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Open Reports
          </Link>
          <Link prefetch={false} 
            href="?status=closed"
            className={`text-sm font-medium ${currentStatus === 'resolved' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Resolved
          </Link>
          <Link prefetch={false} 
            href="?status=dismissed"
            className={`text-sm font-medium ${currentStatus === 'dismissed' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Dismissed
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          {reports.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              No {currentStatus} reports found.
            </Card>
          ) : (
            reports.map(report => {
              const isQuestion = !!report.question_id
              const target = isQuestion ? report.question : report.answer
              const targetType = isQuestion ? 'question' : 'answer'
              const targetId = isQuestion ? report.question_id : report.answer_id
              
              const isHidden = target?.is_hidden
              const targetAuthor = target?.author
              const isSuspended = targetAuthor?.is_suspended

              return (
                <Card key={report.id} className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">{report.reason}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleString()}
                        </span>
                        <Badge variant="secondary">
                          {targetType.toUpperCase()}
                        </Badge>
                      </div>

                      {report.description && (
                        <div className="text-sm bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md border border-border">
                          <span className="font-semibold block mb-1">Reporter Notes:</span>
                          {report.description}
                        </div>
                      )}
                      
                      <div className="text-sm border-l-4 border-zinc-200 dark:border-zinc-800 pl-4 py-1">
                        {isQuestion ? (
                          <>
                            <span className="font-semibold block mb-1">Target Question:</span>
                            <span className="block font-medium">{target?.title}</span>
                          </>
                        ) : (
                          <span className="font-semibold block mb-1">Target Answer:</span>
                        )}
                        <span className="text-muted-foreground line-clamp-3 mt-1">{target?.body}</span>
                      </div>
                      
                      <div className="text-sm flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-muted-foreground">Reporter:</span>
                          <span>
                            <Link prefetch={false} href={`/users/${report.reporter_id}`} className="hover:underline">{report.reporter?.display_name}</Link> ({report.reporter?.email})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Target Author:</span>
                          <span>
                            <Link prefetch={false} href={`/users/${target?.author_id}`} className="hover:underline">{targetAuthor?.display_name}</Link> ({targetAuthor?.email})
                          </span>
                          {isSuspended && <Badge variant="destructive" className="ml-2">Suspended</Badge>}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[200px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                      <h3 className="text-sm font-semibold mb-2">Actions</h3>
                      
                      <form action={toggleContentHiddenAction}>
                        <input type="hidden" name="type" value={targetType} />
                        <input type="hidden" name="id" value={targetId} />
                        <input type="hidden" name="isHidden" value={(!isHidden).toString()} />
                        <Button type="submit" variant={isHidden ? "success" : "secondary"} className="w-full justify-start text-xs h-8">
                          {isHidden ? `Restore ${targetType}` : `Hide ${targetType}`}
                        </Button>
                      </form>
                      
                      <form action={toggleUserSuspensionAction}>
                        <input type="hidden" name="userId" value={target?.author_id} />
                        <input type="hidden" name="isSuspended" value={(!isSuspended).toString()} />
                        <Button type="submit" variant={isSuspended ? "success" : "danger"} className="w-full justify-start text-xs h-8">
                          {isSuspended ? 'Unsuspend Author' : 'Suspend Author'}
                        </Button>
                      </form>

                      {currentStatus === 'open' && (
                        <>
                          <form action={updateReportStatusAction} className="mt-4">
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="status" value="resolved" />
                            <Button type="submit" variant="primary" className="w-full justify-start text-xs h-8">
                              Mark as Resolved
                            </Button>
                          </form>
                          
                          <form action={updateReportStatusAction}>
                            <input type="hidden" name="reportId" value={report.id} />
                            <input type="hidden" name="status" value="dismissed" />
                            <Button type="submit" variant="ghost" className="w-full justify-start text-xs h-8">
                              Dismiss Report
                            </Button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
