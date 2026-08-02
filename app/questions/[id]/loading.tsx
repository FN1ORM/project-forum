import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function QuestionLoading() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Back Link Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-5 w-40" />
        </div>

        {/* Question Card Skeleton */}
        <Card className="p-6 md:p-8 mb-8 relative border-border bg-surface">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="flex-1 space-y-3 w-full">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-24 shrink-0 rounded-full" />
          </div>

          <div className="my-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-border">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </Card>

        {/* Answers Header Skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
        </div>

        {/* Answers List Skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-6 border-border bg-surface">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 w-full space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-11/12" />
                  </div>
                  <div className="pt-4 mt-4 border-t border-border flex items-center gap-4">
                    <Skeleton className="h-8 w-20 rounded-md" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </main>
    </div>
  )
}
