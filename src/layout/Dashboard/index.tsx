import AuthGuard from "@/utils/route-guard/AuthGuard"

function MainLayout() {
    return (
        <AuthGuard>
            <div>MainLayout</div>
        </AuthGuard>
    )
}

export default MainLayout