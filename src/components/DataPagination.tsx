import type { Dispatch, SetStateAction } from "react"

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

interface DataPaginationProps {
    totalItems: number
    currentPage: number
    setCurrentPage: Dispatch<SetStateAction<number>>
    rowsPerPage: number
    setRowsPerPage: Dispatch<SetStateAction<number>>
}

export default function DataPagination({
    totalItems,
    currentPage,
    setCurrentPage,
    rowsPerPage,
}: DataPaginationProps) {
    const totalPages = Math.ceil(totalItems / rowsPerPage)

    if (totalPages <= 1) return null

    const generatePages = () => {
        const pages: (number | "ellipsis")[] = []

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            pages.push(1)

            if (currentPage > 3) {
                pages.push("ellipsis")
            }

            const start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            if (currentPage < totalPages - 2) {
                pages.push("ellipsis")
            }

            pages.push(totalPages)
        }

        return pages
    }

    return (
        <div className="flex items-center justify-between gap-4 py-3">

            {/* Pagination */}
            <Pagination>
                <PaginationContent>

                    {/* Previous */}
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            className={
                                currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            }
                        />
                    </PaginationItem>

                    {/* Page Numbers */}
                    {generatePages().map((page, index) => (
                        <PaginationItem key={index}>
                            {page === "ellipsis" ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    isActive={currentPage === page}
                                    onClick={() => setCurrentPage(page)}
                                >
                                    {page}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    {/* Next */}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(prev + 1, totalPages)
                                )
                            }
                            className={
                                currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : ""
                            }
                        />
                    </PaginationItem>

                </PaginationContent>
            </Pagination>
        </div>
    )
}
