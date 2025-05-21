"use client"

import { useState, useEffect } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, SlidersHorizontal } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  showPagination?: boolean
  rowsPerPageOptions?: number[]
  defaultPageSize?: number
  onRowClick?: (row: TData) => void
  isLoading?: boolean
  emptyMessage?: string
  showColumnToggle?: boolean
  enableExport?: boolean
  exportFilename?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  showPagination = true,
  rowsPerPageOptions = [10, 20, 50, 100],
  defaultPageSize = 10,
  onRowClick,
  isLoading = false,
  emptyMessage = "No results found.",
  showColumnToggle = false,
  enableExport = false,
  exportFilename = "data-export",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [searchValue, setSearchValue] = useState("")
  
  // Initialize table
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Set page size from props
  useEffect(() => {
    if (defaultPageSize) {
      table.setPageSize(defaultPageSize)
    }
  }, [table, defaultPageSize])
  
  // Apply search filter with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchKey && searchValue) {
        table.getColumn(searchKey)?.setFilterValue(searchValue)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchValue, searchKey, table])

  // Update the filter when the searchKey changes
  useEffect(() => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(searchValue)
    }
  }, [searchKey, table, searchValue])

  // Function to export table data to CSV
  const exportToCSV = () => {
    if (!data.length) return
    
    // Get visible columns
    const visibleColumns = columns.filter(column => {
      const columnId = String(column.id || column.accessorKey)
      return columnVisibility[columnId] !== false
    })
    
    // Create CSV header
    const headers = visibleColumns.map(column => {
      return String(column.header || column.accessorKey || column.id)
    })
    
    // Create CSV rows
    const rows = data.map((row: any) => {
      return visibleColumns.map(column => {
        const key = String(column.accessorKey || column.id)
        return row[key] !== undefined ? row[key] : ''
      })
    })
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${exportFilename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        {searchKey && (
          <div className="flex w-full md:w-auto items-center gap-2">
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2 lg:px-3"
              onClick={() => setSearchValue("")}
            >
              Reset
            </Button>
          </div>
        )}
        
        <div className="flex flex-row items-center ml-auto gap-2">
          {showColumnToggle && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto h-9">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {enableExport && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-9"
              onClick={exportToCSV}
              disabled={!data.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center backdrop-blur-sm z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
          
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header\
