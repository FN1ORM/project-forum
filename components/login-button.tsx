'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'

export function LoginButton() {
  const [pending, setPending] = useState(false)

  const handleLogin = async () => {
    setPending(true)
    try {
      const supabase = createClient()
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
    } catch (e) {
      setPending(false)
      console.error(e)
    }
  }

  return (
    <Button
      variant="secondary"
      onClick={handleLogin}
      className="w-full h-11 text-base font-semibold"
      disabled={pending}
    >
      {pending ? "Redirecting..." : "Sign in with Google"}
    </Button>
  )
}
