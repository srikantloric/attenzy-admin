"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical } from "lucide-react"

import useAuth from "@/hooks/useAuth"
import {
  listGrades,
  listSections,
  listDepartments,
  createGrade,
  createSection,
  createDepartment,
  updateGrade,
  updateSection,
  updateDepartment,
  deleteGrade,
  deleteSection,
  deleteDepartment
} from "@/api/academics"
import type { AcademicItem } from "@/types/academics"

type MasterItem = {
  gradeId?: string
  sectionId?: string
  departmentId?: string
  name: string
  isActive: boolean
  createdAt: number
}

function AcademicSetupTab() {

  const auth = useAuth()
  const orgId = auth.user?.orgId ?? ""

  const [grades, setGrades] = useState<AcademicItem[]>([])
  const [sections, setSections] = useState<AcademicItem[]>([])
  const [departments, setDepartments] = useState<AcademicItem[]>([])

  const [gradeInput, setGradeInput] = useState("")
  const [sectionInput, setSectionInput] = useState("")
  const [departmentInput, setDepartmentInput] = useState("")
  const [loading, setLoading] = useState(false)

  /* ================= FETCH ================= */

  const fetchAll = async () => {
    if (!orgId) return

    try {
      setLoading(true)

      const [g, s, d] = await Promise.all([
        listGrades(orgId),
        listSections(orgId),
        listDepartments(orgId)
      ])

      setGrades(g || [])
      setSections(s || [])
      setDepartments(d || [])

      console.log(g)

    } catch (err) {
      console.error("Failed to load academic masters", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [orgId])

  /* ================= CREATE ================= */

  const handleCreate = async (
    type: "grade" | "section" | "department",
    name: string,
    clear: () => void
  ) => {
    if (!name.trim() || !orgId) return

    try {
      setLoading(true)

      if (type === "grade") await createGrade({ orgId, name })
      if (type === "section") await createSection({ orgId, name })
      if (type === "department") await createDepartment({ orgId, name })

      clear()
      await fetchAll()

    } catch (err) {
      console.error("Create failed", err)
    } finally {
      setLoading(false)
    }
  }

  /* ================= UPDATE ================= */

  const handleToggle = async (
    type: "grade" | "section" | "department",
    id: string,
    current: boolean
  ) => {
    if (!orgId) return

    try {
      if (type === "grade") await updateGrade({ orgId, id, isActive: !current })
      if (type === "section") await updateSection({ orgId, id, isActive: !current })
      if (type === "department") await updateDepartment({ orgId, id, isActive: !current })

      await fetchAll()

    } catch (err) {
      console.error("Toggle failed", err)
    }
  }

  /* ================= DELETE ================= */

  const handleDelete = async (
    type: "grade" | "section" | "department",
    id: string
  ) => {
    if (!orgId) return

    try {
      if (type === "grade") await deleteGrade(orgId, id)
      if (type === "section") await deleteSection(orgId, id)
      if (type === "department") await deleteDepartment(orgId, id)

      await fetchAll()

    } catch (err) {
      console.error("Delete failed", err)
    }
  }

  /* ================= TABLE ================= */

  const renderTable = (
    items: MasterItem[],
    type: "grade" | "section" | "department",
    idKey: "gradeId" | "sectionId" | "departmentId"
  ) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No records found
            </TableCell>
          </TableRow>
        )}

        {items.map((item) => {
          const id = item[idKey] as string

          return (
            <TableRow key={id}>
              <TableCell>{item.name}</TableCell>

              <TableCell>
                <span className={`text-xs px-2 py-1 rounded ${item.isActive
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-200 text-gray-600"
                  }`}>
                  {item.isActive ? "Active" : "Disabled"}
                </span>
              </TableCell>

              <TableCell>
                {format(new Date(item.createdAt), "dd MMM yyyy HH:mm")}
              </TableCell>

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleToggle(type, id, item.isActive)}
                    >
                      {item.isActive ? "Disable" : "Enable"}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-500"
                      onClick={() => handleDelete(type, id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )

  /* ================= UI ================= */

  return (
    <div className="p-6 space-y-6 max-w-6xl">

      <div>
        <h1 className="text-2xl font-semibold">Academic Master Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Manage grades, sections and departments.
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="grades" className="space-y-6">

        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        {/* GRADES */}
        <TabsContent value="grades">
          <Card>
            <CardHeader>
              <CardTitle>Manage Grades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label>Grade Name</Label>
                  <Input
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    disabled={loading}
                    onClick={() =>
                      handleCreate("grade", gradeInput, () => setGradeInput(""))
                    }
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <Separator />
              {renderTable(grades, "grade", "gradeId")}

            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTIONS */}
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Manage Sections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="flex gap-4">
                <Input
                  value={sectionInput}
                  onChange={(e) => setSectionInput(e.target.value)}
                />
                <Button
                  onClick={() =>
                    handleCreate("section", sectionInput, () => setSectionInput(""))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>

              <Separator />
              {renderTable(sections, "section", "sectionId")}

            </CardContent>
          </Card>
        </TabsContent>

        {/* DEPARTMENTS */}
        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Manage Departments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

              <div className="flex gap-4">
                <Input
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                />
                <Button
                  onClick={() =>
                    handleCreate("department", departmentInput, () => setDepartmentInput(""))
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
              </div>

              <Separator />
              {renderTable(departments, "department", "departmentId")}

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default AcademicSetupTab