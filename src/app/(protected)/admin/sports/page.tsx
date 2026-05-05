"use client";

import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
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
  useCreateSport,
  useDeleteMultipleSports,
  useDeleteSport,
  useSportDetail,
  useSportsList,
  useUpdateSport,
} from "@/hooks/useSport";
import type { Sport } from "@/types/sport.type";
import { TablePagination } from "@/components/shared/table-pagination";
import { Card } from "@/components/ui/card";
import { SportsDialogs } from "./dialogs";

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
  const sportsQuery = useSportsList({
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
  const isAllSelected =
    pageItems.length > 0 && pageItems.every((item: Sport) => selectedIds.includes(item.id));

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
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      },
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
                        setSelectedIds(pageItems.map((item: Sport) => item.id));
                        return;
                      }
                      setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(sportsQuery.data?.items ?? []).map((sport: Sport) => (
                <TableRow
                  key={sport.id}
                  className="cursor-pointer"
                  onClick={() => setDetailSportId(sport.id)}
                >
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
                  <TableCell className="text-muted-foreground">
                    {sport.description ?? "-"}
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

      <Card className="flex flex-wrap items-center justify-end gap-2 p-2">
        <TablePagination
          currentPage={sportsQuery.data?.current ?? page}
          total={sportsQuery.data?.total ?? 0}
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

      <SportsDialogs
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        draftFilterName={draftFilterName}
        setDraftFilterName={setDraftFilterName}
        setFilterName={setFilterName}
        setPage={setPage}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        form={form}
        submit={submit}
        createSportMutation={createSportMutation as any}
        editingSport={editingSport}
        setEditingSport={setEditingSport}
        editForm={editForm}
        submitEdit={submitEdit}
        updateSportMutation={updateSportMutation as any}
        detailSportId={detailSportId}
        setDetailSportId={setDetailSportId}
        sportDetailQuery={sportDetailQuery}
      />
    </div>
  );
}
