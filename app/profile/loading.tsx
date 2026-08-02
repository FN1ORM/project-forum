import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function ProfileRedirectLoading() {
  return (
    <div className="flex flex-col flex-1 bg-background text-foreground items-center justify-center min-h-[60vh]">
       <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  )
}
