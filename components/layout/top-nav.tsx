'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, LogOut, Search, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function TopNav({ profile }: { profile: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = formData.get('q')?.toString().trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-8 w-full justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="md:hidden p-2 h-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <Menu className="w-5 h-5" />
          </Button>
          <Link prefetch={false} href="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors hidden sm:block">
            Project Forum
          </Link>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 relative hidden sm:block">
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <Input 
              type="search" 
              name="q"
              placeholder="Search questions..." 
              className="w-full pl-9 bg-surface-elevated/50 border-border rounded-full text-sm h-9 focus-visible:ring-1"
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

        {profile ? (
          <div className="relative">
            <Button variant="ghost" className="flex items-center gap-2 p-1 px-2 rounded-full border border-border bg-surface" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-xs">
                {profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
              </div>
            </Button>
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-md bg-surface border border-border py-1 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium truncate">{profile.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                </div>
                <div className="p-1">
                  <Link prefetch={false} href="/profile" className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-foreground hover:bg-surface-elevated transition-colors text-left font-medium">
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-danger hover:bg-surface-elevated transition-colors text-left font-medium">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link prefetch={false} href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Sign in
          </Link>
        )}
        </div>
      </div>

      {mobileMenuOpen && profile && (
        <div className="md:hidden border-b border-border bg-surface p-4">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
            <span className="text-sm font-medium text-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <nav className="flex flex-col gap-2">
            <Link prefetch={false} href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground">
              Home
            </Link>
            <Link prefetch={false} href="/profile" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground">
              My Profile
            </Link>
            {profile.role === 'teacher' && (
              <Link prefetch={false} href="/teacher" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground">
                Teacher Dashboard
              </Link>
            )}
            {profile.role === 'admin' && (
              <Link prefetch={false} href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground">
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
