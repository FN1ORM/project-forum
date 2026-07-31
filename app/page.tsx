import { createClient } from '@/utils/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 sm:items-start text-center sm:text-left">
        {user ? (
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-semibold text-black dark:text-white">
              Welcome,
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {user.email}
            </p>
            <div className="mt-4">
              <LogoutButton />
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
