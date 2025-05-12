import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress
} from '@mui/material';

function DataTable({ data, isLoading, error }) {
  // Dynamically create columns from the keys of the first data object
  const columns = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    // Get keys from the first row, assume they are the columns
    const keys = Object.keys(data[0]);
    return keys.map(key => ({
      accessorKey: key,
      header: () => <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>, // Capitalize header
      cell: info => info.getValue(), // Render the value directly
    }));
  }, [data]); // Re-calculate columns only when data changes

  const table = useReactTable({
    data: data || [], // Ensure data is always an array
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>;
  }

  if (error) {
     return <Typography color="error" sx={{ p: 2 }}>Error loading data: {error}</Typography>;
  }

  if (!data || data.length === 0) {
    return <Typography sx={{ p: 2 }}>No data available.</Typography>;
  }

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 440, mt: 2 }}> {/* Optional: Add max height for scroll */}
      <Table stickyHeader aria-label="data table">
        <TableHead>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableCell key={header.id} sx={{ fontWeight: 'bold', backgroundColor: 'grey.200' }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id} hover>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;