"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
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
import {
  useCourtDetail,
  useCourts,
  useCreateCourt,
  useDeleteCourt,
  useDeleteMultipleCourts,
  useUpdateCourt,
} from "@/hooks/useCourt";
import { useTimeSlots, useUpdateTimeSlot } from "@/hooks/useTimeSlot";
import { useSportsList } from "@/hooks/useSport";
import { useMe } from "@/hooks/useUser";
import { useVenues } from "@/hooks/useVenue";
import type { Court } from "@/types/court.type";
import type { UpdateTimeSlotRequest } from "@/types/time-slot.type";
import { OwnerCourtsDialogs } from "./dialogs";

const createCourtSchema = z.object({
  venueId: z.string().min(1, "Venue is required"),
  sportId: z.string().min(1, "Sport is required"),
  name: z.string().min(2, "Court name is required"),
  pricePerHour: z.coerce.number().min(0, "Price must be non-negative"),
  imageUrl: z.string().optional(),
  slotMode: z.enum(["none", "manual", "template"]).optional(),
  manualDate: z.string().optional(),
  manualStartTime: z.string().optional(),
  manualEndTime: z.string().optional(),
  manualPrice: z.coerce.number().optional(),
  templateStartDate: z.string().optional(),
  templateEndDate: z.string().optional(),
  templateWeekdays: z.array(z.coerce.number()).optional(),
  templateStartTime: z.string().optional(),
  templateEndTime: z.string().optional(),
  templatePrice: z.coerce.number().optional(),
  createTemplate: z.boolean().optional(),
});

type CreateCourtForm = z.infer<typeof createCourtSchema>;

export default function OwnerCourtsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [filterVenueId, setFilterVenueId] = useState<string>("all");
  const [filterSportId, setFilterSportId] = useState<string>("all");
  const [draftFilterVenueId, setDraftFilterVenueId] = useState<string>("all");
  const [draftFilterSportId, setDraftFilterSportId] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [detailCourtId, setDetailCourtId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const meQuery = useMe();
  const ownerId = meQuery.data?.id;
  const createCourtMutation = useCreateCourt();
  const deleteMultipleCourtsMutation = useDeleteMultipleCourts();
  const deleteCourtMutation = useDeleteCourt();
  const updateCourtMutation = useUpdateCourt();
  const updateTimeSlotMutation = useUpdateTimeSlot();

  const venuesQuery = useVenues({
    current: 1,
    limit: 100,
    filter: { ownerId },
  });
  const sportsQuery = useSportsList({ current: 1, limit: 100 });
  const courtsQuery = useCourts({
    current: page,
    limit,
    name: search || undefined,
    venueId: filterVenueId === "all" ? undefined : filterVenueId,
    sportId: filterSportId === "all" ? undefined : filterSportId,
  });
  const detailCourtQuery = useCourtDetail(detailCourtId ?? "", !!detailCourtId);
  const courtTimeSlotsQuery = useTimeSlots({
    current: 1,
    limit: 300,
    courtId: editingCourt?.id,
  });

  const ownerVenueIds = useMemo(
    () => new Set((venuesQuery.data?.items ?? []).map((item) => item.id)),
    [venuesQuery.data?.items],
  );
  const ownerCourts = useMemo(
    () => (courtsQuery.data?.items ?? []).filter((court) => ownerVenueIds.has(court.venueId)),
    [courtsQuery.data?.items, ownerVenueIds],
  );
  const isAllSelected = useMemo(
    () => ownerCourts.length > 0 && ownerCourts.every((item) => selectedIds.includes(item.id)),
    [ownerCourts, selectedIds],
  );

  const form = useForm<CreateCourtForm>({
    resolver: zodResolver(createCourtSchema as any),
    defaultValues: {
      venueId: "",
      sportId: "",
      name: "",
      pricePerHour: 100000,
      imageUrl: "",
      slotMode: "none",
    },
  });
  const editForm = useForm<CreateCourtForm>({
    resolver: zodResolver(createCourtSchema as any),
    defaultValues: {
      venueId: "",
      sportId: "",
      name: "",
      pricePerHour: 100000,
      imageUrl: "",
      slotMode: "none",
      manualDate: "",
      manualStartTime: "06:00",
      manualEndTime: "07:00",
      manualPrice: 100000,
      templateStartDate: "",
      templateEndDate: "",
      templateWeekdays: [],
      templateStartTime: "06:00",
      templateEndTime: "07:00",
      templatePrice: 100000,
      createTemplate: true,
    },
  });

  const buildTimeSlotConfig = (values: CreateCourtForm) => {
    if (
      values.slotMode === "manual" &&
      values.manualDate &&
      values.manualStartTime &&
      values.manualEndTime &&
      values.manualPrice !== undefined
    ) {
      return {
        manualSlots: [
          {
            date: values.manualDate,
            startTime: values.manualStartTime,
            endTime: values.manualEndTime,
            price: values.manualPrice,
          },
        ],
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

  const submit = (values: CreateCourtForm) => {
    const payload: any = {
      venueId: values.venueId,
      sportId: values.sportId,
      name: values.name,
      pricePerHour: values.pricePerHour,
      imageUrl: values.imageUrl,
    };
    const config = buildTimeSlotConfig(values);
    if (config) payload.timeSlotConfig = config;
    createCourtMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      },
    });
  };

  const submitEdit = (values: CreateCourtForm) => {
    if (!editingCourt) return;
    const payload: any = {
      venueId: values.venueId,
      sportId: values.sportId,
      name: values.name,
      pricePerHour: values.pricePerHour,
      imageUrl: values.imageUrl,
    };
    const config = buildTimeSlotConfig(values);
    if (config) payload.timeSlotConfig = config;
    updateCourtMutation.mutate(
      {
        courtId: editingCourt.id,
        payload,
      },
      {
        onSuccess: () => {
          setEditingCourt(null);
          editForm.reset();
        },
      },
    );
  };

  const addTimeSlotFromConfig = () => {
    if (!editingCourt) return;
    const config = buildTimeSlotConfig(editForm.getValues());
    if (!config) return;
    updateCourtMutation.mutate({
      courtId: editingCourt.id,
      payload: { timeSlotConfig: config } as any,
    });
  };

  const updateExistingTimeSlot = (id: string, payload: UpdateTimeSlotRequest) => {
    updateTimeSlotMutation.mutate({ id, payload });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manage courts" description="Courts that belong to your venues" />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Input
          placeholder="Search by court name"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="w-full md:max-w-sm"
        />
        <Button
          onClick={() => {
            setPage(1);
            setSearch(keyword.trim());
          }}
        >
          Search
        </Button>
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
        <Button onClick={() => setIsCreateOpen(true)}>Create new</Button>
        {selectedIds.length > 0 ? (
          <Button
            variant="destructive"
            onClick={() => {
              deleteMultipleCourtsMutation.mutate(selectedIds, {
                onSuccess: () => setSelectedIds([]),
              });
            }}
          >
            Delete selected ({selectedIds.length})
          </Button>
        ) : null}
      </div>

      {courtsQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : ownerCourts.length === 0 ? (
        <EmptyState
          title="No courts found"
          description="Create courts in your venues to start bookings."
        />
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
                        setSelectedIds(ownerCourts.map((item) => item.id));
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
              {ownerCourts.map((court) => (
                <TableRow
                  key={court.id}
                  className="cursor-pointer"
                  onClick={() => setDetailCourtId(court.id)}
                >
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
                  <TableCell>{court.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingCourt(court);
                        editForm.reset({
                          venueId: court.venueId,
                          sportId: court.sportId,
                          name: court.name,
                          pricePerHour: court.pricePerHour,
                          imageUrl: court.imageUrl ?? "",
                          slotMode: "none",
                          manualDate: "",
                          manualStartTime: "06:00",
                          manualEndTime: "07:00",
                          manualPrice: court.pricePerHour,
                          templateStartDate: "",
                          templateEndDate: "",
                          templateWeekdays: [],
                          templateStartTime: "06:00",
                          templateEndTime: "07:00",
                          templatePrice: court.pricePerHour,
                          createTemplate: true,
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteCourtMutation.mutate(court.id);
                      }}
                    >
                      Delete
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
          currentPage={courtsQuery.data?.current ?? page}
          total={courtsQuery.data?.total ?? 0}
          pageSize={limit}
          onChangePage={(value) => {
            setSelectedIds([]);
            setPage(value);
          }}
          onChangePageSize={(value) => {
            setPage(1);
            setSelectedIds([]);
            setLimit(value);
          }}
        />
      </Card>

      <OwnerCourtsDialogs
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        draftFilterVenueId={draftFilterVenueId}
        setDraftFilterVenueId={setDraftFilterVenueId}
        draftFilterSportId={draftFilterSportId}
        setDraftFilterSportId={setDraftFilterSportId}
        venues={venuesQuery.data?.items ?? []}
        sports={sportsQuery.data?.items ?? []}
        setFilterVenueId={setFilterVenueId}
        setFilterSportId={setFilterSportId}
        setPage={setPage}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        form={form}
        submit={submit}
        createCourtMutation={createCourtMutation}
        editingCourt={editingCourt}
        setEditingCourt={setEditingCourt}
        editForm={editForm}
        submitEdit={submitEdit}
        updateCourtMutation={updateCourtMutation}
        detailCourtId={detailCourtId}
        setDetailCourtId={setDetailCourtId}
        detailCourtQuery={detailCourtQuery}
        courtTimeSlots={(courtTimeSlotsQuery.data?.items ?? []).filter((slot) =>
          ownerCourts.some((court) => court.id === slot.courtId),
        )}
        isTimeSlotsLoading={courtTimeSlotsQuery.isLoading}
        onAddTimeSlotFromConfig={addTimeSlotFromConfig}
        onUpdateTimeSlot={updateExistingTimeSlot}
        isSavingTimeSlot={
          updateCourtMutation.isPending || updateTimeSlotMutation.isPending
        }
      />
    </div>
  );
}
