// src/hooks/useFilterPagination.ts
import { useEffect, useMemo, useState } from "react";

type StatusFilter = "all" | "active" | "inactive";

interface UseFilterPaginationProps<T> {
  data: T[];
  searchKey: keyof T;
  getIsActive: (item: T) => boolean;
}

export function useFilterPagination<T>({
  data,
  searchKey,
  getIsActive,
}: UseFilterPaginationProps<T>) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] =
    useState<StatusFilter>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  /* ================= FILTER ================= */

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch = String(item[searchKey])
        .toLowerCase()
        .includes(search.toLowerCase());

      const isActive = getIsActive(item);

      const matchesFilter =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
          ? isActive
          : !isActive;

      return matchesSearch && matchesFilter;
    });
  }, [data, search, filterStatus, searchKey, getIsActive]);

  /* ================= PAGINATION ================= */

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* Reset page when filters change */
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  return {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
    filteredData,
    paginatedData,
  };
}
