import type { Dispatch, SetStateAction } from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  setRowsPerPage,
}: DataPaginationProps) {

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage))

  return (
    <div className="flex items-center justify-end gap-4 pr-2 py-3">

      {/* Rows Per Page */}
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="select-rows-per-page">
          Rows per page
        </FieldLabel>

        <Select
          value={String(rowsPerPage)}
          onValueChange={(value) => {
            setRowsPerPage(Number(value))
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>

          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value="8">8</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      {/* Pagination Controls */}
      <Pagination className="mx-0 w-auto">
        <PaginationContent>

          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                setCurrentPage(prev =>
                  Math.max(prev - 1, 1)
                )
              }
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage(prev =>
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
