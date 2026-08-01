import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { getSubjects } from '@/utils/data/subjects'

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
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16 sm:items-start text-center sm:text-left gap-12">
        {user ? (
          <div className="flex flex-col gap-4 w-full">
            <h1 className="text-3xl font-semibold text-black dark:text-white">
              Welcome, {profile?.display_name || ''}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
            <div className="mt-8 w-full text-left">
              <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
                Subjects
              </h2>
              {subjects.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {subjects.map((subject) => (
                    <li key={subject.id}>
                      <Link 
                        href={`/subjects/${subject.slug}`}
                        className="block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                      >
                        <h3 className="font-medium text-black dark:text-white">{subject.name}</h3>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500">No subjects available.</p>
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
