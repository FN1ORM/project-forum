import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { ALLOWED_EMAIL_DOMAIN } from '@/utils/constants'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        if (!user.email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=Only+IIIT+Guwahati+accounts+are+allowed.`)
        } else {
          const displayName = user.user_metadata?.full_name 
            || user.user_metadata?.name 
            || user.email?.split('@')[0] 
            || '';

          // Idempotently create the profile if it doesn't exist
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            display_name: displayName,
          }, { onConflict: 'id', ignoreDuplicates: true })

          if (profileError) {
            console.error('Error creating user profile:', profileError)
          }
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}/`)
}
