import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { QuestionCardSkeleton } from "@/components/skeletons/question-card-skeleton"

export default function UserProfileLoading() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        
        {/* Profile Header */}
        <Card className="p-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-6 w-48 mt-2" />
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <div className="flex gap-8">
            <Skeleton className="h-6 w-24 mb-4" />
            <Skeleton className="h-6 w-24 mb-4" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <QuestionCardSkeleton key={i} />
          ))}
        </div>

      </main>
    </div>
  )
}
