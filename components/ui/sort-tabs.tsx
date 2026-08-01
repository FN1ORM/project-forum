'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'

export function SortTabs() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  const currentSort = searchParams.get('sort') || 'latest'
  
  const tabs = [
    { id: 'latest', label: 'Latest' },
    { id: 'upvotes', label: 'Most Upvoted' },
    { id: 'unanswered', label: 'Unanswered' },
    { id: 'solved', label: 'Solved' },
    { id: 'my', label: 'My Questions' },
  ]
  
  const createSortUrl = (sortId: string) => {
    const params = new URLSearchParams(searchParams)
    if (sortId === 'latest') {
      params.delete('sort')
    } else {
      params.set('sort', sortId)
    }
    const query = params.toString()
    return `${pathname}${query ? `?${query}` : ''}`
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tabs.map((tab) => {
        const isActive = currentSort === tab.id
        return (
          <Link
            key={tab.id}
            href={createSortUrl(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-foreground text-background shadow-sm hover:bg-foreground/90' 
                : 'bg-surface-elevated text-muted-foreground border border-border hover:bg-surface-elevated/80 hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
