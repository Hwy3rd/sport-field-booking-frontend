"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  TIME_SLOT_WEEKDAY_LABEL_EN,
  TIME_SLOT_WEEKDAY_VALUES,
} from "@/lib/constants/time-slot.constant";
import type { Court } from "@/types/court.type";
import type { UpdateTimeSlotRequest } from "@/types/time-slot.type";

type FormMode = "create" | "edit" | null;

interface Option {
  id: string;
  name: string;
}

interface CourtTimeSlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
}

export interface CourtTimeSlotConfigDraft {
  manualSlots?: Array<{
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  }>;
  templateGeneration?: {
    startDate: string;
    endDate: string;
    weekdays: number[];
    startTime: string;
    endTime: string;
    price: number;
    createTemplate: boolean;
  };
}

export interface CourtFormValue {
  venueId: string;
  sportId: string;
  name: string;
  pricePerHour: number;
  imageUrl?: string;
  slotMode?: "none" | "manual" | "template";
  manualDate?: string;
  manualStartTime?: string;
  manualEndTime?: string;
  manualPrice?: number;
  templateStartDate?: string;
  templateEndDate?: string;
  templateWeekdays?: number[];
  templateStartTime?: string;
  templateEndTime?: string;
  templatePrice?: number;
  createTemplate?: boolean;
}

interface CourtFormDialogProps {
  mode: FormMode;
  court: Court | null;
  venues: Option[];
  sports: Option[];
  courtTimeSlots: CourtTimeSlotItem[];
  isTimeSlotsLoading: boolean;
  isSavingTimeSlot: boolean;
  onUpdateTimeSlot: (id: string, payload: UpdateTimeSlotRequest) => void;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: CourtFormValue, timeSlotConfigs: CourtTimeSlotConfigDraft[]) => void;
  onEdit: (values: CourtFormValue, timeSlotConfigs: CourtTimeSlotConfigDraft[]) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function CourtFormDialog(props: CourtFormDialogProps) {
  const {
    mode,
    court,
    venues,
    sports,
    courtTimeSlots,
    isTimeSlotsLoading,
    isSavingTimeSlot,
    onUpdateTimeSlot,
    onOpenChange,
    onCreate,
    onEdit,
    isCreating,
    isUpdating,
  } = props;
  const open = mode !== null;
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("06:00");
  const [slotEndTime, setSlotEndTime] = useState("07:00");
  const [slotPrice, setSlotPrice] = useState(100000);
  const [isAddTimeSlotOpen, setIsAddTimeSlotOpen] = useState(false);
  const [pendingTimeSlotConfigs, setPendingTimeSlotConfigs] = useState<CourtTimeSlotConfigDraft[]>([]);
  const [addSlotError, setAddSlotError] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const maxAllowedDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().slice(0, 10);
  }, []);

  const defaultValues = useMemo<CourtFormValue>(
    () => ({
      venueId: court?.venueId ?? "",
      sportId: court?.sportId ?? "",
      name: court?.name ?? "",
      pricePerHour: court?.pricePerHour ?? 100000,
      imageUrl: court?.imageUrl ?? "",
      slotMode: "none",
      manualDate: "",
      manualStartTime: "06:00",
      manualEndTime: "07:00",
      manualPrice: court?.pricePerHour ?? 100000,
      templateStartDate: "",
      templateEndDate: "",
      templateWeekdays: [],
      templateStartTime: "06:00",
      templateEndTime: "07:00",
      templatePrice: court?.pricePerHour ?? 100000,
      createTemplate: true,
    }),
    [court],
  );

  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      if (mode === "create") onCreate(value, pendingTimeSlotConfigs);
      if (mode === "edit") onEdit(value, pendingTimeSlotConfigs);
    },
  });

  const buildTimeSlotConfig = (values: CourtFormValue): CourtTimeSlotConfigDraft | undefined => {
    if (
      values.slotMode === "manual" &&
      values.manualDate &&
      values.manualStartTime &&
      values.manualEndTime &&
      values.manualPrice !== undefined
    ) {
      return {
        manualSlots: [
          {
            date: values.manualDate,
            startTime: values.manualStartTime,
            endTime: values.manualEndTime,
            price: values.manualPrice,
          },
        ],
      };
    }
    if (
      values.slotMode === "template" &&
      values.templateStartDate &&
      values.templateEndDate &&
      values.templateWeekdays?.length &&
      values.templateStartTime &&
      values.templateEndTime &&
      values.templatePrice !== undefined
    ) {
      return {
        templateGeneration: {
          startDate: values.templateStartDate,
          endDate: values.templateEndDate,
          weekdays: values.templateWeekdays,
          startTime: values.templateStartTime,
          endTime: values.templateEndTime,
          price: values.templatePrice,
          createTemplate: values.createTemplate ?? true,
        },
      };
    }
    return undefined;
  };

  const toMinutes = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute;
  };

  const isTimeRangeOverlap = (
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean => {
    const startAMin = toMinutes(startA);
    const endAMin = toMinutes(endA);
    const startBMin = toMinutes(startB);
    const endBMin = toMinutes(endB);
    return startAMin < endBMin && startBMin < endAMin;
  };

  const getIsoWeekday = (dateString: string) => {
    const date = new Date(dateString);
    const weekday = date.getDay();
    return weekday === 0 ? 7 : weekday;
  };

  const doesDateRangeOverlap = (
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean => startA <= endB && startB <= endA;

  const validateTimeSlotConfig = (config: CourtTimeSlotConfigDraft): string | null => {
    if (config.manualSlots?.length) {
      const [manualSlot] = config.manualSlots;
      if (!manualSlot) return "Manual slot data is invalid.";
      if (manualSlot.date < today || manualSlot.date > maxAllowedDate) {
        return "Manual slot date must be within 30 days from today.";
      }
      if (toMinutes(manualSlot.startTime) >= toMinutes(manualSlot.endTime)) {
        return "Manual slot end time must be after start time.";
      }
      const overlapWithExisting = courtTimeSlots.some(
        (item) =>
          item.date === manualSlot.date &&
          isTimeRangeOverlap(item.startTime, item.endTime, manualSlot.startTime, manualSlot.endTime),
      );
      if (overlapWithExisting) {
        return "Manual slot overlaps an existing time slot.";
      }
      const overlapWithPending = pendingTimeSlotConfigs.some((item) => {
        if (item.manualSlots?.length) {
          const [pendingManual] = item.manualSlots;
          if (!pendingManual) return false;
          return (
            pendingManual.date === manualSlot.date &&
            isTimeRangeOverlap(
              pendingManual.startTime,
              pendingManual.endTime,
              manualSlot.startTime,
              manualSlot.endTime,
            )
          );
        }
        if (item.templateGeneration) {
          const template = item.templateGeneration;
          const weekday = getIsoWeekday(manualSlot.date);
          return (
            manualSlot.date >= template.startDate &&
            manualSlot.date <= template.endDate &&
            template.weekdays.includes(weekday) &&
            isTimeRangeOverlap(
              template.startTime,
              template.endTime,
              manualSlot.startTime,
              manualSlot.endTime,
            )
          );
        }
        return false;
      });
      if (overlapWithPending) {
        return "Manual slot overlaps with a pending slot.";
      }
      return null;
    }

    if (config.templateGeneration) {
      const template = config.templateGeneration;
      if (template.startDate < today || template.endDate > maxAllowedDate) {
        return "Template date range must be within 30 days from today.";
      }
      if (template.startDate > template.endDate) {
        return "Template end date must be the same or after start date.";
      }
      if (toMinutes(template.startTime) >= toMinutes(template.endTime)) {
        return "Template end time must be after start time.";
      }

      const overlapWithExisting = courtTimeSlots.some((item) => {
        const weekday = getIsoWeekday(item.date);
        return (
          item.date >= template.startDate &&
          item.date <= template.endDate &&
          template.weekdays.includes(weekday) &&
          isTimeRangeOverlap(item.startTime, item.endTime, template.startTime, template.endTime)
        );
      });
      if (overlapWithExisting) {
        return "Template overlaps an existing time slot.";
      }

      const overlapWithPending = pendingTimeSlotConfigs.some((item) => {
        if (item.manualSlots?.length) {
          const [pendingManual] = item.manualSlots;
          if (!pendingManual) return false;
          const weekday = getIsoWeekday(pendingManual.date);
          return (
            pendingManual.date >= template.startDate &&
            pendingManual.date <= template.endDate &&
            template.weekdays.includes(weekday) &&
            isTimeRangeOverlap(
              pendingManual.startTime,
              pendingManual.endTime,
              template.startTime,
              template.endTime,
            )
          );
        }
        if (item.templateGeneration) {
          const pendingTemplate = item.templateGeneration;
          const hasWeekdayIntersection = pendingTemplate.weekdays.some((day) =>
            template.weekdays.includes(day),
          );
          return (
            hasWeekdayIntersection &&
            doesDateRangeOverlap(
              template.startDate,
              template.endDate,
              pendingTemplate.startDate,
              pendingTemplate.endDate,
            ) &&
            isTimeRangeOverlap(
              template.startTime,
              template.endTime,
              pendingTemplate.startTime,
              pendingTemplate.endTime,
            )
          );
        }
        return false;
      });
      if (overlapWithPending) {
        return "Template overlaps with a pending slot.";
      }
    }
    return null;
  };

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
    setEditingSlotId(null);
    setIsAddTimeSlotOpen(false);
    setPendingTimeSlotConfigs([]);
    setAddSlotError(null);
  }, [defaultValues, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create court" : "Edit court"}</DialogTitle>
          <DialogDescription>Update court details, pricing and relationships.</DialogDescription>
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
                  <Select value={field.state.value} onValueChange={field.handleChange}>
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
            <form.Field
              name="sportId"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Sport</FieldLabel>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sport" />
                    </SelectTrigger>
                    <SelectContent>
                      {sports.map((sport) => (
                        <SelectItem key={sport.id} value={sport.id}>
                          {sport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <form.Field
              name="name"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <form.Field
              name="pricePerHour"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Price per hour</FieldLabel>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Field>
              )}
            />
            <form.Field
              name="imageUrl"
              children={(field) => (
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor={field.name}>Image URL (optional)</FieldLabel>
                  <Input
                    value={field.state.value ?? ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            />
            <div className="space-y-2 rounded-lg border p-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Current time slots</div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsAddTimeSlotOpen((prev) => !prev)}
                >
                  {isAddTimeSlotOpen ? "Hide add form" : "Add time slot"}
                </Button>
              </div>
              {isAddTimeSlotOpen ? (
                <div className="grid gap-4 rounded-md border border-dashed p-3 md:grid-cols-2">
                  <form.Field
                    name="slotMode"
                    children={(field) => (
                      <Field className="md:col-span-2">
                        <FieldLabel htmlFor={field.name}>Time-slot setup</FieldLabel>
                        <Select
                          value={field.state.value ?? "none"}
                          onValueChange={(value) =>
                            field.handleChange(value as CourtFormValue["slotMode"])
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select setup mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No setup</SelectItem>
                            <SelectItem value="manual">Create one manual slot</SelectItem>
                            <SelectItem value="template">Generate by template</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  />
                  <form.Subscribe selector={(state) => state.values.slotMode}>
                    {(slotMode) =>
                      slotMode === "manual" ? (
                        <>
                          <form.Field
                            name="manualDate"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                                <Input
                                  type="date"
                                  min={today}
                                  max={maxAllowedDate}
                                  value={field.state.value ?? ""}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name="manualPrice"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Slot price</FieldLabel>
                                <Input
                                  type="number"
                                  min={0}
                                  value={field.state.value ?? 0}
                                  onChange={(e) => field.handleChange(Number(e.target.value))}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name="manualStartTime"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Start time</FieldLabel>
                                <Input
                                  type="time"
                                  step={60}
                                  value={field.state.value ?? ""}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name="manualEndTime"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>End time</FieldLabel>
                                <Input
                                  type="time"
                                  step={60}
                                  value={field.state.value ?? ""}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                        </>
                      ) : slotMode === "template" ? (
                        <>
                          <form.Field
                            name="templateStartDate"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Start date</FieldLabel>
                                <Input
                                  type="date"
                                  min={today}
                                  max={maxAllowedDate}
                                  value={field.state.value ?? ""}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name="templateEndDate"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>End date</FieldLabel>
                                <Input
                                  type="date"
                                  min={today}
                                  max={maxAllowedDate}
                                  value={field.state.value ?? ""}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name="templateWeekdays"
                            children={(field) => (
                              <Field className="md:col-span-2">
                                <FieldLabel htmlFor={field.name}>Weekdays</FieldLabel>
                                <div className="grid grid-cols-2 gap-2">
                                  {TIME_SLOT_WEEKDAY_VALUES.map((weekday) => {
                                    const selected = (field.state.value ?? []).includes(weekday);
                                    return (
                                      <Button
                                        key={weekday}
                                        type="button"
                                        variant={selected ? "default" : "outline"}
                                        className="justify-start"
                                        onClick={() => {
                                          const current = field.state.value ?? [];
                                          field.handleChange(
                                            selected
                                              ? current.filter((item) => item !== weekday)
                                              : [...current, weekday],
                                          );
                                        }}
                                      >
                                        {TIME_SLOT_WEEKDAY_LABEL_EN[weekday]}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </Field>
                            )}
                          />
                          <form.Field
                            name="templatePrice"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Template price</FieldLabel>
                                <Input
                                  type="number"
                                  min={0}
                                  value={field.state.value ?? 0}
                                  onChange={(e) => field.handleChange(Number(e.target.value))}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name="templateStartTime"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>Start time</FieldLabel>
                                <Input
                                  type="time"
                                  step={60}
                                  value={field.state.value ?? ""}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                          <form.Field
                            name="templateEndTime"
                            children={(field) => (
                              <Field>
                                <FieldLabel htmlFor={field.name}>End time</FieldLabel>
                                <Input
                                  type="time"
                                  step={60}
                                  value={field.state.value ?? ""}
                                  onChange={(e) => field.handleChange(e.target.value)}
                                />
                              </Field>
                            )}
                          />
                        </>
                      ) : null
                    }
                  </form.Subscribe>
                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        const config = buildTimeSlotConfig(form.state.values);
                        if (!config) {
                          setAddSlotError("Please complete all required fields before saving.");
                          return;
                        }
                        const validationError = validateTimeSlotConfig(config);
                        if (validationError) {
                          setAddSlotError(validationError);
                          return;
                        }
                        setAddSlotError(null);
                        setPendingTimeSlotConfigs((prev) => [...prev, config]);
                        form.setFieldValue("slotMode", "none");
                      }}
                    >
                      Save time slot
                    </Button>
                    {addSlotError ? (
                      <p className="text-destructive mt-2 text-sm">{addSlotError}</p>
                    ) : null}
                    <p className="text-muted-foreground mt-2 text-xs">
                      You can only add time slots from today up to 30 days ahead.
                    </p>
                  </div>
                </div>
              ) : null}
              {pendingTimeSlotConfigs.length > 0 ? (
                <div className="space-y-2 rounded-md border border-dashed p-2">
                  <div className="text-sm font-medium">Pending time slots</div>
                  {pendingTimeSlotConfigs.map((config, index) => (
                    <div key={`pending-${index}`} className="flex items-center justify-between text-sm">
                      <div className="text-muted-foreground">
                        {config.manualSlots
                          ? `${config.manualSlots[0]?.date} ${config.manualSlots[0]?.startTime} - ${config.manualSlots[0]?.endTime}`
                          : `Template ${config.templateGeneration?.startDate} -> ${config.templateGeneration?.endDate} | ${config.templateGeneration?.startTime} - ${config.templateGeneration?.endTime}`}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPendingTimeSlotConfigs((prev) => prev.filter((_, item) => item !== index))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {isTimeSlotsLoading ? (
                  <div className="text-muted-foreground text-sm">Loading time slots...</div>
                ) : courtTimeSlots.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    No time slots available for this court.
                  </div>
                ) : (
                  courtTimeSlots.map((slot) => (
                    <div key={slot.id} className="rounded-md border p-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">
                            {slot.date} {slot.startTime} - {slot.endTime}
                          </div>
                          <div className="text-muted-foreground">
                            {slot.price.toLocaleString()} VND - {slot.status}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingSlotId(slot.id);
                            setSlotDate(slot.date);
                            setSlotStartTime(slot.startTime);
                            setSlotEndTime(slot.endTime);
                            setSlotPrice(slot.price);
                          }}
                        >
                          Edit slot
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {editingSlotId ? (
              <div className="grid gap-2 rounded-lg border border-dashed p-3 md:col-span-2">
                <div className="text-sm font-medium">Edit time slot</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={slotDate}
                    onChange={(e) => setSlotDate(e.target.value)}
                  />
                  <Input
                    type="number"
                    min={0}
                    value={slotPrice}
                    onChange={(e) => setSlotPrice(Number(e.target.value))}
                  />
                  <Input
                    type="time"
                    step={60}
                    value={slotStartTime}
                    onChange={(e) => setSlotStartTime(e.target.value)}
                  />
                  <Input
                    type="time"
                    step={60}
                    value={slotEndTime}
                    onChange={(e) => setSlotEndTime(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      onUpdateTimeSlot(editingSlotId, {
                        courtId: court?.id ?? "",
                        date: slotDate,
                        startTime: slotStartTime,
                        endTime: slotEndTime,
                        price: slotPrice,
                      });
                      setEditingSlotId(null);
                    }}
                    disabled={isSavingTimeSlot}
                  >
                    Save slot
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSlotId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating || isUpdating}>
              {isCreating || isUpdating
                ? "Saving..."
                : mode === "create"
                  ? "Create court"
                  : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
