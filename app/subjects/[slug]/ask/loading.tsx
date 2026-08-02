import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function AskQuestionLoading() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground">
      <div className="w-full max-w-5xl flex flex-col py-12 px-6 lg:px-8 lg:py-16">
        <div className="mb-8">
          <Skeleton className="h-5 w-40" />
        </div>
        
        <Skeleton className="h-9 w-48 mb-8" />
        
        <Card className="p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-48 w-full rounded-md" />
            </div>

            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </Card>
      </div>
    </div>
  )
}
