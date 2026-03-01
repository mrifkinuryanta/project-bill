import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function GenericDashboardLoading() {
    return (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6 mt-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[150px]" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-4 w-[80%]" />
                    <div className="pt-6 space-y-3">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
