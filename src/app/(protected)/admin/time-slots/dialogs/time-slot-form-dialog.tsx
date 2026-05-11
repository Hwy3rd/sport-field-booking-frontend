"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TimeSlot } from "@/types/time-slot.type";
import type { TimeSlotStatus } from "@/lib/constants/time-slot.constant";
import { useVenues } from "@/hooks/useVenue";
import { useCourts } from "@/hooks/useCourt";

type FormMode = "create" | "edit" | null;

interface TimeSlotFormValue {
  venueId: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: TimeSlotStatus;
}

interface TimeSlotFormDialogProps {
  mode: FormMode;
  slot: TimeSlot | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: TimeSlotFormValue) => void;
  onEdit: (values: TimeSlotFormValue) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function TimeSlotFormDialog(props: TimeSlotFormDialogProps) {
  const { mode, slot, onOpenChange, onCreate, onEdit, isCreating, isUpdating } = props;
  const open = mode !== null;

  const venuesQuery = useVenues({ current: 1, limit: 100, filter: {} });
  const venues = venuesQuery.data?.items ?? [];

  const form = useForm({
    defaultValues: {
      venueId: slot?.court?.venueId ?? "",
      courtId: slot?.courtId ?? "",
      date: slot?.date ?? new Date().toISOString().split("T")[0],
      startTime: slot?.startTime ?? "06:00",
      endTime: slot?.endTime ?? "07:00",
      price: slot?.price ?? 100000,
      status: slot?.status ?? "available",
    } as TimeSlotFormValue,
    onSubmit: ({ value }) => {
      const payload: any = { ...value };
      if (mode === "create") onCreate(payload);
      if (mode === "edit") onEdit(payload);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      venueId: slot?.court?.venueId ?? "",
      courtId: slot?.courtId ?? "",
      date: slot?.date ?? new Date().toISOString().split("T")[0],
      startTime: slot?.startTime ?? "06:00",
      endTime: slot?.endTime ?? "07:00",
      price: slot?.price ?? 100000,
      status: slot?.status ?? "available",
    });
  }, [slot, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create time slot" : "Edit time slot"}</DialogTitle>
          <DialogDescription>Add a one-off time slot or block an existing one manually.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <form.Field
              name="venueId"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Venue</FieldLabel>
                  <Select 
                    value={field.state.value} 
                    onValueChange={(val) => {
                      field.handleChange(val);
                      form.setFieldValue("courtId", "");
                    }}
                    disabled={mode === "edit"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            
            <form.Subscribe selector={(state) => state.values.venueId}>
              {(venueId) => (
                <VenueCourtSelector form={form as any} venueId={venueId} disabled={mode === "edit"} />
              )}
            </form.Subscribe>

            <form.Field
              name="date"
              children={(field) => (
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                  <Input
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="startTime"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Start time</FieldLabel>
                  <Input
                    type="time"
                    step={60}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="endTime"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>End time</FieldLabel>
                  <Input
                    type="time"
                    step={60}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="price"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Field>
              )}
            />
            <form.Field
              name="status"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                  <Select 
                    value={field.state.value} 
                    onValueChange={(val: any) => field.handleChange(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="booked">Booked</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? "Saving..."
                : mode === "create"
                  ? "Create slot"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VenueCourtSelector({ form, venueId, disabled }: { form: any, venueId: string, disabled?: boolean }) {
  const courtsQuery = useCourts({ current: 1, limit: 100, venueId });
  const courts = courtsQuery.data?.items ?? [];

  return (
    <form.Field
      name="courtId"
      children={(field: any) => (
        <Field>
          <FieldLabel htmlFor={field.name}>Court</FieldLabel>
          <Select 
            value={field.state.value || ""} 
            onValueChange={(val) => field.handleChange(val)}
            disabled={!venueId || courtsQuery.isLoading || disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={courtsQuery.isLoading ? "Loading..." : "Select court"} />
            </SelectTrigger>
            <SelectContent>
              {courts.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
    />
  );
}
