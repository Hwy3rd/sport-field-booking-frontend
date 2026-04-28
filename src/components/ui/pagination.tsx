import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PaginationProps = {
  current: number
  totalPages: number
  onChange: (page: number) => void
  className?: string
}

const buildPageItems = (current: number, totalPages: number): Array<number | "ellipsis-left" | "ellipsis-right"> => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-right", totalPages]
  }

  if (current >= totalPages - 3) {
    return [
      1,
      "ellipsis-left",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ]
  }

  return [1, "ellipsis-left", current - 1, current, current + 1, "ellipsis-right", totalPages]
}

export function Pagination({
  current,
  totalPages,
  onChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const pageItems = buildPageItems(current, totalPages)

  return (
    <div
      className={cn(
        "flex w-full items-center justify-end gap-1 rounded-xl border border-border/80 bg-card px-3 py-2 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-1">
        {pageItems.map((item) =>
          typeof item === "number" ? (
            <Button
              key={item}
              variant={item === current ? "default" : "outline"}
              size="sm"
              className="h-8 min-w-8 px-2"
              onClick={() => onChange(item)}
            >
              {item}
            </Button>
          ) : (
            <span key={item} className="px-1 text-sm text-muted-foreground">
              ...
            </span>
          ),
        )}
      </div>
    </div>
  )
}
