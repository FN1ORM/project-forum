import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function QuestionCardSkeleton() {
  return (
    <Card className="relative p-5 sm:p-6 border-border bg-surface">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between gap-4 mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
        </div>
        <div className="space-y-2 mt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="hidden sm:block h-3 w-3" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
    </Card>
  )
}
