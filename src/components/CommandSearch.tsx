import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function CommandSearch({
    onOpen,
    placeholder = "Search",
}: {
    onOpen?: () => void
    placeholder?: string
}) {
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                onOpen?.()
            }
        }

        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [onOpen])

    return (
        <button
            onClick={onOpen}
            className={cn(
                "flex items-center gap-2",
                "h-10 w-[280px] rounded-md border",
                "bg-background px-3 text-sm text-muted-foreground",
                "hover:bg-accent hover:text-accent-foreground",
                "transition-colors"
            )}
        >
            <Search className="h-4 w-4" />

            <span className="flex-1 text-left">{placeholder}</span>

            <kbd
                className={cn(
                    "pointer-events-none",
                    "inline-flex h-6 items-center gap-1",
                    "rounded border bg-muted px-2",
                    "font-mono text-xs text-muted-foreground"
                )}
            >
                Ctrl K
            </kbd>
        </button>
    )
}
