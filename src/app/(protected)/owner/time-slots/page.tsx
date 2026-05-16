"use client";

import { Pencil, RefreshCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { formatBookingDate } from "@/lib/helper/date";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useTimeSlots,
  useCreateTimeSlot,
  useUpdateTimeSlot,
  useDeleteTimeSlot,
} from "@/hooks/useTimeSlot";
import { TimeSlotFormDialog } from "@/app/(protected)/owner/time-slots/dialogs/time-slot-form-dialog";
import type { TimeSlot } from "@/types/time-slot.type";
import { useMe } from "@/hooks/useUser";
import { useVenues } from "@/hooks/useVenue";
import { useCourts } from "@/hooks/useCourt";

export default function OwnerTimeSlotsPage() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [deleteSlotId, setDeleteSlotId] = useState<string | null>(null);

  const slotsQuery = useTimeSlots({
    current,
    limit: pageSize,
    date: dateFilter || undefined,
  });

  const createSlotMutation = useCreateTimeSlot();
  const updateSlotMutation = useUpdateTimeSlot();
  const deleteSlotMutation = useDeleteTimeSlot();

  const meQuery = useMe();
  const ownerId = meQuery.data?.id;
  const venuesQuery = useVenues({ current: 1, limit: 100, ownerId });
  const courtsQuery = useCourts({ current: 1, limit: 500 });

  const ownerVenueIds = useMemo(
    () => new Set((venuesQuery.data?.items ?? []).map((v) => v.id)),
    [venuesQuery.data?.items]
  );
  const ownerCourts = useMemo(
    () => (courtsQuery.data?.items ?? []).filter((c) => ownerVenueIds.has(c.venueId)),
    [courtsQuery.data?.items, ownerVenueIds]
  );
  const ownerCourtIds = useMemo(
    () => new Set(ownerCourts.map((c) => c.id)),
    [ownerCourts]
  );

  const pageItems = useMemo(
    () => (slotsQuery.data?.items ?? []).filter((slot) => ownerCourtIds.has(slot.courtId)),
    [slotsQuery.data?.items, ownerCourtIds]
  );

  const submit = async (values: any) => {
    try {
      await createSlotMutation.mutateAsync(values);
      setFormMode(null);
      slotsQuery.refetch();
    } catch {}
  };

  const submitEdit = async (values: any) => {
    if (!editingSlot) return;
    try {
      await updateSlotMutation.mutateAsync({
        id: editingSlot.id,
        payload: values,
      });
      setEditingSlot(null);
      setFormMode(null);
      slotsQuery.refetch();
    } catch {}
  };

  const handleDeleteSlot = async () => {
    if (!deleteSlotId) return;
    try {
      await deleteSlotMutation.mutateAsync(deleteSlotId);
      setDeleteSlotId(null);
    } catch {}
  };

  const openCreateSlot = () => {
    setEditingSlot(null);
    setFormMode("create");
  };

  const openEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setFormMode("edit");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Time Slots" description="Manage individual time slots, override pricing, or block slots manually." />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Input
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="w-full md:max-w-sm"
        />
        <Button variant="outline" onClick={() => { setDateFilter(""); setCurrent(1); }}>
          Clear
        </Button>
        <Button variant="outline" onClick={() => slotsQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button onClick={openCreateSlot}>Create new</Button>
      </div>

      {slotsQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : pageItems.length === 0 ? (
        <EmptyState title="No time slots found" />
      ) : (
        <div className="surface-card p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((slot: TimeSlot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">{formatBookingDate(slot.date)}</TableCell>
                  <TableCell>
                    {slot.startTime} - {slot.endTime}
                  </TableCell>
                  <TableCell>{slot.court?.venue?.name ?? "Unknown Venue"}</TableCell>
                  <TableCell>{slot.court?.name ?? "Unknown Court"}</TableCell>
                  <TableCell>{slot.price.toLocaleString()} VND</TableCell>
                  <TableCell>
                    <Badge variant={slot.status === "available" ? "success" : "outline"}>
                      {slot.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditSlot(slot)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteSlotId(slot.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-end gap-2 p-2">
        <TablePagination
          currentPage={slotsQuery.data?.current ?? current}
          total={pageItems.length}
          pageSize={pageSize}
          onChangePage={setCurrent}
          onChangePageSize={(value) => {
            setCurrent(1);
            setPageSize(value);
          }}
        />
      </Card>

      <TimeSlotFormDialog
        mode={formMode}
        slot={editingSlot}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setFormMode(null);
            setEditingSlot(null);
          }
        }}
        onCreate={submit}
        onEdit={submitEdit}
        isCreating={createSlotMutation.isPending}
        isUpdating={updateSlotMutation.isPending}
      />

      <AlertDialog
        open={!!deleteSlotId}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteSlotId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete time slot?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The time slot will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSlot}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
