import { useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Plus, ChevronDown, Search, Filter } from "lucide-react"
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Ban,
    Trash2
} from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

import AddOrganizationForm from "@/components/organizations/AddOrganizationForm"
import { useNavigate } from "react-router-dom"
import type { Organization, OrganizationStatus } from "@/types/organization"
import {
    getOrganizations,
    updateOrganization,
    deleteOrganization
} from "@/store/organizationStore"


/* ---------------- component ---------------- */
function Organizations() {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<"All" | OrganizationStatus>("All")
    const [partnerFilter, setPartnerFilter] = useState<string>("All")
    const [openAddOrg, setOpenAddOrg] = useState(false)
    const [organizations, setOrganizations] = useState<Organization[]>(getOrganizations())


    const navigate = useNavigate()

    const openOrganizationAdmin = (org: Organization) => {
        navigate(`/organizations/${org.id}/admin`)
    }

    const filteredOrganizations = organizations.filter((o) => {
        const matchesSearch = o.name
            .toLowerCase()
            .includes(search.toLowerCase())

        const matchesStatus =
            statusFilter === "All" || o.status === statusFilter

        const matchesPartner =
            partnerFilter === "All" || o.partner === partnerFilter

        return matchesSearch && matchesStatus && matchesPartner
    })

    const handleSuspend = (org: Organization) => {
        updateOrganization({
            ...org,
            status: org.status === "Active" ? "Inactive" : "Active"
        })

        setOrganizations(getOrganizations())
    }

    const handleDelete = (org: Organization) => {
        if (!confirm(`Delete ${org.name}?`)) return

        deleteOrganization(org.id)
        setOrganizations(getOrganizations())
    }

    return (
        <div className="space-y-6 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Organizations</h1>

                <Button
                    className="gap-2 bg-primary"
                    onClick={() => setOpenAddOrg(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add Organization
                </Button>

            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Total Organizations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">
                            {organizations.length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm text-muted-foreground">
                            Total Devices
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">
                            372 <span className="text-muted-foreground">/ 400</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="my-2" />

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Organizations..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                {partnerFilter === "All" ? "Partner" : partnerFilter}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPartnerFilter("All")}>
                                All Partners
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPartnerFilter("Unified Tech")}>
                                Unified Tech
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPartnerFilter("Connect Solutions")}>
                                Connect Solutions
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPartnerFilter("EduSmart Technologies")}>
                                EduSmart Technologies
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPartnerFilter("SafePass Services")}>
                                SafePass Services
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPartnerFilter("Trackify Systems")}>
                                Trackify Systems
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>


                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                {statusFilter === "All" ? "All Statuses" : statusFilter}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setStatusFilter("All")}>
                                All
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("Active")}>
                                Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("Inactive")}>
                                Inactive
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button className="gap-2 bg-primary">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Organization</TableHead>
                            <TableHead>Partner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Devices Managed</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredOrganizations.map(org => (
                            <TableRow key={org.id}>
                                <TableCell className="font-medium">
                                    {org.name}
                                </TableCell>
                                <TableCell>{org.partner}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            org.status === "Active"
                                                ? "border-green-600 text-green-600"
                                                : "border-red-500 text-red-500"
                                        }
                                    >
                                        {org.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{org.devices}</TableCell>
                                <TableCell>{org.joined}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end" className="w-40">
                                            <DropdownMenuItem onClick={() => openOrganizationAdmin(org)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => openOrganizationAdmin(org)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>


                                            <DropdownMenuItem onClick={() => handleSuspend(org)}>
                                                <Ban className="mr-2 h-4 w-4" />
                                                Suspend
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => handleDelete(org)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Separator />

                {/* Pagination */}
                <div className="flex items-center justify-end gap-4 mr-4">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                        <Select defaultValue="25">
                            <SelectTrigger className="w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                    <Pagination className="mx-0 w-auto">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>

                <Dialog open={openAddOrg} onOpenChange={setOpenAddOrg}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Organization</DialogTitle>
                        </DialogHeader>

                        <AddOrganizationForm
                            onSuccess={() => {
                                setOrganizations(getOrganizations())
                                setOpenAddOrg(false)
                            }}
                        />

                    </DialogContent>
                </Dialog>


            </Card>
        </div>
    )
}

export default Organizations
