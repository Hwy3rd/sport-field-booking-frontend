"use client";

import type { UseFormReturn } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { UseMutationResult } from "@tanstack/react-query";

import type { Sport } from "@/types/sport.type";

type CreateSportForm = {
  name: string;
  description?: string;
};

type MutationLike = UseMutationResult<unknown, Error, any, unknown>;

interface SportsDialogsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftFilterName: string;
  setDraftFilterName: (value: string) => void;
  setFilterName: (value: string) => void;
  setPage: (value: number) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  form: UseFormReturn<CreateSportForm>;
  submit: (values: CreateSportForm) => void;
  createSportMutation: MutationLike;
  editingSport: Sport | null;
  setEditingSport: (value: Sport | null) => void;
  editForm: UseFormReturn<CreateSportForm>;
  submitEdit: (values: CreateSportForm) => void;
  updateSportMutation: MutationLike;
  detailSportId: string | null;
  setDetailSportId: (value: string | null) => void;
  sportDetailQuery: {
    isLoading: boolean;
    data?: { id: string; name: string; description?: string | null } | null;
  };
}

export function SportsDialogs(props: SportsDialogsProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftFilterName,
    setDraftFilterName,
    setFilterName,
    setPage,
    isCreateOpen,
    setIsCreateOpen,
    form,
    submit,
    createSportMutation,
    editingSport,
    setEditingSport,
    editForm,
    submitEdit,
    updateSportMutation,
    detailSportId,
    setDetailSportId,
    sportDetailQuery,
  } = props;

  return (
    <>
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
              <div>
                <span className="font-medium">ID:</span> {sportDetailQuery.data.id}
              </div>
              <div>
                <span className="font-medium">Name:</span> {sportDetailQuery.data.name}
              </div>
              <div>
                <span className="font-medium">Description:</span> {sportDetailQuery.data.description ?? "-"}
              </div>
            </div>
          ) : (
            <EmptyState title="No detail found" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
