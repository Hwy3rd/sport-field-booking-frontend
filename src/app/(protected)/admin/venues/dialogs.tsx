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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { Venue } from "@/types/venue.type";
import { DatePickerTime } from "@/components/ui/time-picker";

type CreateVenueForm = {
  ownerId: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  startTime: string;
  endTime: string;
  phone: string;
  email: string;
};

interface OwnerOption {
  id: string;
  fullName: string;
  role: string;
}

interface VenueDetailData {
  id: string;
  name: string;
  ownerId: string;
  address: string;
  description: string;
  imageUrl?: string | null;
  operatingHours?: { startTime?: string; endTime?: string } | null;
  contactInfo?: { phone?: string; email?: string } | null;
}

interface AdminVenuesDialogsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftFilterOwnerId: string;
  setDraftFilterOwnerId: (value: string) => void;
  setFilterOwnerId: (value: string) => void;
  ownerOptions: OwnerOption[];
  setPage: (value: number) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  form: UseFormReturn<CreateVenueForm>;
  submit: (values: CreateVenueForm) => void;
  createVenueMutation: UseMutationResult<unknown, Error, unknown, unknown>;
  editingVenue: Venue | null;
  setEditingVenue: (value: Venue | null) => void;
  editForm: UseFormReturn<CreateVenueForm>;
  submitEdit: (values: CreateVenueForm) => void;
  updateVenueMutation: UseMutationResult<unknown, Error, unknown, unknown>;
  detailVenueId: string | null;
  setDetailVenueId: (value: string | null) => void;
  detailVenueQuery: {
    isLoading: boolean;
    data?: VenueDetailData | null;
  };
}

export function AdminVenuesDialogs(props: AdminVenuesDialogsProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftFilterOwnerId,
    setDraftFilterOwnerId,
    setFilterOwnerId,
    ownerOptions,
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
            <DialogDescription>Filter venues by owner from backend query.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm font-medium">Owner</div>
            <Select value={draftFilterOwnerId} onValueChange={setDraftFilterOwnerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                {ownerOptions.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id}>
                    {owner.fullName} ({owner.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDraftFilterOwnerId("all");
                setFilterOwnerId("all");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setFilterOwnerId(draftFilterOwnerId);
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
            <DialogDescription>Add a new venue and assign owner.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Owner</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ownerOptions.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.fullName} ({owner.role})
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
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
                      <DatePickerTime {...field} />
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
                      <DatePickerTime {...field} />
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
            <DialogDescription>Update venue information and assign owner.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              className="grid gap-4 md:grid-cols-2"
              onSubmit={editForm.handleSubmit(submitEdit)}
            >
              <FormField
                control={editForm.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Owner</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ownerOptions.map((owner) => (
                          <SelectItem key={owner.id} value={owner.id}>
                            {owner.fullName} ({owner.role})
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
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
                      <DatePickerTime {...field} />
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
                      <DatePickerTime {...field} />
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
            <div className="space-y-4">
              {detailVenueQuery.data.imageUrl ? (
                <img
                  src={detailVenueQuery.data.imageUrl}
                  alt={detailVenueQuery.data.name}
                  className="h-44 w-full rounded-lg border object-cover"
                />
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
