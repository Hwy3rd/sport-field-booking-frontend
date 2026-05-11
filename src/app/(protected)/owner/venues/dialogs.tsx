"use client";

import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";

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
import type { Venue } from "@/types/venue.type";

type CreateVenueForm = {
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  startTime: string;
  endTime: string;
  phone: string;
  email: string;
};

interface VenueDetailData {
  id: string;
  name: string;
  address: string;
  description: string;
  ownerId: string;
  imageUrl?: string | null;
  operatingHours?: { startTime?: string; endTime?: string } | null;
  contactInfo?: { phone?: string; email?: string } | null;
}

interface OwnerVenuesDialogsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftFilterAddress: string;
  setDraftFilterAddress: (value: string) => void;
  setFilterAddress: (value: string) => void;
  setPage: (value: number) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  form: UseFormReturn<CreateVenueForm>;
  submit: (values: CreateVenueForm) => void;
  createVenueMutation: { isPending: boolean };
  editingVenue: Venue | null;
  setEditingVenue: (value: Venue | null) => void;
  editForm: UseFormReturn<CreateVenueForm>;
  submitEdit: (values: CreateVenueForm) => void;
  updateVenueMutation: { isPending: boolean };
  detailVenueId: string | null;
  setDetailVenueId: (value: string | null) => void;
  detailVenueQuery: {
    isLoading: boolean;
    data?: VenueDetailData | null;
  };
}

export function OwnerVenuesDialogs(props: OwnerVenuesDialogsProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftFilterAddress,
    setDraftFilterAddress,
    setFilterAddress,
    setPage,
    isCreateOpen,
    setIsCreateOpen,
    form,
    submit,
    createVenueMutation,
    editingVenue,
    setEditingVenue,
    editForm,
    submitEdit,
    updateVenueMutation,
    detailVenueId,
    setDetailVenueId,
    detailVenueQuery,
  } = props;

  return (
    <>
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
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem><FormLabel>Open time</FormLabel><FormControl><Input placeholder="06:00" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem><FormLabel>Close time</FormLabel><FormControl><Input placeholder="22:00" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={createVenueMutation.isPending}>
                  {createVenueMutation.isPending ? "Creating..." : "Create venue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVenue} onOpenChange={(open) => {
        if (!open) {
          setEditingVenue(null);
          editForm.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit venue</DialogTitle>
            <DialogDescription>Update venue information and operating details.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={editForm.handleSubmit(submitEdit)}>
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="address" render={({ field }) => (
                <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="description" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="imageUrl" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="startTime" render={({ field }) => (
                <FormItem><FormLabel>Open time</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="endTime" render={({ field }) => (
                <FormItem><FormLabel>Close time</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
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
            <div className="space-y-4">
              {detailVenueQuery.data.imageUrl ? (
                <img src={detailVenueQuery.data.imageUrl} alt={detailVenueQuery.data.name} className="h-44 w-full rounded-lg border object-cover" />
              ) : null}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Name</div><div className="font-medium">{detailVenueQuery.data.name}</div></div>
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Owner ID</div><div className="font-medium">{detailVenueQuery.data.ownerId}</div></div>
                <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Address</div><div className="font-medium">{detailVenueQuery.data.address}</div></div>
                <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Description</div><div className="font-medium">{detailVenueQuery.data.description}</div></div>
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Operating</div><div className="font-medium">{detailVenueQuery.data.operatingHours?.startTime} - {detailVenueQuery.data.operatingHours?.endTime}</div></div>
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Phone</div><div className="font-medium">{detailVenueQuery.data.contactInfo?.phone ?? "-"}</div></div>
                <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Email</div><div className="font-medium">{detailVenueQuery.data.contactInfo?.email ?? "-"}</div></div>
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
