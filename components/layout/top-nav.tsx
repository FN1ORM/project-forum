'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

export function TopNav({ profile }: { profile: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [userMenuOpen, setUserMenuOpen] = React.useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-8 w-full justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="md:hidden p-2 h-auto" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <Menu className="w-5 h-5" />
          </Button>
          <Link href="/" className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
            Project Forum
          </Link>
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
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-danger hover:bg-surface-elevated transition-colors text-left font-medium">
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Sign in
          </Link>
        )}
      </div>

      {mobileMenuOpen && profile && (
        <div className="md:hidden border-b border-border bg-surface p-4">
          <nav className="flex flex-col gap-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground">
              Home
            </Link>
            {profile.role === 'teacher' && (
              <Link href="/teacher" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground">
                Teacher Dashboard
              </Link>
            )}
            {profile.role === 'admin' && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground">
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
