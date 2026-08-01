import { createClient } from '@/utils/supabase/server'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('role, display_name').eq('id', user.id).single()
    if (data) {
      profile = {
        email: user.email || '',
        displayName: data.display_name,
        role: data.role
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopNav profile={profile} />
      <div className="flex flex-1 w-full md:gap-8 lg:gap-12">
        <Sidebar profile={profile} />
        <main className="flex-1 min-w-0 flex justify-center">
          <div className="w-full max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
