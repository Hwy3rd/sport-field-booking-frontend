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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OwnerOption {
  id: string;
  fullName: string;
  role: string;
}

interface VenueFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftOwnerId: string;
  onDraftOwnerIdChange: (value: string) => void;
  ownerOptions: OwnerOption[];
  onApply: (ownerId: string) => void;
}

export function VenueFilterDialog(props: VenueFilterDialogProps) {
  const { open, onOpenChange, draftOwnerId, onDraftOwnerIdChange, ownerOptions, onApply } = props;
  const form = useForm({
    defaultValues: { ownerId: draftOwnerId },
    onSubmit: ({ value }) => {
      onApply(value.ownerId);
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.setFieldValue("ownerId", draftOwnerId);
  }, [draftOwnerId, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter venues</DialogTitle>
          <DialogDescription>Filter venues by owner from backend query.</DialogDescription>
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
            name="ownerId"
            children={(field) => (
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  onDraftOwnerIdChange(value);
                }}
              >
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
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setFieldValue("ownerId", "all");
                onDraftOwnerIdChange("all");
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

