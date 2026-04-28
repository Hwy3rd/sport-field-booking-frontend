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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useCourtDetail,
  useCourts,
  useCreateCourt,
  useDeleteCourt,
  useDeleteMultipleCourts,
  useUpdateCourt,
} from "@/hooks/useCourt";
import { useSports } from "@/hooks/useSport";
import { useMe } from "@/hooks/useUser";
import { useVenues } from "@/hooks/useVenue";
import type { Court } from "@/types/court.type";

const createCourtSchema = z.object({
  venueId: z.string().min(1, "Venue is required"),
  sportId: z.string().min(1, "Sport is required"),
  name: z.string().min(2, "Court name is required"),
  pricePerHour: z.coerce.number().min(0, "Price must be non-negative"),
  imageUrl: z.string().optional(),
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

  const venuesQuery = useVenues({
    current: 1,
    limit: 100,
    filter: { ownerId },
  });
  const sportsQuery = useSports({ current: 1, limit: 100 });
  const courtsQuery = useCourts({
    current: page,
    limit,
    name: search || undefined,
    venueId: filterVenueId === "all" ? undefined : filterVenueId,
    sportId: filterSportId === "all" ? undefined : filterSportId,
  });
  const detailCourtQuery = useCourtDetail(detailCourtId ?? "", !!detailCourtId);

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
    },
  });

  const submit = (values: CreateCourtForm) => {
    createCourtMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      },
    });
  };

  const submitEdit = (values: CreateCourtForm) => {
    if (!editingCourt) return;
    updateCourtMutation.mutate(
      {
        courtId: editingCourt.id,
        payload: values,
      },
      {
        onSuccess: () => {
          setEditingCourt(null);
          editForm.reset();
        },
      },
    );
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
        <EmptyState title="No courts found" description="Create courts in your venues to start bookings." />
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Pagination
          current={courtsQuery.data?.current ?? page}
          totalPages={courtsQuery.data?.totalPages ?? 1}
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
              {Array.from({ length: courtsQuery.data?.totalPages ?? 1 }).map((_, index) => {
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
            <DialogTitle>Filter courts</DialogTitle>
            <DialogDescription>Apply backend filters by venue and sport.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Venue</div>
              <Select value={draftFilterVenueId} onValueChange={setDraftFilterVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All venues</SelectItem>
                  {(venuesQuery.data?.items ?? []).map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Sport</div>
              <Select value={draftFilterSportId} onValueChange={setDraftFilterSportId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sports</SelectItem>
                  {(sportsQuery.data?.items ?? []).map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDraftFilterVenueId("all");
                setDraftFilterSportId("all");
                setFilterVenueId("all");
                setFilterSportId("all");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setFilterVenueId(draftFilterVenueId);
                setFilterSportId(draftFilterSportId);
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
            <DialogTitle>Create court</DialogTitle>
            <DialogDescription>Add a new court in your venues.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="venueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(venuesQuery.data?.items ?? []).map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(sportsQuery.data?.items ?? []).map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="pricePerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per hour</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={createCourtMutation.isPending}>
                  {createCourtMutation.isPending ? "Creating..." : "Create court"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingCourt}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCourt(null);
            editForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit court</DialogTitle>
            <DialogDescription>Update court details, pricing and relationships.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={editForm.handleSubmit(submitEdit)}>
              <FormField
                control={editForm.control}
                name="venueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(venuesQuery.data?.items ?? []).map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="sportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(sportsQuery.data?.items ?? []).map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="pricePerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per hour</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Image URL (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={updateCourtMutation.isPending}>
                  {updateCourtMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailCourtId} onOpenChange={(open) => !open && setDetailCourtId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Court detail</DialogTitle>
            <DialogDescription>Data loaded from court detail API.</DialogDescription>
          </DialogHeader>
          {detailCourtQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : detailCourtQuery.data ? (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">ID:</span> {detailCourtQuery.data.id}</div>
              <div><span className="font-medium">Name:</span> {detailCourtQuery.data.name}</div>
              <div><span className="font-medium">Venue:</span> {detailCourtQuery.data.venue?.name ?? detailCourtQuery.data.venueId}</div>
              <div><span className="font-medium">Sport:</span> {detailCourtQuery.data.sport?.name ?? detailCourtQuery.data.sportId}</div>
              <div><span className="font-medium">Price/hour:</span> {detailCourtQuery.data.pricePerHour.toLocaleString()} VND</div>
              <div><span className="font-medium">Status:</span> {detailCourtQuery.data.status}</div>
            </div>
          ) : (
            <EmptyState title="No detail found" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
