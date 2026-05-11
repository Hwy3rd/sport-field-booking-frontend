import Link from "next/link"
import { MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Venue } from "@/types/venue.type"

export function VenueCard({
  venue,
  footerAction,
}: {
  venue: Venue
  footerAction?: React.ReactNode
}) {
  return (
    <Card className="surface-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader>
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="mb-3 h-36 w-full rounded-xl border object-cover"
          />
        ) : (
          <div className="mb-3 h-36 rounded-xl border bg-gradient-to-br from-indigo-100/70 to-cyan-100/60" />
        )}
        <CardTitle className="line-clamp-1 text-lg">{venue.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4" />
          <span className="line-clamp-2">{venue.address}</span>
        </div>
        <Badge variant="outline">{venue.status}</Badge>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full items-center justify-between gap-2">
          <Link href={`/venues/${venue.id}`} className="text-sm font-medium text-primary">
            View detail
          </Link>
          {footerAction}
        </div>
      </CardFooter>
    </Card>
  )
}
