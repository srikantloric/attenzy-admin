"use client"

import { useState } from "react"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"

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

type MasterItem = {
  id: string
  name: string
  isActive: boolean
  createdAt: string
}

function AcademicSetupTab() {

  const [grades, setGrades] = useState<MasterItem[]>([])
  const [sections, setSections] = useState<MasterItem[]>([])
  const [departments, setDepartments] = useState<MasterItem[]>([])

  const [gradeInput, setGradeInput] = useState("")
  const [sectionInput, setSectionInput] = useState("")
  const [departmentInput, setDepartmentInput] = useState("")

  /* ================= ADD FUNCTIONS ================= */

  const createItem = (name: string): MasterItem => ({
    id: uuidv4(),
    name,
    isActive: true,
    createdAt: format(new Date(), "dd MMM yyyy HH:mm"),
  })

  const addGrade = () => {
    if (!gradeInput.trim()) return
    setGrades([...grades, createItem(gradeInput.trim())])
    setGradeInput("")
  }

  const addSection = () => {
    if (!sectionInput.trim()) return
    setSections([...sections, createItem(sectionInput.trim())])
    setSectionInput("")
  }

  const addDepartment = () => {
    if (!departmentInput.trim()) return
    setDepartments([...departments, createItem(departmentInput.trim())])
    setDepartmentInput("")
  }

  /* ================= ACTIONS ================= */

  const toggleActive = (
    id: string,
    items: MasterItem[],
    setter: (val: MasterItem[]) => void
  ) => {
    setter(
      items.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    )
  }

  const deleteItem = (
    id: string,
    items: MasterItem[],
    setter: (val: MasterItem[]) => void
  ) => {
    setter(items.filter((item) => item.id !== id))
  }

  /* ================= TABLE RENDER ================= */

  const renderTable = (
    items: MasterItem[],
    setter: (val: MasterItem[]) => void
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
              No records added yet
            </TableCell>
          </TableRow>
        )}
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name}</TableCell>
            <TableCell>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  item.isActive
                    ? "bg-green-100 text-green-600"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {item.isActive ? "Active" : "Disabled"}
              </span>
            </TableCell>
            <TableCell>{item.createdAt}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => toggleActive(item.id, items, setter)}
                  >
                    {item.isActive ? "Disable" : "Enable"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => deleteItem(item.id, items, setter)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl">

      <div>
        <h1 className="text-2xl font-semibold">Academic Master Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Manage grades, sections and departments for your organization.
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
                    placeholder="e.g. Grade 10"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addGrade}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <Separator />

              {renderTable(grades, setGrades)}

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
                <div className="flex-1 space-y-2">
                  <Label>Section Name</Label>
                  <Input
                    placeholder="e.g. A"
                    value={sectionInput}
                    onChange={(e) => setSectionInput(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addSection}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <Separator />

              {renderTable(sections, setSections)}

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
                <div className="flex-1 space-y-2">
                  <Label>Department Name</Label>
                  <Input
                    placeholder="e.g. Science"
                    value={departmentInput}
                    onChange={(e) => setDepartmentInput(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addDepartment}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>

              <Separator />

              {renderTable(departments, setDepartments)}

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}

export default AcademicSetupTab