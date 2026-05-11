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
  useCreateSport,
  useDeleteMultipleSports,
  useDeleteSport,
  useSportDetail,
  useSportsList,
  useUpdateSport,
} from "@/hooks/useSport";
import { useDebounce } from "@/hooks/useDebounce";
import type { Sport } from "@/types/sport.type";
import { SportDetailDialog } from "./dialogs/sport-detail-dialog";
import { SportFilterDialog } from "./dialogs/sport-filter-dialog";
import { SportFormDialog } from "./dialogs/sport-form-dialog";

export default function AdminSportsPage() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [filterName, setFilterName] = useState("");
  const [draftFilterName, setDraftFilterName] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteSportId, setDeleteSportId] = useState<string | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [detailSportId, setDetailSportId] = useState<string | null>(null);
  const debouncedKeyword = useDebounce(keyword.trim(), 500);
  const sportsQuery = useSportsList({
    current,
    limit: pageSize,
    name: filterName || debouncedKeyword || undefined,
  });
  const createSportMutation = useCreateSport();
  const deleteMultipleSportsMutation = useDeleteMultipleSports();
  const updateSportMutation = useUpdateSport();
  const deleteSportMutation = useDeleteSport();
  const sportDetailQuery = useSportDetail(detailSportId ?? "", !!detailSportId);
  const pageItems = sportsQuery.data?.items ?? [];
  const isAllSelected = useMemo(
    () => pageItems.length > 0 && pageItems.every((item: Sport) => selectedIds.includes(item.id)),
    [pageItems, selectedIds],
  );

  const submit = async (values: { name: string; description?: string }) => {
    try {
      await createSportMutation.mutateAsync(values);
      setFormMode(null);
      sportsQuery.refetch();
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const submitEdit = async (values: { name: string; description?: string }) => {
    if (!editingSport) return;
    try {
      await updateSportMutation.mutateAsync({
        sportId: editingSport.id,
        payload: values,
      });
      setEditingSport(null);
      setFormMode(null);
      sportsQuery.refetch();
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleDeleteSport = async () => {
    if (!deleteSportId) return;
    try {
      await deleteSportMutation.mutateAsync(deleteSportId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteSportId));
      setDeleteSportId(null);
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleDeleteSelectedSports = async () => {
    if (!selectedIds.length) return;
    try {
      await deleteMultipleSportsMutation.mutateAsync(selectedIds);
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
  }, [current, pageSize, filterName, debouncedKeyword]);

  const openCreateSport = () => {
    setEditingSport(null);
    setFormMode("create");
  };

  const openEditSport = (sport: Sport) => {
    setEditingSport(sport);
    setFormMode("edit");
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
        <Button onClick={openCreateSport}>Create new</Button>
        {selectedIds.length > 0 ? (
          <Button variant="destructive" onClick={() => setDeleteSelectedOpen(true)}>
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
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditSport(sport);
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
                        setDeleteSportId(sport.id);
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
          currentPage={sportsQuery.data?.current ?? current}
          total={sportsQuery.data?.total ?? 0}
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

      <SportFilterDialog
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        draftFilterName={draftFilterName}
        onDraftFilterNameChange={setDraftFilterName}
        onApply={(nextName) => {
          setCurrent(1);
          setFilterName(nextName);
        }}
      />
      <SportFormDialog
        mode={formMode}
        sport={editingSport}
        onOpenChange={(open) => {
          if (!open) {
            setFormMode(null);
            setEditingSport(null);
          }
        }}
        onCreate={submit}
        onEdit={submitEdit}
        isCreating={createSportMutation.isPending}
        isUpdating={updateSportMutation.isPending}
      />
      <SportDetailDialog
        detailSportId={detailSportId}
        setDetailSportId={setDetailSportId}
        sportDetailQuery={sportDetailQuery}
      />

      <AlertDialog
        open={!!deleteSportId}
        onOpenChange={(open) => {
          if (!open) setDeleteSportId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete sport?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected sport will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSport}
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
            <AlertDialogTitle>Delete selected sports?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete {selectedIds.length} selected sport(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedSports}
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
