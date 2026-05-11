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
import type { Sport } from "@/types/sport.type";

type FormMode = "create" | "edit" | null;

const sportSchema = z.object({
  name: z.string().min(2, "Sport name is required"),
  description: z.string().optional(),
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

interface SportFormDialogProps {
  mode: FormMode;
  sport: Sport | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: { name: string; description?: string }) => void;
  onEdit: (values: { name: string; description?: string }) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function SportFormDialog(props: SportFormDialogProps) {
  const { mode, sport, onOpenChange, onCreate, onEdit, isCreating, isUpdating } = props;
  const open = mode !== null;

  const defaultValues = useMemo(
    () => ({
      name: sport?.name ?? "",
      description: sport?.description ?? "",
    }),
    [sport],
  );

  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      const parsed = sportSchema.safeParse(value);
      if (!parsed.success) return;

      if (mode === "create") {
        onCreate({
          name: value.name.trim(),
          description: value.description?.trim() || undefined,
        });
      } else if (mode === "edit") {
        onEdit({
          name: value.name.trim(),
          description: value.description?.trim() || undefined,
        });
      }
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
          <DialogTitle>{mode === "create" ? "Create sport" : "Edit sport"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Add a new sport type." : "Update sport name and description."}
          </DialogDescription>
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
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  const result = sportSchema.shape.name.safeParse(value);
                  return result.success ? undefined : result.error.issues[0]?.message;
                },
              }}
              children={(field) => (
                <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                  <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                </Field>
              )}
            />
            <form.Field
              name="description"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <Input value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating ? "Saving..." : mode === "create" ? "Create sport" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

