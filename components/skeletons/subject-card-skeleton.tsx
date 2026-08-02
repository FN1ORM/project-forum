import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function SubjectCardSkeleton() {
  return (
    <Card className="p-5 sm:p-6 border-border bg-surface h-full flex items-center">
      <Skeleton className="h-6 w-1/2" />
    </Card>
  )
}
