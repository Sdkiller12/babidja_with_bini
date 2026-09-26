import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, onPageChange }: PaginationProps) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 py-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-2"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <span className="text-sm font-medium text-gray-600 px-4">
        Page {currentPage} sur {lastPage}
      </span>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-2"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
