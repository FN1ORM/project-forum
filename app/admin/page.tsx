import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAllUsers, updateUserRole, countAdmins, getUserRole } from '@/utils/data/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

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
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans p-8 sm:p-16">
      <main className="flex-1 w-full max-w-5xl mx-auto flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-black dark:text-white">Admin Dashboard</h1>
        
        {/* Search */}
        <div className="flex gap-4 mb-4">
          <form action={handleSearch} className="flex flex-1 gap-4">
            <input 
              type="text" 
              name="q" 
              defaultValue={searchQuery} 
              placeholder="Search by name or email..." 
              className="flex-1 p-3 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
            <button type="submit" className="px-6 py-2 bg-black text-white dark:bg-white dark:text-black rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              Search
            </button>
          </form>
          {searchQuery && (
            <form action={handleClearSearch}>
              <button type="submit" className="h-full px-6 py-2 bg-zinc-200 text-black dark:bg-zinc-800 dark:text-white rounded-md font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors">
                Clear
              </button>
            </form>
          )}
        </div>
        
        {/* Users Table */}
        <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-4 font-semibold text-sm text-black dark:text-white">Name</th>
                <th className="p-4 font-semibold text-sm text-black dark:text-white">Email</th>
                <th className="p-4 font-semibold text-sm text-black dark:text-white">Current Role</th>
                <th className="p-4 font-semibold text-sm text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950/50 transition-colors">
                  <td className="p-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.display_name}</td>
                  <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400">{u.email}</td>
                  <td className="p-4 text-sm text-zinc-600 dark:text-zinc-400 capitalize">{u.role}</td>
                  <td className="p-4">
                    {u.id !== user.id ? (
                      <form action={handleRoleChange} className="flex items-center gap-2">
                        <input type="hidden" name="userId" value={u.id} />
                        <select 
                          name="role" 
                          defaultValue={u.role}
                          className="p-1.5 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="px-3 py-1.5 text-xs font-medium bg-black text-white dark:bg-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
                          Update
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs font-medium text-zinc-400 italic">Cannot change own role</span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
