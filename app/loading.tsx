import { Skeleton } from "@/components/ui/skeleton"
import { SubjectCardSkeleton } from "@/components/skeletons/subject-card-skeleton"
import { SortTabsSkeleton } from "@/components/skeletons/sort-tabs-skeleton"
import { QuestionCardSkeleton } from "@/components/skeletons/question-card-skeleton"

export default function HomeLoading() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <main className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16 gap-12">
        <div className="flex flex-col gap-4 w-full">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-7 w-48" />

          <div className="mt-8 w-full text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Subjects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SubjectCardSkeleton key={i} />
              ))}
            </div>
          </div>

          <div className="mt-12 w-full text-left">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
              Global Feed
            </h2>
            
            <SortTabsSkeleton />

            <div className="flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <QuestionCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
