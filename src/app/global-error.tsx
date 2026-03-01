'use client'

import { Button } from '@/components/ui/button'
import { AlertOctagon } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="en">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-background text-foreground">
                    <div className="rounded-full bg-destructive/10 p-6 mb-6">
                        <AlertOctagon className="h-12 w-12 text-destructive" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-4">Critical System Error</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                        A fatal error occurred at the root layout level. The application cannot continue rendering.
                    </p>
                    <div className="flex gap-4">
                        <Button size="lg" onClick={() => reset()} variant="default">
                            Attempt Recovery
                        </Button>
                        <Button size="lg" onClick={() => window.location.reload()} variant="outline">
                            Hard Reload
                        </Button>
                    </div>
                </div>
            </body>
        </html>
    )
}
