"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UserDetailData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
}

interface UserDetailDialogProps {
  detailUserId: string | null;
  setDetailUserId: (value: string | null) => void;
  userDetailQuery: {
    isLoading: boolean;
    data?: UserDetailData | null;
  };
}

export function UserDetailDialog(props: UserDetailDialogProps) {
  const { detailUserId, setDetailUserId, userDetailQuery } = props;

  return (
    <Dialog open={!!detailUserId} onOpenChange={(open) => !open && setDetailUserId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User detail</DialogTitle>
          <DialogDescription>Data loaded from detail API endpoint.</DialogDescription>
        </DialogHeader>
        {userDetailQuery.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        ) : userDetailQuery.data ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/20 p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Account</div>
              <div className="mt-1 text-lg font-semibold">{userDetailQuery.data.fullName}</div>
              <div className="text-sm text-muted-foreground">@{userDetailQuery.data.username}</div>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {userDetailQuery.data.role}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {userDetailQuery.data.status}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="space-y-1 rounded-md border p-3">
                <div className="text-xs uppercase text-muted-foreground">Email</div>
                <div className="break-all font-medium">{userDetailQuery.data.email}</div>
              </div>
              <div className="space-y-1 rounded-md border p-3">
                <div className="text-xs uppercase text-muted-foreground">Phone</div>
                <div className="font-medium">{userDetailQuery.data.phone ?? "-"}</div>
              </div>
              <div className="space-y-1 rounded-md border p-3 md:col-span-2">
                <div className="text-xs uppercase text-muted-foreground">User ID</div>
                <div className="break-all font-mono text-xs">{userDetailQuery.data.id}</div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="No detail found" />
        )}
      </DialogContent>
    </Dialog>
  );
}
