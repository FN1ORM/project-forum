'use client'

import * as React from 'react'
import Link from 'next/link'
import { Home, LayoutDashboard, Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Sidebar({ profile }: { profile: any }) {
  const [collapsed, setCollapsed] = React.useState(false)

  if (!profile) return null

  return (
    <aside className={`hidden md:flex flex-col border-r border-border transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} sticky top-16 h-[calc(100vh-4rem)] p-4`}>
      <div className={`flex items-center mb-6 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">Menu</span>}
        <Button variant="ghost" className="p-2 h-auto rounded-full text-muted-foreground hover:text-foreground" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle Sidebar">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
      
      <nav className="flex flex-col gap-2">
        <Link 
          href="/" 
          title="Home"
          className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground"
        >
          <Home className="w-5 h-5 shrink-0 text-muted-foreground" />
          {!collapsed && <span>Home</span>}
        </Link>
        
        {profile.role === 'teacher' && (
          <Link 
            href="/teacher" 
            title="Teacher Dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0 text-muted-foreground" />
            {!collapsed && <span>Teacher Dashboard</span>}
          </Link>
        )}
        
        {profile.role === 'admin' && (
          <Link 
            href="/admin" 
            title="Admin Dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-surface-elevated text-sm font-medium transition-colors text-foreground"
          >
            <Shield className="w-5 h-5 shrink-0 text-muted-foreground" />
            {!collapsed && <span>Admin Dashboard</span>}
          </Link>
        )}
      </nav>
    </aside>
  )
}
