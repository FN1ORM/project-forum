import { Skeleton } from "@/components/ui/skeleton"

export function SortTabsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Skeleton className="h-9 w-20 rounded-full" />
      <Skeleton className="h-9 w-28 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
      <Skeleton className="h-9 w-20 rounded-full" />
      <Skeleton className="h-9 w-28 rounded-full" />
    </div>
  )
}
