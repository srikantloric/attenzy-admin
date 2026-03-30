import { useSidebar } from "@/components/ui/sidebar"
import AttenzyLogo from "@/assets/attenzy-logo-transparent.png"

export function DrawerHeader() {
    const { state, isMobile } = useSidebar()

    // Mobile → always minified
    if (isMobile) {
        return (
            <img
                src={AttenzyLogo}
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
                    src={AttenzyLogo}
                    className="h-8"
                    alt="Attenzy"
                />
            ) : (
                <>
                    <img
                        src={AttenzyLogo}
                        className="h-12"
                        alt="Attenzy"
                    />
                    <p className="text-2xl font-semibold">
                        Attenzy
                    </p>
                </>
            )}
        </div>
    )
}
