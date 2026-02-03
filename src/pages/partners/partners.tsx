import { useState } from "react"
import { useNavigate } from "react-router-dom"
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
import { Plus, Filter, ChevronDown, Search } from "lucide-react"
import { Separator } from "@/components/ui/separator"
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
import type { Partner } from "@/types/partner"
import { getPartners, updatePartner, deletePartner, addPartner } from "@/store/partnerStore"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

import AddPartnerForm from "@/components/partners/AddPartnerForm"

/* ---------------- component ---------------- */
function Partners() {
    const [search, setSearch] = useState("")
    const [partners, setPartners] = useState(getPartners())
    const [openAddPartner, setOpenAddPartner] = useState(false)

    const [statusFilter, setStatusFilter] = useState<
        "All" | "Active" | "Inactive"
    >("All")

    const navigate = useNavigate()

    const filteredPartners = partners.filter((p) => {
        const matchesSearch = p.name
            .toLowerCase()
            .includes(search.toLowerCase())

        const matchesStatus =
            statusFilter === "All" || p.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const openAdminPage = (partner: Partner) => {
        navigate(`/partners/${partner.id}/admin`)
    }

    const handleSuspend = (partner: Partner) => {
        updatePartner({
            ...partner,
            status: partner.status === "Active" ? "Inactive" : "Active"
        })

        setPartners(getPartners())
    }

    const handleDelete = (partner: Partner) => {
        if (!confirm(`Delete ${partner.name}?`)) return

        deletePartner(partner.id)
        setPartners(getPartners())
    }

    return (
        <div className="space-y-6 mt-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Partners</h1>

                <Button
                    className="gap-2 bg-primary"
                    onClick={() => setOpenAddPartner(true)}
                >
                    <Plus className="h-4 w-4" />
                    Add Partner
                </Button>

            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Partners
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">{partners.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Organizations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-semibold">
                            {partners.reduce((sum, p) => sum + p.organizations, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search Partners..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                Status: {statusFilter}
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


                    <Button variant="default" className="gap-2 bg-primary">
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
                            <TableHead>Partner</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Organizations</TableHead>
                            <TableHead>Devices</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredPartners.map(partner => (
                            <TableRow key={partner.id}>
                                <TableCell className="font-medium">
                                    {partner.name}
                                </TableCell>

                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            partner.status === "Active"
                                                ? "border-green-600 text-green-600"
                                                : "border-red-500 text-red-500"
                                        }
                                    >
                                        {partner.status}
                                    </Badge>
                                </TableCell>

                                <TableCell>{partner.organizations}</TableCell>
                                <TableCell>{partner.devices}</TableCell>
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
                                            <DropdownMenuItem onClick={() => openAdminPage(partner)}>
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => openAdminPage(partner)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>

                                            <DropdownMenuItem onClick={() => handleSuspend(partner)}>
                                                <Ban className="mr-2 h-4 w-4" />
                                                Suspend
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => handleDelete(partner)}
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

            </Card>

            <Dialog open={openAddPartner} onOpenChange={setOpenAddPartner}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add Partner</DialogTitle>
                    </DialogHeader>

                    <AddPartnerForm
                        onSuccess={() => {
                            setPartners(getPartners())
                            setOpenAddPartner(false)
                        }}
                    />
                </DialogContent>
            </Dialog>

        </div>

    )

}

export default Partners
