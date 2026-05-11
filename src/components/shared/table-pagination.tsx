import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPaginationRange } from "@/lib/utils";

interface TablePaginationProps {
  total: number;
  currentPage: number;
  pageSize: number;
  onChangePage: (page: number) => void;
  onChangePageSize: (pageSize: number) => void;
}

const PAGE_SIZES = [10, 20, 50];

export function TablePagination({
  total,
  currentPage,
  pageSize,
  onChangePage,
  onChangePageSize,
}: TablePaginationProps) {
  // Tính tổng số trang thực tế dựa trên total và pageSize
  // Nếu total là tổng số item, bạn cần: Math.ceil(total / pageSize)
  // Nếu total đã là tổng số trang từ backend gửi về thì giữ nguyên
  const totalPages = Math.ceil(total / pageSize);
  const pages = getPaginationRange(currentPage, totalPages);

  return (
    <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
      {/* Hiển thị số lượng bản ghi - Giúp UX tốt hơn */}
      <p className="text-muted-foreground px-2 text-sm">
        Tổng số <span className="text-foreground font-medium">{totalPages}</span> bản ghi
      </p>

      <div className="flex items-center gap-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 1) onChangePage(currentPage - 1);
                }}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>

            {pages.map((page, index) => (
              <PaginationItem key={index}>
                {page === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onChangePage(page as number);
                    }}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages) onChangePage(currentPage + 1);
                }}
                className={
                  currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm whitespace-nowrap">Hiển thị</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              // Reset về trang 1 khi đổi size để tránh lỗi out-of-range
              onChangePageSize(Number(value));
              onChangePage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZES.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / trang
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
