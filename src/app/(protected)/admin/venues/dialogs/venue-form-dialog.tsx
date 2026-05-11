"use client";

import { useEffect, useMemo } from "react";
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
import { DatePickerTime } from "@/components/ui/time-picker";
import type { Venue } from "@/types/venue.type";

type FormMode = "create" | "edit" | null;

interface OwnerOption {
  id: string;
  fullName: string;
  role: string;
}

interface VenueFormValue {
  ownerId: string;
  name: string;
  address: string;
  description: string;
  imageUrl: string;
  startTime: string;
  endTime: string;
  phone: string;
  email: string;
}

interface VenueFormDialogProps {
  mode: FormMode;
  venue: Venue | null;
  ownerOptions: OwnerOption[];
  onOpenChange: (open: boolean) => void;
  onCreate: (values: VenueFormValue) => void;
  onEdit: (values: VenueFormValue) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function VenueFormDialog(props: VenueFormDialogProps) {
  const { mode, venue, ownerOptions, onOpenChange, onCreate, onEdit, isCreating, isUpdating } = props;
  const open = mode !== null;

  const defaultValues = useMemo(
    () => ({
      ownerId: venue?.ownerId ?? "",
      name: venue?.name ?? "",
      address: venue?.address ?? "",
      description: venue?.description ?? "",
      imageUrl: venue?.imageUrl ?? "",
      startTime: venue?.operatingHours?.startTime ?? "06:00",
      endTime: venue?.operatingHours?.endTime ?? "22:00",
      phone: venue?.contactInfo?.phone ?? "",
      email: venue?.contactInfo?.email ?? "",
    }),
    [venue],
  );

  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      if (mode === "create") onCreate(value);
      if (mode === "edit") onEdit(value);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create venue" : "Edit venue"}</DialogTitle>
          <DialogDescription>Add or update venue information and assign owner.</DialogDescription>
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
              name="ownerId"
              children={(field) => (
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor={field.name}>Owner</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerOptions.map((owner) => (
                        <SelectItem key={owner.id} value={owner.id}>
                          {owner.fullName} ({owner.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            {(["name", "address", "description", "imageUrl", "phone", "email"] as const).map((name) => (
              <form.Field
                key={name}
                name={name}
                children={(field) => (
                  <Field className={name === "description" || name === "imageUrl" ? "md:col-span-2" : ""}>
                    <FieldLabel htmlFor={field.name}>{name}</FieldLabel>
                    <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                  </Field>
                )}
              />
            ))}
            <form.Field
              name="startTime"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Open time</FieldLabel>
                  <DatePickerTime value={field.state.value} onChange={field.handleChange} />
                </Field>
              )}
            />
            <form.Field
              name="endTime"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Close time</FieldLabel>
                  <DatePickerTime value={field.state.value} onChange={field.handleChange} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Saving..." : mode === "create" ? "Create venue" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

