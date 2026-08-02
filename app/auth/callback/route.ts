import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { isEmailAllowed, ADMIN_EMAIL, TEACHER_EMAIL } from '@/utils/constants'
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email) {
        if (!isEmailAllowed(user.email)) {
          await supabase.auth.signOut()
          return NextResponse.redirect(`${origin}/login?error=Unauthorized+email+address.`)
        } else {
          const displayName = user.user_metadata?.full_name 
            || user.user_metadata?.name 
            || user.email?.split('@')[0] 
            || '';

          let role = 'student'
          if (user.email === ADMIN_EMAIL) {
            role = 'admin'
          } else if (user.email === TEACHER_EMAIL) {
            role = 'teacher'
          }

          // Idempotently create the profile if it doesn't exist
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: user.id,
            email: user.email,
            display_name: displayName,
            role: role
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
