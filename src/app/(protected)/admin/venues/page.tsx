"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, RefreshCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

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
import { useDebounce } from "@/hooks/useDebounce";
import { USER_ROLE } from "@/lib/constants/user.constant";
import type { Venue } from "@/types/venue.type";
import { VenueDetailDialog } from "./dialogs/venue-detail-dialog";
import { VenueFilterDialog } from "./dialogs/venue-filter-dialog";
import { VenueFormDialog } from "./dialogs/venue-form-dialog";

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
const getVenueStatusBadgeVariant = (status: string) => {
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

const getVenueStatusBadgeClassName = (status: string) => {
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

export default function AdminVenuesPage() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [filterOwnerId, setFilterOwnerId] = useState<string>("all");
  const [draftFilterOwnerId, setDraftFilterOwnerId] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [detailVenueId, setDetailVenueId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteVenueId, setDeleteVenueId] = useState<string | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const debouncedKeyword = useDebounce(keyword.trim(), 500);

  const createVenueMutation = useCreateVenue();
  const deleteMultipleVenuesMutation = useDeleteMultipleVenues();
  const deleteVenueMutation = useDeleteVenue();
  const updateVenueMutation = useUpdateVenue();
  const usersQuery = useUsersList({ current: 1, limit: 100 });
  const venuesQuery = useVenues({
    current,
    limit: pageSize,
    name: debouncedKeyword || undefined,
    address: debouncedKeyword || undefined,
    ownerId: filterOwnerId === "all" ? undefined : filterOwnerId,
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

  const submit = async (values: CreateVenueForm) => {
    try {
      await createVenueMutation.mutateAsync({
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
      });
      setFormMode(null);
      venuesQuery.refetch();
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const submitEdit = async (values: CreateVenueForm) => {
    if (!editingVenue) return;
    try {
      await updateVenueMutation.mutateAsync({
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
      });
      setEditingVenue(null);
      setFormMode(null);
      venuesQuery.refetch();
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleDeleteVenue = async () => {
    if (!deleteVenueId) return;
    try {
      await deleteVenueMutation.mutateAsync(deleteVenueId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteVenueId));
      setDeleteVenueId(null);
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleDeleteSelectedVenues = async () => {
    if (!selectedIds.length) return;
    try {
      await deleteMultipleVenuesMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
      setDeleteSelectedOpen(false);
    } catch {
      // mutation hook already handles user feedback
    }
  };

  useEffect(() => {
    setCurrent(1);
  }, [debouncedKeyword]);

  useEffect(() => {
    setSelectedIds([]);
  }, [current, pageSize, filterOwnerId, debouncedKeyword]);

  const openCreateVenue = () => {
    setEditingVenue(null);
    setFormMode("create");
  };

  const openEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setFormMode("edit");
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
        <Button onClick={openCreateVenue}>Create new</Button>
        {selectedIds.length > 0 ? (
          <Button variant="destructive" onClick={() => setDeleteSelectedOpen(true)}>
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
                  <TableCell>
                    <Badge
                      variant={getVenueStatusBadgeVariant(venue.status)}
                      className={`capitalize ${getVenueStatusBadgeClassName(venue.status)}`}
                    >
                      {venue.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditVenue(venue);
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
                        setDeleteVenueId(venue.id);
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
          currentPage={venuesQuery.data?.current ?? current}
          total={venuesQuery.data?.total ?? 0}
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

      <VenueFilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        draftOwnerId={draftFilterOwnerId}
        onDraftOwnerIdChange={setDraftFilterOwnerId}
        ownerOptions={ownerOptions}
        onApply={(ownerId) => {
          setCurrent(1);
          setFilterOwnerId(ownerId);
        }}
      />
      <VenueFormDialog
        mode={formMode}
        venue={editingVenue}
        ownerOptions={ownerOptions}
        onOpenChange={(open) => {
          if (!open) {
            setFormMode(null);
            setEditingVenue(null);
          }
        }}
        onCreate={submit}
        onEdit={submitEdit}
        isCreating={createVenueMutation.isPending}
        isUpdating={updateVenueMutation.isPending}
      />
      <VenueDetailDialog
        detailVenueId={detailVenueId}
        setDetailVenueId={setDetailVenueId}
        detailVenueQuery={detailVenueQuery}
      />

      <AlertDialog
        open={!!deleteVenueId}
        onOpenChange={(open) => {
          if (!open) setDeleteVenueId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete venue?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected venue will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVenue}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteSelectedOpen} onOpenChange={setDeleteSelectedOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected venues?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete {selectedIds.length} selected venue(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedVenues}
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
