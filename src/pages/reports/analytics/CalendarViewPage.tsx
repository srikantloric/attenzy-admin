
import { useEffect, useState } from "react"
import { AttendanceTable } from "@/components/attendance/AttendanceTable"
import { Loader2 } from "lucide-react"
import useAuth from "@/hooks/useAuth"
import axiosServices from "@/utils/axios"

interface AttendanceResponse {
    month: string
    days: string[]
    users: any[]
}

function CalendarViewPage() {
    const [data, setData] = useState<AttendanceResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    const { user } = useAuth()
    const orgId = user?.orgId

    const classId = "LKG"
    const month = "2026-02"

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true)
                setError(null)

                const res = await axiosServices.get(
                    `/orgs/${orgId}/calendar-view?month=${month}&classId=${classId}`
                )

                console.log("data", res.data)
                setData(res.data)

            } catch (err: any) {
                setError(err.message || "Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        fetchAttendance()
    }, [orgId, classId, month])

    // 🔄 Loading UI
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading monthly attendance...
            </div>
        )
    }

    // ❌ Error UI
    if (error) {
        return (
            <div className="text-center text-red-500 py-10">
                Failed to load attendance: {error}
            </div>
        )
    }

    // ⚠️ Empty state
    if (!data) {
        return (
            <div className="text-center text-muted-foreground py-10">
                No attendance data available
            </div>
        )
    }

    return (
        <div >
            <AttendanceTable
                days={data.days}
                users={data.users}
            />
        </div>
    )
}

export default CalendarViewPage