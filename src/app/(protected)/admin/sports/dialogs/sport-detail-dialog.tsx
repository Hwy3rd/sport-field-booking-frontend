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

interface SportDetailDialogProps {
  detailSportId: string | null;
  setDetailSportId: (value: string | null) => void;
  sportDetailQuery: {
    isLoading: boolean;
    data?: { id: string; name: string; description?: string | null } | null;
  };
}

export function SportDetailDialog(props: SportDetailDialogProps) {
  const { detailSportId, setDetailSportId, sportDetailQuery } = props;

  return (
    <Dialog open={!!detailSportId} onOpenChange={(open) => !open && setDetailSportId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sport detail</DialogTitle>
          <DialogDescription>Data loaded from sport detail API.</DialogDescription>
        </DialogHeader>
        {sportDetailQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : sportDetailQuery.data ? (
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">ID:</span> {sportDetailQuery.data.id}
            </div>
            <div>
              <span className="font-medium">Name:</span> {sportDetailQuery.data.name}
            </div>
            <div>
              <span className="font-medium">Description:</span> {sportDetailQuery.data.description ?? "-"}
            </div>
          </div>
        ) : (
          <EmptyState title="No detail found" />
        )}
      </DialogContent>
    </Dialog>
  );
}

