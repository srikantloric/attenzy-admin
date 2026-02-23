import { useState, useMemo } from "react"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"
import { Button } from "@/components/ui/button"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput
} from "@/components/ui/input-group"
import { ChevronRight, SearchIcon } from "lucide-react"
import { Outlet, useNavigate, useLocation } from "react-router-dom"

function ReportPage() {
    const [search, setSearch] = useState("")
    const navigate = useNavigate()
    const location = useLocation()

    // Detect if we are exactly on /reports
    const isReportsHome = location.pathname === "/reports"

    const reportCategories = [
        {
            category: "Attendance Analytics",
            reports: [
                {
                    title: "Student Attendance %",
                    description:
                        "Attendance percentage per student for selected date range",
                    link: "student-attendance-percentage"
                },
                {
                    title: "Class Attendance %",
                    description:
                        "Overall attendance percentage for each class",
                    link: "class-attendance-percentage"
                },
                {
                    title: "Faculty Attendance %",
                    description:
                        "Overall faculty attendance percentage",
                    link: "faculty-attendance-percentage"
                },
                {
                    title: "Staff Attendance %",
                    description:
                        "Overall staff attendance percentage",
                    link: "staff-attendance-percentage"
                },
                {
                    title: "Organization Attendance %",
                    description:
                        "Overall attendance percentage for the entire organization",
                    link: "org-attendance-percentage"
                },
                {
                    title: "Attendance Trend Graph",
                    description:
                        "Daily or monthly attendance trend analysis",
                    link: "attendance-trend-graph"
                },
                {
                    title: "Calendar View",
                    description:
                        "Monthly matrix view of attendance per student",
                    link: "calendar-view"
                }
            ]
        },
        {
            category: "Leaderboards & Rankings",
            reports: [
                {
                    title: "Student Leaderboard",
                    description:
                        "Rank students by attendance for month, week or custom period",
                    link: "rank-students"
                },
                {
                    title: "Class Leaderboard",
                    description:
                        "Rank classes by attendance performance",
                    link: "class-leaderboard"
                },
                {
                    title: "Top Absentees",
                    description:
                        "List students with highest absences for selected period",
                    link: "top-absentees"
                }
            ]
        },
        {
            category: "Risk & Alerts",
            reports: [
                {
                    title: "Low Attendance Report",
                    description:
                        "Students falling below configured attendance threshold",
                    link: "low-attendance-report"
                },
                {
                    title: "Absence Streak Report",
                    description:
                        "Students with consecutive absence streaks",
                    link: "absence-streak-report"
                },
                {
                    title: "Chronic Absentee Report",
                    description:
                        "Students flagged as chronic absentees",
                    link: "chronic-absentee-report"
                },
                {
                    title: "Alert History",
                    description:
                        "View attendance alerts generated for students",
                    link: "alert-history"
                }
            ]
        },
        {
            category: "Summary Reports",
            reports: [
                {
                    title: "Daily Summary Report",
                    description:
                        "Daily attendance summary by student, class and org",
                    link: "daily-summary"
                },
                {
                    title: "Weekly Summary Report",
                    description:
                        "Weekly attendance summary by student, class and org",
                    link: "weekly-summary"
                },
                {
                    title: "Monthly Summary Report",
                    description:
                        "Monthly attendance summary by student, class and org",
                    link: "monthly-summary"
                }
            ]
        },
        {
            category: "Organization Insights",
            reports: [
                {
                    title: "Working Days Report",
                    description:
                        "Working days vs holidays report for selected period",
                    link: "working-days-report"
                }
            ]
        }
    ]

    /* 🔎 Filtered Categories */
    const filteredCategories = useMemo(() => {
        const query = search.toLowerCase().trim()

        return reportCategories
            .map(category => ({
                ...category,
                reports: category.reports.filter(
                    report =>
                        report.title.toLowerCase().includes(query) ||
                        report.description.toLowerCase().includes(query)
                )
            }))
            .filter(category => category.reports.length > 0)
    }, [search])

    const totalReports = filteredCategories.reduce(
        (acc, cat) => acc + cat.reports.length,
        0
    )

    return (
        <div className="space-y-8 p-6">
            <AppBreadcrumb />

            {/* If we are NOT on /reports, show child page only */}
            {!isReportsHome ? (
                <Outlet />
            ) : (
                <>
                    {/* HEADER */}
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-2xl font-semibold flex gap-2">
                            Reports
                            <span className="rounded-md bg-muted px-2 py-0.5 text-sm">
                                {totalReports}
                            </span>
                        </h1>
                    </div>

                    {/* SEARCH */}
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Search reports..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                    </InputGroup>

                    {/* NO RESULTS */}
                    {filteredCategories.length === 0 && (
                        <div className="text-center text-muted-foreground py-10">
                            No reports found.
                        </div>
                    )}

                    {/* CATEGORY SECTIONS */}
                    {filteredCategories.map((category, idx) => (
                        <div key={idx} className="space-y-4">
                            <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2">
                                {category.category} ({category.reports.length})
                            </h2>

                            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                {category.reports.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between border rounded-lg pl-4 py-4 hover:shadow-sm transition bg-background"
                                    >
                                        <div className="pr-3">
                                            <p className="text-sm sm:text-base font-medium">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>

                                        <Button
                                            variant="link"
                                            className="cursor-pointer text-primary whitespace-nowrap"
                                            onClick={() => navigate(item.link)}
                                        >
                                            Generate{" "}
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    )
}

export default ReportPage