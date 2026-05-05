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
  useCreateVenue,
  useDeleteMultipleVenues,
  useDeleteVenue,
  useUpdateVenue,
  useVenueDetail,
  useVenues,
} from "@/hooks/useVenue";
import { useUsersList } from "@/hooks/useUser";
import { USER_ROLE } from "@/lib/constants/user.constant";
import type { Venue } from "@/types/venue.type";
import { AdminVenuesDialogs } from "./dialogs";

const createVenueSchema = z.object({
  ownerId: z.string().min(1, "Owner is required"),
  name: z.string().min(2, "Venue name is required"),
  address: z.string().min(3, "Address is required"),
  description: z.string().min(3, "Description is required"),
  imageUrl: z.union([z.string().url("Invalid image URL"), z.literal("")]),
  startTime: z.string().min(4, "Start time is required"),
  endTime: z.string().min(4, "End time is required"),
  phone: z.string().min(7, "Phone is required"),
  email: z.string().email("Invalid email"),
});

type CreateVenueForm = z.infer<typeof createVenueSchema>;

export default function AdminVenuesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [filterOwnerId, setFilterOwnerId] = useState<string>("all");
  const [draftFilterOwnerId, setDraftFilterOwnerId] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [detailVenueId, setDetailVenueId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const createVenueMutation = useCreateVenue();
  const deleteMultipleVenuesMutation = useDeleteMultipleVenues();
  const deleteVenueMutation = useDeleteVenue();
  const updateVenueMutation = useUpdateVenue();
  const usersQuery = useUsersList({ current: 1, limit: 100 });
  const venuesQuery = useVenues({
    current: page,
    limit,
    filter: {
      name: search || undefined,
      address: search || undefined,
      ownerId: filterOwnerId === "all" ? undefined : filterOwnerId,
    },
  });
  const detailVenueQuery = useVenueDetail(detailVenueId ?? "", !!detailVenueId);

  const ownerOptions = useMemo(
    () =>
      (usersQuery.data?.items ?? []).filter(
        (user) => user.role === USER_ROLE.OWNER || user.role === USER_ROLE.ADMIN,
      ),
    [usersQuery.data?.items],
  );
  const venues = venuesQuery.data?.items ?? [];
  const isAllSelected = venues.length > 0 && venues.every((item) => selectedIds.includes(item.id));

  const form = useForm<CreateVenueForm>({
    resolver: zodResolver(createVenueSchema as any),
    defaultValues: {
      ownerId: "",
      name: "",
      address: "",
      description: "",
      imageUrl: "",
      startTime: "06:00",
      endTime: "22:00",
      phone: "",
      email: "",
    },
  });
  const editForm = useForm<CreateVenueForm>({
    resolver: zodResolver(createVenueSchema as any),
    defaultValues: {
      ownerId: "",
      name: "",
      address: "",
      description: "",
      imageUrl: "",
      startTime: "06:00",
      endTime: "22:00",
      phone: "",
      email: "",
    },
  });

  const submit = (values: CreateVenueForm) => {
    createVenueMutation.mutate(
      {
        ownerId: values.ownerId,
        name: values.name,
        address: values.address,
        description: values.description,
        imageUrl: values.imageUrl || undefined,
        operatingHours: {
          startTime: values.startTime,
          endTime: values.endTime,
        },
        contactInfo: {
          phone: values.phone,
          email: values.email,
        },
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          form.reset();
        },
      },
    );
  };

  const submitEdit = (values: CreateVenueForm) => {
    if (!editingVenue) return;
    updateVenueMutation.mutate(
      {
        venueId: editingVenue.id,
        payload: {
          ownerId: values.ownerId,
          name: values.name,
          address: values.address,
          description: values.description,
          imageUrl: values.imageUrl || undefined,
          operatingHours: {
            startTime: values.startTime,
            endTime: values.endTime,
          },
          contactInfo: {
            phone: values.phone,
            email: values.email,
          },
        },
      },
      {
        onSuccess: () => {
          setEditingVenue(null);
          editForm.reset();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manage venues" description="Browse all venues in the system" />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Input
          placeholder="Search by venue name or address"
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
        <Button variant="outline" onClick={() => venuesQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraftFilterOwnerId(filterOwnerId);
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
              deleteMultipleVenuesMutation.mutate(selectedIds, {
                onSuccess: () => setSelectedIds([]),
              });
            }}
          >
            Delete selected ({selectedIds.length})
          </Button>
        ) : null}
      </div>

      {venuesQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : venues.length === 0 ? (
        <EmptyState title="No venues found" />
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
                        setSelectedIds(venues.map((item) => item.id));
                        return;
                      }
                      setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Operating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => (
                <TableRow
                  key={venue.id}
                  className="cursor-pointer"
                  onClick={() => setDetailVenueId(venue.id)}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(venue.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedIds((prev) => [...prev, venue.id]);
                          return;
                        }
                        setSelectedIds((prev) => prev.filter((id) => id !== venue.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{venue.name}</TableCell>
                  <TableCell>{venue.owner?.fullName ?? venue.ownerId.slice(0, 8)}</TableCell>
                  <TableCell>{venue.address}</TableCell>
                  <TableCell>
                    {venue.operatingHours?.startTime} - {venue.operatingHours?.endTime}
                  </TableCell>
                  <TableCell>{venue.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingVenue(venue);
                        editForm.reset({
                          ownerId: venue.ownerId,
                          name: venue.name,
                          address: venue.address,
                          description: venue.description,
                          imageUrl: venue.imageUrl ?? "",
                          startTime: venue.operatingHours?.startTime ?? "06:00",
                          endTime: venue.operatingHours?.endTime ?? "22:00",
                          phone: venue.contactInfo?.phone ?? "",
                          email: venue.contactInfo?.email ?? "",
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
                        deleteVenueMutation.mutate(venue.id);
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
          currentPage={venuesQuery.data?.current ?? page}
          total={venuesQuery.data?.total ?? 0}
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

      <AdminVenuesDialogs
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        draftFilterOwnerId={draftFilterOwnerId}
        setDraftFilterOwnerId={setDraftFilterOwnerId}
        setFilterOwnerId={setFilterOwnerId}
        ownerOptions={ownerOptions}
        setPage={setPage}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        form={form}
        submit={submit}
        createVenueMutation={createVenueMutation}
        editingVenue={editingVenue}
        setEditingVenue={setEditingVenue}
        editForm={editForm}
        submitEdit={submitEdit}
        updateVenueMutation={updateVenueMutation}
        detailVenueId={detailVenueId}
        setDetailVenueId={setDetailVenueId}
        detailVenueQuery={detailVenueQuery}
      />
    </div>
  );
}
