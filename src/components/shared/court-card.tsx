import Link from "next/link"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/stores/cart.store"
import type { Court } from "@/types/court.type"

export function CourtCard({ court }: { court: Court }) {
  const addCourt = useCartStore((state) => state.addCourt)

  const handleAddToCart = () => {
    const result = addCourt(court)
    if (!result.added) {
      toast.info("Court is already in cart")
      return
    }
    toast.success("Court added to cart")
  }

  return (
    <Card className="surface-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        {court.imageUrl ? (
          <img
            src={court.imageUrl}
            alt={court.name}
            className="mb-3 h-36 w-full rounded-xl border object-cover"
          />
        ) : (
          <div className="mb-3 h-36 rounded-xl border bg-gradient-to-br from-violet-100/70 to-blue-100/70" />
        )}
        <CardTitle className="line-clamp-1 text-lg">{court.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-muted-foreground">
          Price: {court.pricePerHour.toLocaleString()} VND / hour
        </div>
        <Badge variant="outline">{court.status}</Badge>
      </CardContent>
      <CardFooter className="pt-2 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" className="rounded-lg" onClick={handleAddToCart}>
          Add to cart
        </Button>
        <Link href={`/courts/${court.id}`} className="text-sm font-medium text-primary">
          View detail
        </Link>
      </CardFooter>
    </Card>
  )
}
