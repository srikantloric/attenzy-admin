
import { useEffect, useMemo, useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { toast } from "sonner"

import { createHoliday, getWorkingConfig, listHolidays, updateWorkingConfig, type HolidayPayload } from "@/api/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import useAuth from "@/hooks/useAuth"

type HolidayItem = HolidayPayload & {
  holidayId?: string
  id?: string
}

const weekdayOptions = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
]

const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

const defaultWorkingDays = [1, 2, 3, 4, 5, 6]

function toMonthInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

function CalanderWorkingDayTab() {
  const auth = useAuth()
  const orgId = auth.user?.orgId ?? ""

  const [workingDays, setWorkingDays] = useState<number[]>(defaultWorkingDays)
  const [academicStartMonth, setAcademicStartMonth] = useState<string>("6")
  const [academicEndMonth, setAcademicEndMonth] = useState<string>("3")

  const [holidayName, setHolidayName] = useState("")
  const [holidayDate, setHolidayDate] = useState("")
  const [holidayMonthFilter, setHolidayMonthFilter] = useState(toMonthInputValue(new Date()))
  const [holidays, setHolidays] = useState<HolidayItem[]>([])

  const [loadingConfig, setLoadingConfig] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [loadingHolidays, setLoadingHolidays] = useState(false)
  const [savingHoliday, setSavingHoliday] = useState(false)

  const selectedWorkingDays = useMemo(
    () => new Set(workingDays),
    [workingDays]
  )

  const fetchWorkingConfig = async () => {
    if (!orgId) return

    try {
      setLoadingConfig(true)
      const config = await getWorkingConfig(orgId)

      if (!config) {
        setWorkingDays(defaultWorkingDays)
        setAcademicStartMonth("6")
        setAcademicEndMonth("3")
        return
      }

      setWorkingDays(config.workingDays?.length ? config.workingDays : defaultWorkingDays)
      setAcademicStartMonth(String(config.academicStartMonth ?? 6))
      setAcademicEndMonth(String(config.academicEndMonth ?? 3))
    } catch (error) {
      console.error("Failed to load working configuration", error)
      toast.error("Failed to load working days configuration")
    } finally {
      setLoadingConfig(false)
    }
  }

  const fetchHolidays = async (month: string) => {
    if (!orgId) return

    try {
      setLoadingHolidays(true)
      const holidayList = await listHolidays(orgId, month)
      setHolidays(holidayList)
    } catch (error) {
      console.error("Failed to load holidays", error)
      toast.error("Failed to load holidays")
    } finally {
      setLoadingHolidays(false)
    }
  }

  useEffect(() => {
    fetchWorkingConfig()
  }, [orgId])

  useEffect(() => {
    fetchHolidays(holidayMonthFilter)
  }, [orgId, holidayMonthFilter])

  const toggleWorkingDay = (dayValue: number, checked: boolean | "indeterminate") => {
    if (checked === true) {
      setWorkingDays((prev) => Array.from(new Set([...prev, dayValue])).sort((a, b) => a - b))
      return
    }

    setWorkingDays((prev) => prev.filter((d) => d !== dayValue))
  }

  const handleSaveConfig = async () => {
    if (!orgId) {
      toast.error("Organization context is missing")
      return
    }

    if (workingDays.length === 0) {
      toast.error("Select at least one working day")
      return
    }

    try {
      setSavingConfig(true)

      await updateWorkingConfig(orgId, {
        workingDays,
        academicStartMonth: Number(academicStartMonth),
        academicEndMonth: Number(academicEndMonth),
      })

      toast.success("Working configuration saved")
    } catch (error) {
      console.error("Failed to save working configuration", error)
      toast.error("Failed to save working configuration")
    } finally {
      setSavingConfig(false)
    }
  }

  const handleAddHoliday = async () => {
    if (!orgId) {
      toast.error("Organization context is missing")
      return
    }

    if (!holidayName.trim() || !holidayDate) {
      toast.error("Holiday name and date are required")
      return
    }

    try {
      setSavingHoliday(true)

      await createHoliday(orgId, {
        name: holidayName.trim(),
        date: holidayDate,
      })

      setHolidayName("")
      setHolidayDate("")

      if (holidayDate.startsWith(holidayMonthFilter)) {
        await fetchHolidays(holidayMonthFilter)
      }

      toast.success("Holiday added")
    } catch (error) {
      console.error("Failed to add holiday", error)
      toast.error("Failed to add holiday")
    } finally {
      setSavingHoliday(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Calendar & Working Days</h2>
        <p className="text-sm text-muted-foreground">
          Configure working days, academic year months, and organization holidays.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="working-config" className="space-y-4">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="working-config">Working Config</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>

        <TabsContent value="working-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Days</CardTitle>
              <CardDescription>
                Pick weekly working days and set academic year start/end months.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {weekdayOptions.map((day) => (
                  <label
                    key={day.value}
                    className="flex items-center gap-3 rounded-md border border-neutral-200 px-3 py-2"
                  >
                    <Checkbox
                      checked={selectedWorkingDays.has(day.value)}
                      onCheckedChange={(checked) => toggleWorkingDay(day.value, checked)}
                    />
                    <span className="text-sm font-medium">{day.label}</span>
                  </label>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Academic Start Month</Label>
                  <Select value={academicStartMonth} onValueChange={setAcademicStartMonth}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Academic End Month</Label>
                  <Select value={academicEndMonth} onValueChange={setAcademicEndMonth}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthOptions.map((month) => (
                        <SelectItem key={month.value} value={String(month.value)}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSaveConfig}
                disabled={loadingConfig || savingConfig}
              >
                {savingConfig ? "Saving..." : "Save Working Configuration"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holidays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Holiday</CardTitle>
              <CardDescription>
                Add organization holidays in YYYY-MM-DD format.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="holiday-name">Holiday Name</Label>
                <Input
                  id="holiday-name"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="e.g. Republic Day"
                />
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="holiday-date">Date</Label>
                <Input
                  id="holiday-date"
                  type="date"
                  value={holidayDate}
                  onChange={(e) => setHolidayDate(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button type="button" onClick={handleAddHoliday} disabled={savingHoliday}>
                  {savingHoliday ? "Adding..." : "Add Holiday"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Holiday List</CardTitle>
                <CardDescription>
                  Filter holidays by month.
                </CardDescription>
              </div>

              <div className="w-full max-w-xs space-y-2">
                <Label htmlFor="holiday-month">Month</Label>
                <Input
                  id="holiday-month"
                  type="month"
                  value={holidayMonthFilter}
                  onChange={(e) => setHolidayMonthFilter(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!loadingHolidays && holidays.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        No holidays found for {holidayMonthFilter}
                      </TableCell>
                    </TableRow>
                  )}

                  {loadingHolidays && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Loading holidays...
                      </TableCell>
                    </TableRow>
                  )}

                  {!loadingHolidays && holidays.map((holiday, index) => {
                    const parsedDate = holiday.date ? parseISO(holiday.date) : undefined
                    const dateLabel = parsedDate && isValid(parsedDate)
                      ? format(parsedDate, "dd MMM yyyy")
                      : holiday.date || "-"

                    return (
                      <TableRow key={holiday.holidayId ?? holiday.id ?? `${holiday.date}-${index}`}>
                        <TableCell>{dateLabel}</TableCell>
                        <TableCell>{holiday.name}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CalanderWorkingDayTab