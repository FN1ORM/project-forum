'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TeacherNav() {
  const pathname = usePathname()
  
  const tabs = [
    { name: 'Q&A', href: '/teacher' },
    { name: 'Announcements', href: '/teacher/announcements' },
  ]
  
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        // Exact match for Q&A, prefix match for announcements
        const isActive = tab.href === '/teacher' 
          ? pathname === '/teacher' 
          : pathname.startsWith(tab.href)
          
        return (
          <Link prefetch={false}             key={tab.name}
            href={tab.href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-foreground text-background shadow-sm hover:bg-foreground/90' 
                : 'bg-surface-elevated text-muted-foreground border border-border hover:bg-surface-elevated/80 hover:text-foreground'
            }`}
          >
            {tab.name}
          </Link>
        )
      })}
    </div>
  )
}
