import { getUserAndProfile } from '@/utils/data/user'
import { Sidebar } from './sidebar'
import { TopNav } from './top-nav'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile: rawProfile } = await getUserAndProfile()
  
  let profile = null
  if (user && rawProfile) {
    profile = {
      email: user.email || '',
      displayName: rawProfile.display_name,
      role: rawProfile.role
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <TopNav profile={profile} />
      <div className="flex flex-1 w-full md:gap-8 lg:gap-12">
        <Sidebar profile={profile} />
        <main className="flex-1 min-w-0 flex flex-col items-center">
          <div className="w-full max-w-5xl flex-1">
            {children}
          </div>
          <footer className="w-full py-6 text-center text-sm text-muted-foreground mt-auto border-t border-border">
            To report any issue, Contact: fn1orm@gmail.com
          </footer>
        </main>
      </div>
    </div>
  )
}
