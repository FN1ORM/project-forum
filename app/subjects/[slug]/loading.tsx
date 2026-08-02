import { Skeleton } from "@/components/ui/skeleton"
import { SortTabsSkeleton } from "@/components/skeletons/sort-tabs-skeleton"
import { QuestionCardSkeleton } from "@/components/skeletons/question-card-skeleton"

export default function SubjectLoading() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-8">
        <div className="mb-8 flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
        
        <Skeleton className="h-10 w-64 mb-6" />
        
        <SortTabsSkeleton />
        
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <QuestionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
