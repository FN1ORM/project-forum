import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TeacherNav } from './teacher-nav'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (!profile || profile.role !== 'teacher') {
    redirect('/')
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-6">Teacher Dashboard</h1>
          <TeacherNav />
        </div>
        
        {children}
      </main>
    </div>
  )
}
