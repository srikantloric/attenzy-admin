import { useEffect, useState } from "react"
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
import { Plus, Filter, ChevronDown, Search, } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Ban
} from "lucide-react"
import type { Partner } from "@/types/partner" 
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"

import AddPartnerForm from "@/components/partners/AddPartnerForm"
import axios from "axios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import ConfirmDialog from "@/components/common/ConfirmDialog"
import { toast } from "sonner"
import { AppBreadcrumb } from "@/components/AppBreadCrumb"

/* ---------------- component ---------------- */
function PartnersPage() {
    const [search, setSearch] = useState("")
    const [partners, setPartners] = useState<Partner[]>([])
    const [openAddPartner, setOpenAddPartner] = useState(false)

    const [partnerToSuspend, setPartnerToSuspend] = useState<Partner | null>(null)

    const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

    const fetchPartners = async () => {
        const res = await axios.get(`${BACKEND_BASE_URL}/partners`)
        setPartners(res.data.items)
    }

    useEffect(() => {
        fetchPartners()
    }, [])


    const [statusFilter, setStatusFilter] = useState<
        "All" | "ACTIVE" | "INACTIVE"
    >("All")

    const navigate = useNavigate()

    const filteredPartners = partners.filter((p) => {
        const matchesSearch = p.partnerName
            .toLowerCase()
            .includes(search.toLowerCase())

        const matchesStatus =
            statusFilter === "All" || p.status === statusFilter

        return matchesSearch && matchesStatus
    })

    const openAdminPage = (partner: Partner) => {
        navigate(`/partners/${partner.partnerId}`)
    }

    const handleSuspend = async (partner: Partner) => {
        const newStatus =
            partner.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"

        setPartners(prev =>
            prev.map(p =>
                p.partnerId === partner.partnerId
                    ? { ...p, status: newStatus }
                    : p
            )
        )

        try {
            await axios.put(`${BACKEND_BASE_URL}/partners`, {
                partnerId: partner.partnerId,
                partnerName: partner.partnerName,
                status: newStatus
            })
        } catch (err) {
            console.error("Failed to update partner status", err)
            fetchPartners()
        }
    }


    return (
        <div className="space-y-2 mt-4 min-w-0">
            <AppBreadcrumb />

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
                            {partners.reduce((sum, p) => sum + p.orgCount, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6 min-w-0">
                <div className="relative w-full max-w-sm min-w-0">
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
                            <DropdownMenuItem onClick={() => setStatusFilter("ACTIVE")}>
                                Active
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusFilter("INACTIVE")}>
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
            <Card className="px-4">
                <Table>
                    <TableHeader>
                        <TableRow>

                            <TableHead>#</TableHead>
                            <TableHead>ID</TableHead>
                            <TableHead>Partner</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Address</TableHead>

                            <TableHead>Organizations</TableHead>
                            <TableHead>Devices</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined On</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredPartners.map(partner => (
                            <TableRow key={partner.partnerId}>
                                <TableCell className="w-18">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={partner.profileImageUrl} />
                                        <AvatarFallback className="bg-muted text-primary text-md font-semibold">
                                            {partner.partnerName
                                                ?.split(" ")
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .map(word => word.charAt(0).toUpperCase())
                                                .join("") || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {partner.partnerId}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {partner.partnerName}
                                </TableCell>
                                <TableCell >
                                    {partner.partnerCompany}
                                </TableCell>
                                <TableCell>
                                    {partner.partnerAddress}
                                </TableCell>

                                <TableCell>{partner.orgCount}</TableCell>
                                <TableCell>{partner.deviceCount}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={
                                            partner.status === "ACTIVE"
                                                ? "border-green-600 text-green-600"
                                                : "border-red-500 text-red-500"
                                        }
                                    >
                                        {partner.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(partner.createdAt).toDateString()}</TableCell>

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

                                            <DropdownMenuItem
                                                disabled={partner.status === "INACTIVE"}
                                                onClick={() => setPartnerToSuspend(partner)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Ban className="mr-2 h-4 w-4" />
                                                Suspend
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
                        <DialogDescription className="mb-2">Enter details to add a new partner here.</DialogDescription>
                    </DialogHeader>

                    <AddPartnerForm
                        onSuccess={() => {
                            fetchPartners()
                            setOpenAddPartner(false)
                        }}
                    />
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={!!partnerToSuspend}
                title="Suspend Partner?"
                description="This action will deactivate the partner account and prevent access until it is reactivated."
                confirmText="Yes, Suspend"
                variant="destructive"
                onCancel={() => {
                    setPartnerToSuspend(null)
                }}
                onConfirm={() => {
                    if (partnerToSuspend) {
                        handleSuspend(partnerToSuspend)
                        toast.success("Partner suspended successfully")
                    }
                    setPartnerToSuspend(null)
                }}
            />


        </div>

    )

}

export default PartnersPage
