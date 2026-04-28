"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const createVenueSchema = z.object({
  name: z.string().min(2, "Venue name is required"),
  address: z.string().min(3, "Address is required"),
  description: z.string().min(3, "Description is required"),
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
    filter: {
      ownerId,
      name: search || undefined,
      address: filterAddress || search || undefined,
    },
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Pagination
          current={venuesQuery.data?.current ?? page}
          totalPages={venuesQuery.data?.totalPages ?? 1}
          onChange={(value) => {
            setSelectedIds([]);
            setPage(value);
          }}
        />
        <div className="flex items-center gap-2">
          <Select
            value={String(page)}
            onValueChange={(value) => {
              setSelectedIds([]);
              setPage(Number(value));
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Page" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: venuesQuery.data?.totalPages ?? 1 }).map((_, index) => {
                const value = index + 1;
                return (
                  <SelectItem key={value} value={String(value)}>
                    Page {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setPage(1);
              setSelectedIds([]);
              setLimit(Number(value));
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((item) => (
                <SelectItem key={item} value={String(item)}>
                  {item} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter venues</DialogTitle>
            <DialogDescription>Apply backend filter for venue address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm font-medium">Address contains</div>
            <Input
              value={draftFilterAddress}
              onChange={(event) => setDraftFilterAddress(event.target.value)}
              placeholder="District, street..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDraftFilterAddress("");
                setFilterAddress("");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setFilterAddress(draftFilterAddress.trim());
                setIsFilterOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create venue</DialogTitle>
            <DialogDescription>Add a new venue for your owner account.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open time</FormLabel>
                    <FormControl>
                      <Input placeholder="06:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Close time</FormLabel>
                    <FormControl>
                      <Input placeholder="22:00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={createVenueMutation.isPending}>
                  {createVenueMutation.isPending ? "Creating..." : "Create venue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingVenue}
        onOpenChange={(open) => {
          if (!open) {
            setEditingVenue(null);
            editForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit venue</DialogTitle>
            <DialogDescription>Update venue information and operating details.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={editForm.handleSubmit(submitEdit)}>
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open time</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Close time</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={updateVenueMutation.isPending}>
                  {updateVenueMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">ID:</span> {detailVenueQuery.data.id}</div>
              <div><span className="font-medium">Name:</span> {detailVenueQuery.data.name}</div>
              <div><span className="font-medium">Address:</span> {detailVenueQuery.data.address}</div>
              <div><span className="font-medium">Description:</span> {detailVenueQuery.data.description}</div>
              <div><span className="font-medium">Owner ID:</span> {detailVenueQuery.data.ownerId}</div>
              <div>
                <span className="font-medium">Operating:</span>{" "}
                {detailVenueQuery.data.operatingHours?.startTime} - {detailVenueQuery.data.operatingHours?.endTime}
              </div>
              <div><span className="font-medium">Phone:</span> {detailVenueQuery.data.contactInfo?.phone ?? "-"}</div>
              <div><span className="font-medium">Email:</span> {detailVenueQuery.data.contactInfo?.email ?? "-"}</div>
            </div>
          ) : (
            <EmptyState title="No detail found" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
