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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMe } from "@/hooks/useUser";
import {
  useCreateVenue,
  useDeleteMultipleVenues,
  useDeleteVenue,
  useUpdateVenue,
  useVenueDetail,
  useVenues,
} from "@/hooks/useVenue";
import type { Venue } from "@/types/venue.type";
import { OwnerVenuesDialogs } from "./dialogs";

const createVenueSchema = z.object({
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

export default function OwnerVenuesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [filterAddress, setFilterAddress] = useState("");
  const [draftFilterAddress, setDraftFilterAddress] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [detailVenueId, setDetailVenueId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const meQuery = useMe();
  const ownerId = meQuery.data?.id;
  const createVenueMutation = useCreateVenue();
  const deleteMultipleVenuesMutation = useDeleteMultipleVenues();
  const deleteVenueMutation = useDeleteVenue();
  const updateVenueMutation = useUpdateVenue();
  const venuesQuery = useVenues({
    current: page,
    limit,
    ownerId,
    name: search || undefined,
    address: filterAddress || search || undefined,
  });
  const detailVenueQuery = useVenueDetail(detailVenueId ?? "", !!detailVenueId);

  const venues = useMemo(() => venuesQuery.data?.items ?? [], [venuesQuery.data?.items]);
  const isAllSelected = useMemo(
    () => venues.length > 0 && venues.every((item) => selectedIds.includes(item.id)),
    [venues, selectedIds],
  );
  const form = useForm<CreateVenueForm>({
    resolver: zodResolver(createVenueSchema as any),
    defaultValues: {
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
    if (!ownerId) return;
    createVenueMutation.mutate(
      {
        ownerId,
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
    if (!editingVenue || !ownerId) return;
    updateVenueMutation.mutate(
      {
        venueId: editingVenue.id,
        payload: {
          ownerId,
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
      <PageHeader
        title="Manage venues"
        description="All venues owned by your account"
      />

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
            setDraftFilterAddress(filterAddress);
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
        <EmptyState title="No venues found" description="Create your first venue to start operating." />
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
                <TableHead>Address</TableHead>
                <TableHead>Operating</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {venues.map((venue) => (
                <TableRow key={venue.id} className="cursor-pointer" onClick={() => setDetailVenueId(venue.id)}>
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
                  <TableCell>{venue.address}</TableCell>
                  <TableCell>
                    {venue.operatingHours?.startTime} - {venue.operatingHours?.endTime}
                  </TableCell>
                  <TableCell>{venue.contactInfo?.phone ?? "-"}</TableCell>
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

      <OwnerVenuesDialogs
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        draftFilterAddress={draftFilterAddress}
        setDraftFilterAddress={setDraftFilterAddress}
        setFilterAddress={setFilterAddress}
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
