"use client";

import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface VenueDetailData {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  description: string;
  imageUrl?: string | null;
  operatingHours?: { startTime?: string; endTime?: string } | null;
  contactInfo?: { phone?: string; email?: string } | null;
}

interface VenueDetailDialogProps {
  detailVenueId: string | null;
  setDetailVenueId: (value: string | null) => void;
  detailVenueQuery: {
    isLoading: boolean;
    data?: VenueDetailData | null;
  };
}

export function VenueDetailDialog(props: VenueDetailDialogProps) {
  const { detailVenueId, setDetailVenueId, detailVenueQuery } = props;

  return (
    <Dialog open={!!detailVenueId} onOpenChange={(open) => !open && setDetailVenueId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Venue detail</DialogTitle>
          <DialogDescription>Data loaded from venue detail API.</DialogDescription>
        </DialogHeader>
        {detailVenueQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : detailVenueQuery.data ? (
          <div className="space-y-4">
            {detailVenueQuery.data.imageUrl ? (
              <img
                src={detailVenueQuery.data.imageUrl}
                alt={detailVenueQuery.data.name}
                className="h-44 w-full rounded-lg border object-cover"
              />
            ) : null}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Name</div><div className="font-medium">{detailVenueQuery.data.name}</div></div>
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Owner ID</div><div className="font-medium">{detailVenueQuery.data.ownerId}</div></div>
              <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Address</div><div className="font-medium">{detailVenueQuery.data.address}</div></div>
              <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Description</div><div className="font-medium">{detailVenueQuery.data.description}</div></div>
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Operating</div><div className="font-medium">{detailVenueQuery.data.operatingHours?.startTime} - {detailVenueQuery.data.operatingHours?.endTime}</div></div>
              <div className="rounded-md border p-3"><div className="text-muted-foreground">Phone</div><div className="font-medium">{detailVenueQuery.data.contactInfo?.phone ?? "-"}</div></div>
              <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Email</div><div className="font-medium">{detailVenueQuery.data.contactInfo?.email ?? "-"}</div></div>
            </div>
          </div>
        ) : (
          <EmptyState title="No detail found" />
        )}
      </DialogContent>
    </Dialog>
  );
}

