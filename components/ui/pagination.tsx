'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Pagination({ currentPage, totalPages }: { currentPage: number, totalPages: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {currentPage > 1 ? (
        <Link prefetch={false} href={createPageUrl(currentPage - 1)}>
          <Button variant="secondary">Previous</Button>
        </Link>
      ) : (
        <Button variant="secondary" disabled>Previous</Button>
      )}
      
      <span className="text-sm text-muted-foreground font-medium">
        Page {currentPage} of {totalPages}
      </span>
      
      {currentPage < totalPages ? (
        <Link prefetch={false} href={createPageUrl(currentPage + 1)}>
          <Button variant="secondary">Next</Button>
        </Link>
      ) : (
        <Button variant="secondary" disabled>Next</Button>
      )}
    </div>
  )
}
