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
import { BOOKING_STATUS_VALUES, type BookingStatus } from "@/lib/constants/booking.constant";

interface BookingFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftStatus: BookingStatus | "all";
  onDraftStatusChange: (value: BookingStatus | "all") => void;
  onApply: (status: BookingStatus | "all") => void;
}

export function BookingFilterDialog(props: BookingFilterDialogProps) {
  const { open, onOpenChange, draftStatus, onDraftStatusChange, onApply } = props;
  const form = useForm({
    defaultValues: { status: draftStatus },
    onSubmit: ({ value }) => {
      onApply(value.status);
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.setFieldValue("status", draftStatus);
  }, [draftStatus, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter bookings</DialogTitle>
          <DialogDescription>Filter by booking status from backend.</DialogDescription>
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
            name="status"
            children={(field) => (
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  const casted = value as BookingStatus | "all";
                  field.handleChange(casted);
                  onDraftStatusChange(casted);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  {BOOKING_STATUS_VALUES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
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
                form.setFieldValue("status", "all");
                onDraftStatusChange("all");
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

