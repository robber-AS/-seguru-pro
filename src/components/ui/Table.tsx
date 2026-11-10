import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface TableProps {
  columns: string[];
  data: any[][];
  className?: string;
}

export const Table = ({ columns, data, className }: TableProps) => (
  <div className="overflow-x-auto">
    <table className={cn("w-full text-sm text-left border-collapse", className)}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col} className="bg-gray-50 px-4 py-3 font-medium text-gray-700 border-b border-gray-200 text-left whitespace-nowrap">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 border-b border-gray-100 text-gray-900 whitespace-nowrap">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button variant="secondary" size="sm" onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {currentPage} de {totalPages}
      </span>
      <Button variant="secondary" size="sm" onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
        Próxima
      </Button>
    </div>
  );
};
