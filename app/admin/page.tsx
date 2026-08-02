import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getAllUsers, updateUserRole, countAdmins, getUserRole } from '@/utils/data/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { Input } from '@/components/ui/input'
import { SubmitButton } from '@/components/submit-button'
import { Card } from '@/components/ui/card'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
    
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') redirect('/')

  const cookieStore = await cookies()
  const searchQuery = cookieStore.get('admin_search')?.value || ''

  let users: any[] = []
  try {
    users = await getAllUsers(searchQuery)
  } catch (e) {
    console.error(e)
  }

  async function handleSearch(formData: FormData) {
    'use server'
    const q = formData.get('q') as string
    const cookieStore = await cookies()
    if (q && q.trim() !== '') {
      cookieStore.set('admin_search', q.trim())
    } else {
      cookieStore.delete('admin_search')
    }
    revalidatePath('/admin')
  }

  async function handleClearSearch() {
    'use server'
    const cookieStore = await cookies()
    cookieStore.delete('admin_search')
    revalidatePath('/admin')
  }

  async function handleRoleChange(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    const role = formData.get('role') as string
    
    // Auth validation
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (!profile || profile.role !== 'admin') return

    // Business rules moved from DAL to Server Action
    if (userId === user.id) {
      console.error('Cannot change your own role.')
      return
    }
    
    if (role !== 'admin') {
      const targetRole = await getUserRole(userId)
      if (targetRole === 'admin') {
        const adminCount = await countAdmins()
        if (adminCount <= 1) {
          console.error('Cannot remove the final remaining admin.')
          return
        }
      }
    }

    try {
      await updateUserRole(userId, role)
      revalidatePath('/admin')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <Link prefetch={false} href="/admin/moderation" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            Moderation Queue &rarr;
          </Link>
        </div>
        
        {/* Search */}
        <div className="flex gap-4 mb-4">
          <form action={handleSearch} className="flex flex-1 gap-4">
            <Input 
              type="text" 
              name="q" 
              defaultValue={searchQuery} 
              placeholder="Search by name or email..." 
              className="flex-1"
            />
            <SubmitButton pendingText="Searching...">
              Search
            </SubmitButton>
          </form>
          {searchQuery && (
            <form action={handleClearSearch}>
              <SubmitButton variant="secondary" pendingText="Clearing...">
                Clear
              </SubmitButton>
            </form>
          )}
        </div>
        
        {/* Users Table */}
        <Card className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/30">
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Role</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-elevated/30 transition-colors">
                  <td className="p-4 text-sm font-medium text-foreground">
                    <Link prefetch={false} href={`/users/${u.id}`} className="hover:underline">{u.display_name}</Link>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                  <td className="p-4 text-sm text-muted-foreground capitalize">{u.role}</td>
                  <td className="p-4">
                    {u.id !== user.id ? (
                      <form action={handleRoleChange} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select 
                          name="role" 
                          defaultValue={u.role}
                          className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                        <SubmitButton pendingText="Updating...">
                          Update
                        </SubmitButton>
                      </form>
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground italic">Cannot change own role</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  )
}
