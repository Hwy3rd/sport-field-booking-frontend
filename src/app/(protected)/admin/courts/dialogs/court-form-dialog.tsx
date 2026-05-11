"use client";

import { useEffect, useState } from "react";
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
import type { Court } from "@/types/court.type";
import { TimeSlotTemplateService } from "@/services/time-slot-template.service";
import { useQuery } from "@tanstack/react-query";
import { useTimeSlotTemplates } from "@/hooks/useTimeSlot";
import { TIME_SLOT_WEEKDAY_LABEL_EN } from "@/lib/constants/time-slot.constant";
import { getLocalDateString } from "@/lib/helper/date";

type FormMode = "create" | "edit" | null;

interface Option {
  id: string;
  name: string;
}

export interface CourtTimeSlotConfigDraft {
  manualSlots?: {
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  }[];
}

export interface CourtFormValue {
  venueId: string;
  sportId: string;
  name: string;
  pricePerHour: number;
  imageUrl?: string;
  templateNames: string[];
  manualDate?: string;
  manualStartTime?: string;
  manualEndTime?: string;
  manualPrice?: number;
}

interface CourtFormDialogProps {
  mode: FormMode;
  court: Court | null;
  venues: Option[];
  sports: Option[];
  onOpenChange: (open: boolean) => void;
  onCreate: (values: CourtFormValue, pendingConfigs: CourtTimeSlotConfigDraft[]) => void;
  onEdit: (values: CourtFormValue, pendingConfigs: CourtTimeSlotConfigDraft[]) => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function CourtFormDialog(props: CourtFormDialogProps) {
  const {
    mode,
    court,
    venues,
    sports,
    onOpenChange,
    onCreate,
    onEdit,
    isCreating,
    isUpdating,
  } = props;
  const open = mode !== null;

  const [pendingTimeSlotConfigs, setPendingTimeSlotConfigs] = useState<CourtTimeSlotConfigDraft[]>(
    [],
  );
  const [addSlotError, setAddSlotError] = useState<string | null>(null);
  const [overlapWarning, setOverlapWarning] = useState<boolean>(false);

  const form = useForm({
    defaultValues: {
      venueId: court?.venueId ?? "",
      sportId: court?.sportId ?? "",
      name: court?.name ?? "",
      pricePerHour: court?.pricePerHour ?? 100000,
      imageUrl: court?.imageUrl ?? "",
      templateNames: court?.templateNames ?? [],
      manualDate: getLocalDateString(),
      manualStartTime: "06:00",
      manualEndTime: "07:00",
      manualPrice: court?.pricePerHour ?? 100000,
    } as CourtFormValue,
    onSubmit: ({ value }) => {
      if (overlapWarning) return;
      if (mode === "create") onCreate(value, pendingTimeSlotConfigs);
      if (mode === "edit") onEdit(value, pendingTimeSlotConfigs);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      venueId: court?.venueId ?? "",
      sportId: court?.sportId ?? "",
      name: court?.name ?? "",
      pricePerHour: court?.pricePerHour ?? 100000,
      imageUrl: court?.imageUrl ?? "",
      templateNames: court?.templateNames ?? [],
      manualDate: getLocalDateString(),
      manualStartTime: "06:00",
      manualEndTime: "07:00",
      manualPrice: court?.pricePerHour ?? 100000,
    });
    setPendingTimeSlotConfigs([]);
    setAddSlotError(null);
    setOverlapWarning(false);
  }, [court, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Create court" : "Edit court"}</DialogTitle>
          <DialogDescription>Update court details, pricing and time slot setup.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (overlapWarning) return;
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
                      form.setFieldValue("templateNames", []);
                    }}
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
                  <FieldLabel htmlFor={field.name}>Price per hour (Default)</FieldLabel>
                  <Input
                    type="number"
                    value={field.state.value}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      field.handleChange(val);
                      form.setFieldValue("manualPrice", val);
                    }}
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

            <div className="md:col-span-2 mt-4 space-y-4 rounded-xl border p-4 bg-muted/20">
              <div className="font-semibold text-sm">Time Slot Setup</div>
              
              <form.Subscribe selector={(state) => ({ venueId: state.values.venueId, templateNames: state.values.templateNames })}>
                {({ venueId, templateNames }) => (
                  <VenueTemplateSelector 
                    form={form as any} 
                    venueId={venueId} 
                    templateNames={templateNames} 
                    onOverlapWarning={setOverlapWarning}
                  />
                )}
              </form.Subscribe>

              <div className="border-t pt-4 mt-4">
                <div className="text-sm font-semibold mb-3">Draft Manual Time Slots</div>
                <div className="grid gap-3 rounded-xl border border-dashed bg-background p-4 md:grid-cols-2">
                  <form.Field
                    name="manualDate"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Date</FieldLabel>
                        <Input
                          type="date"
                          min={getLocalDateString()}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </Field>
                    )}
                  />
                  <form.Field
                    name="manualPrice"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Price</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(Number(e.target.value))}
                        />
                      </Field>
                    )}
                  />
                  <form.Field
                    name="manualStartTime"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Start Time</FieldLabel>
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
                    name="manualEndTime"
                    children={(field) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>End Time</FieldLabel>
                        <Input
                          type="time"
                          step={60}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </Field>
                    )}
                  />

                  <div className="md:col-span-2 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const values = form.store.state.values;
                        if (!values.manualDate || !values.manualStartTime || !values.manualEndTime) {
                          setAddSlotError("Please fill in all time slot fields.");
                          return;
                        }
                        if (values.manualStartTime >= values.manualEndTime) {
                          setAddSlotError("Start time must be before end time.");
                          return;
                        }
                        const config: CourtTimeSlotConfigDraft = {
                          manualSlots: [
                            {
                              date: values.manualDate,
                              startTime: values.manualStartTime,
                              endTime: values.manualEndTime,
                              price: values.manualPrice ?? values.pricePerHour,
                            },
                          ],
                        };
                        setAddSlotError(null);
                        setPendingTimeSlotConfigs((prev) => [...prev, config]);
                      }}
                    >
                      Add to pending
                    </Button>
                    {addSlotError ? (
                      <p className="text-destructive mt-2 text-sm">{addSlotError}</p>
                    ) : null}
                  </div>
                </div>

                {pendingTimeSlotConfigs.length > 0 ? (
                  <div className="space-y-2 rounded-md border border-dashed p-3 mt-4 bg-background">
                    <div className="text-sm font-medium">Pending manual time slots</div>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                      {pendingTimeSlotConfigs.map((config, index) => (
                        <div key={`pending-${index}`} className="flex items-center justify-between text-sm bg-muted/20 p-2 rounded-md">
                          <div className="text-muted-foreground">
                            {config.manualSlots && 
                              `${config.manualSlots[0]?.date} | ${config.manualSlots[0]?.startTime} - ${config.manualSlots[0]?.endTime} | ${config.manualSlots[0]?.price.toLocaleString()} VND`}
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-destructive h-8"
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
                    <p className="text-xs text-muted-foreground pt-1">
                      These slots will be generated after the court is created.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating || isUpdating || overlapWarning}>
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

function VenueTemplateSelector({ form, venueId, templateNames, onOverlapWarning }: { form: any, venueId: string, templateNames: string[], onOverlapWarning: (warning: boolean) => void }) {
  const { data: availableGroups = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["template-group-names", venueId],
    queryFn: () => TimeSlotTemplateService.getGroupNames(venueId),
    enabled: !!venueId,
  });

  return (
    <div className="space-y-4">
      <form.Field
        name="templateNames"
        children={(field: any) => (
          <Field>
            <FieldLabel htmlFor={field.name}>Time Slot Template Groups</FieldLabel>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {isLoadingTemplates ? (
                <div className="text-sm text-muted-foreground">Loading templates...</div>
              ) : availableGroups.length === 0 ? (
                <div className="text-sm text-muted-foreground">No templates available for this venue.</div>
              ) : (
                availableGroups.map((name) => {
                  const checked = field.state.value.includes(name);
                  return (
                    <div key={name} className="flex items-center space-x-2 p-2 border rounded-md bg-background">
                      <Checkbox 
                        id={`template-${name}`}
                        checked={checked}
                        onCheckedChange={(isChecked) => {
                          if (isChecked) {
                            field.handleChange([...field.state.value, name]);
                          } else {
                            field.handleChange(field.state.value.filter((n: string) => n !== name));
                          }
                        }}
                      />
                      <label 
                        htmlFor={`template-${name}`}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        {name}
                      </label>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-muted-foreground text-xs mt-2">
              Select one or more templates to automatically generate ongoing time slots for this court.
            </p>
          </Field>
        )}
      />

      {templateNames && templateNames.length > 0 && (
        <TemplateDetailsPreview venueId={venueId} templateNames={templateNames} onOverlapWarning={onOverlapWarning} />
      )}
    </div>
  );
}

function TemplateDetailsPreview({ venueId, templateNames, onOverlapWarning }: { venueId: string, templateNames: string[], onOverlapWarning: (warning: boolean) => void }) {
  const templatesQuery = useTimeSlotTemplates(
    { current: 1, limit: 1000, venueId }
  );

  const items = templatesQuery.data?.items ?? [];
  const selectedItems = items.filter(item => templateNames.includes(item.name));

  // Check overlap
  let hasOverlap = false;
  const byWeekday = new Map<number, typeof selectedItems>();
  for (const t of selectedItems) {
    if (!byWeekday.has(t.weekday)) byWeekday.set(t.weekday, []);
    byWeekday.get(t.weekday)!.push(t);
  }

  for (const [weekday, dayTemplates] of byWeekday) {
    for (let i = 0; i < dayTemplates.length; i++) {
      for (let j = i + 1; j < dayTemplates.length; j++) {
        const t1 = dayTemplates[i];
        const t2 = dayTemplates[j];
        if (t1.startTime < t2.endTime && t1.endTime > t2.startTime) {
          hasOverlap = true;
          break;
        }
      }
    }
  }

  useEffect(() => {
    onOverlapWarning(hasOverlap);
  }, [hasOverlap, onOverlapWarning]);

  if (templatesQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading template details...</div>;
  }

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border bg-background p-4 mt-2">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold">Template Rules Preview</div>
        {hasOverlap && (
          <div className="text-xs font-semibold text-destructive px-2 py-1 bg-destructive/10 rounded-md">
            Warning: Overlapping Templates Detected
          </div>
        )}
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
        {selectedItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-muted/20 rounded-md">
            <div>
              <span className="font-medium mr-2">{TIME_SLOT_WEEKDAY_LABEL_EN[item.weekday]}</span>
              <span className="text-muted-foreground">{item.startTime} - {item.endTime}</span>
              <span className="ml-2 text-xs text-muted-foreground">({item.name})</span>
            </div>
            <div className="font-semibold">{item.price.toLocaleString()} VND</div>
          </div>
        ))}
      </div>
    </div>
  );
}
