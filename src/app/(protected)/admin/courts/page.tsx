"use client";

import { Pencil, RefreshCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourtDetail, useCourts, useCreateCourt, useDeleteCourt, useDeleteMultipleCourts, useUpdateCourt } from "@/hooks/useCourt";
import { useDebounce } from "@/hooks/useDebounce";
import { useSportsList } from "@/hooks/useSport";
import { useTimeSlots, useUpdateTimeSlot } from "@/hooks/useTimeSlot";
import { useVenues } from "@/hooks/useVenue";
import type { Court } from "@/types/court.type";
import type { UpdateTimeSlotRequest } from "@/types/time-slot.type";
import { CourtDetailDialog } from "@/app/(protected)/admin/courts/dialogs/court-detail-dialog";
import { CourtFilterDialog } from "@/app/(protected)/admin/courts/dialogs/court-filter-dialog";
import { CourtFormDialog, type CourtFormValue } from "@/app/(protected)/admin/courts/dialogs/court-form-dialog";

const getCourtStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success" as const;
    case "maintenance":
      return "warning" as const;
    case "deleted":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const getCourtStatusBadgeClassName = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "maintenance":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "deleted":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "";
  }
};

export default function AdminCourtsPage() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [filterVenueId, setFilterVenueId] = useState<string>("all");
  const [filterSportId, setFilterSportId] = useState<string>("all");
  const [draftFilterVenueId, setDraftFilterVenueId] = useState<string>("all");
  const [draftFilterSportId, setDraftFilterSportId] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [detailCourtId, setDetailCourtId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteCourtId, setDeleteCourtId] = useState<string | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);

  const debouncedKeyword = useDebounce(keyword.trim(), 500);
  const createCourtMutation = useCreateCourt();
  const deleteMultipleCourtsMutation = useDeleteMultipleCourts();
  const deleteCourtMutation = useDeleteCourt();
  const updateCourtMutation = useUpdateCourt();
  const updateTimeSlotMutation = useUpdateTimeSlot();
  const venuesQuery = useVenues({ current: 1, limit: 100, filter: {} });
  const sportsQuery = useSportsList({ current: 1, limit: 100 });
  const courtsQuery = useCourts({
    current,
    limit: pageSize,
    name: debouncedKeyword || undefined,
    venueId: filterVenueId === "all" ? undefined : filterVenueId,
    sportId: filterSportId === "all" ? undefined : filterSportId,
  });
  const detailCourtQuery = useCourtDetail(detailCourtId ?? "", !!detailCourtId);
  const courtTimeSlotsQuery = useTimeSlots({ current: 1, limit: 300, courtId: editingCourt?.id });

  const courts = courtsQuery.data?.items ?? [];
  const isAllSelected = useMemo(
    () => courts.length > 0 && courts.every((item) => selectedIds.includes(item.id)),
    [courts, selectedIds],
  );

  const buildTimeSlotConfig = (values: CourtFormValue) => {
    if (values.slotMode === "manual" && values.manualDate && values.manualStartTime && values.manualEndTime && values.manualPrice !== undefined) {
      return {
        manualSlots: [{ date: values.manualDate, startTime: values.manualStartTime, endTime: values.manualEndTime, price: values.manualPrice }],
      };
    }
    if (
      values.slotMode === "template" &&
      values.templateStartDate &&
      values.templateEndDate &&
      values.templateWeekdays?.length &&
      values.templateStartTime &&
      values.templateEndTime &&
      values.templatePrice !== undefined
    ) {
      return {
        templateGeneration: {
          startDate: values.templateStartDate,
          endDate: values.templateEndDate,
          weekdays: values.templateWeekdays as any,
          startTime: values.templateStartTime,
          endTime: values.templateEndTime,
          price: values.templatePrice,
          createTemplate: values.createTemplate ?? true,
        },
      };
    }
    return undefined;
  };

  const handleCreateCourt = async (values: CourtFormValue) => {
    const payload: any = { venueId: values.venueId, sportId: values.sportId, name: values.name, pricePerHour: values.pricePerHour, imageUrl: values.imageUrl };
    const config = buildTimeSlotConfig(values);
    if (config) payload.timeSlotConfig = config;
    try {
      await createCourtMutation.mutateAsync(payload);
      setFormMode(null);
      courtsQuery.refetch();
    } catch {}
  };

  const handleEditCourt = async (values: CourtFormValue) => {
    if (!editingCourt) return;
    const payload: any = { venueId: values.venueId, sportId: values.sportId, name: values.name, pricePerHour: values.pricePerHour, imageUrl: values.imageUrl };
    const config = buildTimeSlotConfig(values);
    if (config) payload.timeSlotConfig = config;
    try {
      await updateCourtMutation.mutateAsync({ courtId: editingCourt.id, payload });
      setEditingCourt(null);
      setFormMode(null);
      courtsQuery.refetch();
    } catch {}
  };

  const handleAddTimeSlotFromConfig = (values: CourtFormValue) => {
    if (!editingCourt) return;
    const config = buildTimeSlotConfig(values);
    if (!config) return;
    updateCourtMutation.mutate({ courtId: editingCourt.id, payload: { timeSlotConfig: config } });
  };

  const updateExistingTimeSlot = (id: string, payload: UpdateTimeSlotRequest) => {
    updateTimeSlotMutation.mutate({ id, payload });
  };

  const handleDeleteCourt = async () => {
    if (!deleteCourtId) return;
    try {
      await deleteCourtMutation.mutateAsync(deleteCourtId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteCourtId));
      setDeleteCourtId(null);
    } catch {}
  };

  const handleDeleteSelectedCourts = async () => {
    if (!selectedIds.length) return;
    try {
      await deleteMultipleCourtsMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
      setDeleteSelectedOpen(false);
    } catch {}
  };

  useEffect(() => {
    setCurrent(1);
  }, [debouncedKeyword]);

  useEffect(() => {
    setSelectedIds([]);
  }, [current, pageSize, filterVenueId, filterSportId, debouncedKeyword]);

  return (
    <div className="space-y-6">
      <PageHeader title="Manage courts" description="Browse all courts in the system" />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Input placeholder="Search by court name" value={keyword} onChange={(event) => setKeyword(event.target.value)} className="w-full md:max-w-sm" />
        <Button variant="outline" onClick={() => courtsQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraftFilterVenueId(filterVenueId);
            setDraftFilterSportId(filterSportId);
            setIsFilterOpen(true);
          }}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button
          onClick={() => {
            setEditingCourt(null);
            setFormMode("create");
          }}
        >
          Create new
        </Button>
        {selectedIds.length > 0 ? (
          <Button variant="destructive" onClick={() => setDeleteSelectedOpen(true)}>
            Delete selected ({selectedIds.length})
          </Button>
        ) : null}
      </div>

      {courtsQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : courts.length === 0 ? (
        <EmptyState title="No courts found" />
      ) : (
        <div className="surface-card p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds(courts.map((item) => item.id));
                        return;
                      }
                      setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Price/hour</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courts.map((court) => (
                <TableRow key={court.id} className="cursor-pointer" onClick={() => setDetailCourtId(court.id)}>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(court.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedIds((prev) => [...prev, court.id]);
                          return;
                        }
                        setSelectedIds((prev) => prev.filter((id) => id !== court.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{court.name}</TableCell>
                  <TableCell>{court.venue?.name ?? court.venueId.slice(0, 8)}</TableCell>
                  <TableCell>{court.sport?.name ?? court.sportId.slice(0, 8)}</TableCell>
                  <TableCell>{court.pricePerHour.toLocaleString()} VND</TableCell>
                  <TableCell>
                    <Badge
                      variant={getCourtStatusBadgeVariant(court.status)}
                      className={`capitalize ${getCourtStatusBadgeClassName(court.status)}`}
                    >
                      {court.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingCourt(court);
                        setFormMode("edit");
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteCourtId(court.id);
                      }}
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
          currentPage={courtsQuery.data?.current ?? current}
          total={courtsQuery.data?.total ?? 0}
          pageSize={pageSize}
          onChangePage={(value) => {
            setSelectedIds([]);
            setCurrent(value);
          }}
          onChangePageSize={(value) => {
            setCurrent(1);
            setSelectedIds([]);
            setPageSize(value);
          }}
        />
      </Card>

      <CourtFilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        draftFilterVenueId={draftFilterVenueId}
        draftFilterSportId={draftFilterSportId}
        venues={venuesQuery.data?.items ?? []}
        sports={sportsQuery.data?.items ?? []}
        onDraftFilterVenueIdChange={setDraftFilterVenueId}
        onDraftFilterSportIdChange={setDraftFilterSportId}
        onApply={(venueId, sportId) => {
          setCurrent(1);
          setFilterVenueId(venueId);
          setFilterSportId(sportId);
        }}
      />
      <CourtFormDialog
        mode={formMode}
        court={editingCourt}
        venues={venuesQuery.data?.items ?? []}
        sports={sportsQuery.data?.items ?? []}
        courtTimeSlots={courtTimeSlotsQuery.data?.items ?? []}
        isTimeSlotsLoading={courtTimeSlotsQuery.isLoading}
        isSavingTimeSlot={updateCourtMutation.isPending || updateTimeSlotMutation.isPending}
        onUpdateTimeSlot={updateExistingTimeSlot}
        onAddTimeSlotFromConfig={handleAddTimeSlotFromConfig}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setFormMode(null);
            setEditingCourt(null);
          }
        }}
        onCreate={handleCreateCourt}
        onEdit={handleEditCourt}
        isCreating={createCourtMutation.isPending}
        isUpdating={updateCourtMutation.isPending}
      />
      <CourtDetailDialog detailCourtId={detailCourtId} setDetailCourtId={setDetailCourtId} detailCourtQuery={detailCourtQuery} />

      <AlertDialog
        open={!!deleteCourtId}
        onOpenChange={(open) => {
          if (!open) setDeleteCourtId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete court?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The selected court will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourt} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteSelectedOpen} onOpenChange={setDeleteSelectedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected courts?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete {selectedIds.length} selected court(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelectedCourts} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
