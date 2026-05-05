"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const bookingSchema = z.object({
  timeSlotIds: z.string().min(1, "Please provide at least 1 time slot id"),
});

const toFieldErrors = (errors: unknown[]) =>
  errors
    .map((error) => {
      if (typeof error === "string") return { message: error };
      if (error && typeof error === "object" && "message" in error) {
        const msg = (error as { message?: unknown }).message;
        return { message: typeof msg === "string" ? msg : undefined };
      }
      return undefined;
    })
    .filter(Boolean) as Array<{ message?: string }>;

interface BookingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateBooking: (values: { timeSlotIds: string }) => void;
  isCreating: boolean;
}

export function BookingFormDialog(props: BookingFormDialogProps) {
  const { open, onOpenChange, onCreateBooking, isCreating } = props;
  const defaultValues = useMemo(() => ({ timeSlotIds: "" }), []);

  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      const result = bookingSchema.safeParse(value);
      if (!result.success) return;
      onCreateBooking({ timeSlotIds: value.timeSlotIds.trim() });
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
          <DialogTitle>Create booking</DialogTitle>
          <DialogDescription>Enter time slot IDs, separated by commas.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="space-y-4">
            <form.Field
              name="timeSlotIds"
              validators={{
                onBlur: ({ value }) => {
                  const result = bookingSchema.shape.timeSlotIds.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Time slot IDs</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="slot-id-1, slot-id-2"
                  />
                  <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

