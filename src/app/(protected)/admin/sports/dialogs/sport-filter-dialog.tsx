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
import { Input } from "@/components/ui/input";

interface SportFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftFilterName: string;
  onDraftFilterNameChange: (value: string) => void;
  onApply: (name: string) => void;
}

export function SportFilterDialog(props: SportFilterDialogProps) {
  const { open, onOpenChange, draftFilterName, onDraftFilterNameChange, onApply } = props;

  const form = useForm({
    defaultValues: {
      name: draftFilterName,
    },
    onSubmit: ({ value }) => {
      onApply(value.name.trim());
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.setFieldValue("name", draftFilterName);
  }, [draftFilterName, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter sports</DialogTitle>
          <DialogDescription>Apply backend filter by sport name.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="name"
            children={(field) => (
              <Input
                value={field.state.value}
                onChange={(event) => {
                  field.handleChange(event.target.value);
                  onDraftFilterNameChange(event.target.value);
                }}
                placeholder="e.g. Football"
              />
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setFieldValue("name", "");
                onDraftFilterNameChange("");
              }}
            >
              Reset
            </Button>
            <Button type="submit">Apply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

