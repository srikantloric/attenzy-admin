import { useMatches } from "react-router-dom"
import type { Params } from "react-router-dom"

type BreadcrumbHandle =
    | string
    | ((args: { params: Params<string> }) => string)

type MatchHandle = {
    breadcrumb?: BreadcrumbHandle
}

export type BreadcrumbItem = {
    label: string
    href: string
}

export function useBreadcrumbs(): BreadcrumbItem[] {
    const matches = useMatches()

    return matches
        .filter(
            (m): m is typeof m & { handle: MatchHandle } =>
                Boolean(m.handle && (m.handle as MatchHandle).breadcrumb)
        )
        .map((m) => {
            const handle = m.handle as MatchHandle
            const breadcrumb = handle.breadcrumb!

            return {
                label:
                    typeof breadcrumb === "function"
                        ? breadcrumb({ params: m.params })
                        : breadcrumb,
                href: m.pathname,
            }
        })
}
