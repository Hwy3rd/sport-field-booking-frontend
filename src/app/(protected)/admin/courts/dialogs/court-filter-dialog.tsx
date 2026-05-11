"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Option {
  id: string;
  name: string;
}

interface CourtFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draftFilterVenueId: string;
  draftFilterSportId: string;
  venues: Option[];
  sports: Option[];
  onDraftFilterVenueIdChange: (value: string) => void;
  onDraftFilterSportIdChange: (value: string) => void;
  onApply: (venueId: string, sportId: string) => void;
}

export function CourtFilterDialog(props: CourtFilterDialogProps) {
  const {
    open,
    onOpenChange,
    draftFilterVenueId,
    draftFilterSportId,
    venues,
    sports,
    onDraftFilterVenueIdChange,
    onDraftFilterSportIdChange,
    onApply,
  } = props;

  const form = useForm({
    defaultValues: {
      venueId: draftFilterVenueId,
      sportId: draftFilterSportId,
    },
    onSubmit: ({ value }) => {
      onApply(value.venueId, value.sportId);
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.setFieldValue("venueId", draftFilterVenueId);
    form.setFieldValue("sportId", draftFilterSportId);
  }, [draftFilterVenueId, draftFilterSportId, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter courts</DialogTitle>
          <DialogDescription>Apply backend filters by venue and sport.</DialogDescription>
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
            name="venueId"
            children={(field) => (
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  onDraftFilterVenueIdChange(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All venues</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <form.Field
            name="sportId"
            children={(field) => (
              <Select
                value={field.state.value}
                onValueChange={(value) => {
                  field.handleChange(value);
                  onDraftFilterSportIdChange(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sport" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sports</SelectItem>
                  {sports.map((sport) => (
                    <SelectItem key={sport.id} value={sport.id}>
                      {sport.name}
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
                form.setFieldValue("venueId", "all");
                form.setFieldValue("sportId", "all");
                onDraftFilterVenueIdChange("all");
                onDraftFilterSportIdChange("all");
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

