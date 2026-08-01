import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getSubjects } from '@/utils/data/subjects'
import { Card } from '@/components/ui/card'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let subjects: any[] = []
  let profile = null
  if (user) {
    try {
      const { data } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
      profile = data
      subjects = await getSubjects()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-12">
        {user ? (
          <div className="flex flex-col gap-4 w-full">
            <h1 className="text-3xl font-semibold text-black dark:text-white">
              Welcome, {profile?.display_name || ''}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
            <div className="mt-8 w-full text-left">
              <h2 className="text-2xl font-bold tracking-tight mb-6">
                Subjects
              </h2>
              {subjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjects.map((subject) => (
                    <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                      <Card className="p-5 sm:p-6 hover:border-primary/50 hover:bg-surface-elevated/50 transition-colors h-full flex items-center">
                        <h3 className="text-lg font-semibold tracking-tight">{subject.name}</h3>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center text-muted-foreground">
                  <p>No subjects available at the moment.</p>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-black dark:text-white">
              Welcome to Project Forum
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              You are not signed in.
            </p>
            <div className="mt-4">
              <Link
                href="/login"
                className="px-6 py-3 rounded-full bg-foreground text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium"
              >
                Go to Login
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
