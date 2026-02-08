import { useSidebar } from "@/components/ui/sidebar"

export function DrawerHeader() {
    const { state, isMobile } = useSidebar()

    // Mobile → always minified
    if (isMobile) {
        return (
            <img
                src="/attenzy-logo-minified.png"
                className="h-10 mx-auto"
                alt="Attenzy"
            />
        )
    }

    // Desktop
    return (
        <div className="h-10 flex items-center justify-center">
            {state === "collapsed" ? (
                <img
                    src="/attenzy-logo-minified.png"
                    className="h-8"
                    alt="Attenzy"
                />
            ) : (
                <img
                    src="/attenzy-logo.png"
                    className="h-12"
                    alt="Attenzy"
                />
            )}
        </div>
    )
}
