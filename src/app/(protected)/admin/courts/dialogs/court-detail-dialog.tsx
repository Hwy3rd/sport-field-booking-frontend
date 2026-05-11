"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface CourtDetailData {
  id: string;
  name: string;
  venueId: string;
  sportId: string;
  pricePerHour: number;
  status: string;
  imageUrl?: string | null;
  venue?: { name?: string } | null;
  sport?: { name?: string } | null;
}

interface CourtDetailDialogProps {
  detailCourtId: string | null;
  setDetailCourtId: (value: string | null) => void;
  detailCourtQuery: {
    isLoading: boolean;
    data?: CourtDetailData | null;
  };
}

export function CourtDetailDialog(props: CourtDetailDialogProps) {
  const { detailCourtId, setDetailCourtId, detailCourtQuery } = props;
  return (
    <Dialog open={!!detailCourtId} onOpenChange={(open) => !open && setDetailCourtId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Court detail</DialogTitle>
          <DialogDescription>Data loaded from court detail API.</DialogDescription>
        </DialogHeader>
        {detailCourtQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : detailCourtQuery.data ? (
          <div className="space-y-4">
            {detailCourtQuery.data.imageUrl ? (
              <img src={detailCourtQuery.data.imageUrl} alt={detailCourtQuery.data.name} className="h-44 w-full rounded-lg border object-cover" />
            ) : null}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Name</div><div className="font-medium">{detailCourtQuery.data.name}</div></div>
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Status</div><div className="font-medium capitalize">{detailCourtQuery.data.status}</div></div>
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Venue</div><div className="font-medium">{detailCourtQuery.data.venue?.name ?? detailCourtQuery.data.venueId}</div></div>
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Sport</div><div className="font-medium">{detailCourtQuery.data.sport?.name ?? detailCourtQuery.data.sportId}</div></div>
              <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Price/hour</div><div className="font-medium">{detailCourtQuery.data.pricePerHour.toLocaleString()} VND</div></div>
            </div>
          </div>
        ) : (
          <EmptyState title="No detail found" />
        )}
      </DialogContent>
    </Dialog>
  );
}

