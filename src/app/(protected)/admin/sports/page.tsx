"use client";

import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
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
import {
  useCreateSport,
  useDeleteMultipleSports,
  useDeleteSport,
  useSportDetail,
  useSports,
  useUpdateSport,
} from "@/hooks/useSport";
import type { Sport } from "@/types/sport.type";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const createSportSchema = z.object({
  name: z.string().min(2, "Sport name is required"),
  description: z.string().optional(),
});

type CreateSportForm = z.infer<typeof createSportSchema>;

export default function AdminSportsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [filterName, setFilterName] = useState("");
  const [draftFilterName, setDraftFilterName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailSportId, setDetailSportId] = useState<string | null>(null);
  const sportsQuery = useSports({
    current: page,
    limit,
    name: filterName || search || undefined,
  });
  const createSportMutation = useCreateSport();
  const deleteMultipleSportsMutation = useDeleteMultipleSports();
  const updateSportMutation = useUpdateSport();
  const deleteSportMutation = useDeleteSport();
  const sportDetailQuery = useSportDetail(detailSportId ?? "", !!detailSportId);
  const pageItems = sportsQuery.data?.items ?? [];
  const isAllSelected = pageItems.length > 0 && pageItems.every((item) => selectedIds.includes(item.id));

  const form = useForm<CreateSportForm>({
    resolver: zodResolver(createSportSchema as any),
    defaultValues: {
      name: "",
      description: "",
    },
  });
  const editForm = useForm<CreateSportForm>({
    resolver: zodResolver(createSportSchema as any),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const submit = (values: CreateSportForm) => {
    createSportMutation.mutate(values, {
      onSuccess: () => form.reset(),
    });
  };
  const submitEdit = (values: CreateSportForm) => {
    if (!editingSport) return;
    updateSportMutation.mutate(
      {
        sportId: editingSport.id,
        payload: values,
      },
      {
        onSuccess: () => {
          setEditingSport(null);
          editForm.reset();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manage sports" description="Create and remove sport types" />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Input
          placeholder="Search by sport name"
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
        <Button variant="outline" onClick={() => sportsQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraftFilterName(filterName);
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
              deleteMultipleSportsMutation.mutate(selectedIds, {
                onSuccess: () => setSelectedIds([]),
              });
            }}
          >
            Delete selected ({selectedIds.length})
          </Button>
        ) : null}
      </div>

      {sportsQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : (sportsQuery.data?.items?.length ?? 0) === 0 ? (
        <EmptyState title="No sports found" />
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
                        setSelectedIds(pageItems.map((item) => item.id));
                        return;
                      }
                      setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sportsQuery.data?.items ?? []).map((sport) => (
                <TableRow key={sport.id} className="cursor-pointer" onClick={() => setDetailSportId(sport.id)}>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(sport.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedIds((prev) => [...prev, sport.id]);
                          return;
                        }
                        setSelectedIds((prev) => prev.filter((id) => id !== sport.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{sport.name}</TableCell>
                  <TableCell className="text-muted-foreground">{sport.description ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingSport(sport);
                        editForm.reset({
                          name: sport.name,
                          description: sport.description ?? "",
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
                        deleteSportMutation.mutate(sport.id);
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
          current={sportsQuery.data?.current ?? page}
          totalPages={sportsQuery.data?.totalPages ?? 1}
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
              {Array.from({ length: sportsQuery.data?.totalPages ?? 1 }).map((_, index) => {
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
            <DialogTitle>Filter sports</DialogTitle>
            <DialogDescription>Apply backend filter by sport name.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm font-medium">Name contains</div>
            <Input
              value={draftFilterName}
              onChange={(event) => setDraftFilterName(event.target.value)}
              placeholder="e.g. Football"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDraftFilterName("");
                setFilterName("");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setFilterName(draftFilterName.trim());
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
            <DialogTitle>Create sport</DialogTitle>
            <DialogDescription>Add a new sport type.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Football" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Optional description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createSportMutation.isPending}>
                  {createSportMutation.isPending ? "Creating..." : "Create sport"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingSport}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSport(null);
            editForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit sport</DialogTitle>
            <DialogDescription>Update sport name and description.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="space-y-4" onSubmit={editForm.handleSubmit(submitEdit)}>
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateSportMutation.isPending}>
                  {updateSportMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
              <div><span className="font-medium">ID:</span> {sportDetailQuery.data.id}</div>
              <div><span className="font-medium">Name:</span> {sportDetailQuery.data.name}</div>
              <div><span className="font-medium">Description:</span> {sportDetailQuery.data.description ?? "-"}</div>
            </div>
          ) : (
            <EmptyState title="No detail found" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
