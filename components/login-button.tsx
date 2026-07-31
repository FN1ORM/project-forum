'use client'

import { createClient } from '@/utils/supabase/client'

export function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
    >
      Sign in with Google
    </button>
  )
}
