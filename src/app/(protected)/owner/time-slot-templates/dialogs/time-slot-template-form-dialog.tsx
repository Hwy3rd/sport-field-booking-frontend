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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import type { TimeSlotTemplate } from "@/types/time-slot.type";
import {
  TIME_SLOT_WEEKDAY_VALUES,
  TIME_SLOT_WEEKDAY_LABEL_EN,
} from "@/lib/constants/time-slot.constant";
import { useVenues } from "@/hooks/useVenue";
import { useCourts } from "@/hooks/useCourt";
import { useMe } from "@/hooks/useUser";

type FormMode = "create" | "edit" | null;

interface TimeSlotTemplateFormValue {
  venueId: string;
  name: string;
  courtId?: string | null;
  weekdays: number[];
  startTime: string;
  endTime: string;
  price: number;
  isActive: boolean;
}

interface TimeSlotTemplateFormDialogProps {
  mode: FormMode;
  template: TimeSlotTemplate | null;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: TimeSlotTemplateFormValue) => void;
  onEdit: (values: TimeSlotTemplateFormValue) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function TimeSlotTemplateFormDialog(props: TimeSlotTemplateFormDialogProps) {
  const { mode, template, onOpenChange, onCreate, onEdit, isCreating, isUpdating } = props;
  const open = mode !== null;

  const meQuery = useMe();
  const ownerId = meQuery.data?.id;
  const venuesQuery = useVenues({ current: 1, limit: 100, ownerId });
  const venues = venuesQuery.data?.items ?? [];

  const form = useForm({
    defaultValues: {
      venueId: template?.venueId ?? "",
      name: template?.name ?? "",
      courtId: template?.courtId ?? null,
      weekdays: template ? [template.weekday] : [1],
      startTime: template?.startTime ?? "06:00",
      endTime: template?.endTime ?? "07:00",
      price: template?.price ?? 100000,
      isActive: template?.isActive ?? true,
    } as TimeSlotTemplateFormValue,
    onSubmit: ({ value }) => {
      const payload: any = { ...value };
      if (!payload.courtId || payload.courtId === "none") {
        delete payload.courtId;
      }
      if (mode === "create") onCreate(payload);
      if (mode === "edit") onEdit(payload);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      venueId: template?.venueId ?? "",
      name: template?.name ?? "",
      courtId: template?.courtId ?? null,
      weekdays: template ? [template.weekday] : [1],
      startTime: template?.startTime ?? "06:00",
      endTime: template?.endTime ?? "07:00",
      price: template?.price ?? 100000,
      isActive: template?.isActive ?? true,
    });
  }, [template, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create template" : "Edit template"}</DialogTitle>
          <DialogDescription>
            Setup a time slot template for a venue or specific court.
          </DialogDescription>
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
                      form.setFieldValue("courtId", null);
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
              {(venueId) => <VenueCourtSelector form={form as any} venueId={venueId} />}
            </form.Subscribe>

            <form.Field
              name="name"
              children={(field) => (
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor={field.name}>Group Name</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Weekday Evenings, Weekend Morning"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Used to group multiple time slot templates together.
                  </p>
                </Field>
              )}
            />
            <form.Field
              name="weekdays"
              children={(field) => (
                <Field className="md:col-span-2">
                  <FieldLabel>Weekdays</FieldLabel>
                  <div className="mt-2 flex flex-wrap gap-4">
                    {TIME_SLOT_WEEKDAY_VALUES.map((day) => {
                      const isChecked = field.state.value.includes(day);
                      return (
                        <div key={day} className="flex items-center space-x-2">
                          <Checkbox
                            id={`weekday-${day}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.handleChange([...field.state.value, day]);
                              } else {
                                field.handleChange(field.state.value.filter((d) => d !== day));
                              }
                            }}
                            disabled={mode === "edit" && !isChecked}
                          />
                          <label
                            htmlFor={`weekday-${day}`}
                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {TIME_SLOT_WEEKDAY_LABEL_EN[day]}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {mode === "edit" && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      You can only edit the time range and price. To change the weekday, please
                      create a new template.
                    </p>
                  )}
                </Field>
              )}
            />
            <form.Field
              name="price"
              children={(field) => (
                <Field className="md:col-span-2">
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
              name="isActive"
              children={(field) => (
                <Field className="md:col-span-2">
                  <div className="mt-4 flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={field.state.value}
                      onCheckedChange={(checked) => field.handleChange(checked)}
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Active
                    </label>
                  </div>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? "Saving..."
                : mode === "create"
                  ? "Create template"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function VenueCourtSelector({ form, venueId }: { form: any; venueId: string }) {
  const courtsQuery = useCourts({ current: 1, limit: 100, venueId });
  const courts = courtsQuery.data?.items ?? [];

  return (
    <form.Field
      name="courtId"
      children={(field: any) => (
        <Field>
          <FieldLabel htmlFor={field.name}>Court Override (Optional)</FieldLabel>
          <Select
            value={field.state.value || "none"}
            onValueChange={(val) => field.handleChange(val === "none" ? null : val)}
            disabled={!venueId || courtsQuery.isLoading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={courtsQuery.isLoading ? "Loading..." : "Applies to Venue"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Applies to all courts in venue)</SelectItem>
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
