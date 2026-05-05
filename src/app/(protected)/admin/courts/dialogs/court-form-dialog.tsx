"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIME_SLOT_WEEKDAY_LABEL_VI, TIME_SLOT_WEEKDAY_VALUES } from "@/lib/constants/time-slot.constant";
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
  onAddTimeSlotFromConfig: (values: CourtFormValue) => void;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: CourtFormValue) => void;
  onEdit: (values: CourtFormValue) => void;
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
    onAddTimeSlotFromConfig,
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
      if (mode === "create") onCreate(value);
      if (mode === "edit") onEdit(value);
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
    setEditingSlotId(null);
  }, [defaultValues, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
            <form.Field name="venueId" children={(field) => (
              <Field><FieldLabel htmlFor={field.name}>Venue</FieldLabel><Select value={field.state.value} onValueChange={field.handleChange}><SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger><SelectContent>{venues.map((venue)=><SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>)}</SelectContent></Select></Field>
            )} />
            <form.Field name="sportId" children={(field) => (
              <Field><FieldLabel htmlFor={field.name}>Sport</FieldLabel><Select value={field.state.value} onValueChange={field.handleChange}><SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger><SelectContent>{sports.map((sport)=><SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>)}</SelectContent></Select></Field>
            )} />
            <form.Field name="name" children={(field) => <Field><FieldLabel htmlFor={field.name}>Name</FieldLabel><Input value={field.state.value} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
            <form.Field name="pricePerHour" children={(field) => <Field><FieldLabel htmlFor={field.name}>Price per hour</FieldLabel><Input type="number" value={field.state.value} onChange={(e)=>field.handleChange(Number(e.target.value))} /></Field>} />
            <form.Field name="imageUrl" children={(field) => <Field className="md:col-span-2"><FieldLabel htmlFor={field.name}>Image URL (optional)</FieldLabel><Input value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
            <form.Field
              name="slotMode"
              children={(field) => (
                <Field className="md:col-span-2">
                  <FieldLabel htmlFor={field.name}>Time-slot setup</FieldLabel>
                  <Select value={field.state.value ?? "none"} onValueChange={field.handleChange}>
                    <SelectTrigger><SelectValue placeholder="Select setup mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No setup</SelectItem>
                      <SelectItem value="manual">Create one manual slot</SelectItem>
                      <SelectItem value="template">Generate by template</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            {form.getFieldValue("slotMode") === "manual" ? (
              <>
                <form.Field name="manualDate" children={(field)=><Field><FieldLabel htmlFor={field.name}>Date</FieldLabel><Input type="date" value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
                <form.Field name="manualPrice" children={(field)=><Field><FieldLabel htmlFor={field.name}>Slot price</FieldLabel><Input type="number" min={0} value={field.state.value ?? 0} onChange={(e)=>field.handleChange(Number(e.target.value))} /></Field>} />
                <form.Field name="manualStartTime" children={(field)=><Field><FieldLabel htmlFor={field.name}>Start time</FieldLabel><Input type="time" step={60} value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
                <form.Field name="manualEndTime" children={(field)=><Field><FieldLabel htmlFor={field.name}>End time</FieldLabel><Input type="time" step={60} value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
              </>
            ) : null}
            {form.getFieldValue("slotMode") === "template" ? (
              <>
                <form.Field name="templateStartDate" children={(field)=><Field><FieldLabel htmlFor={field.name}>Start date</FieldLabel><Input type="date" value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
                <form.Field name="templateEndDate" children={(field)=><Field><FieldLabel htmlFor={field.name}>End date</FieldLabel><Input type="date" value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
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
                                field.handleChange(selected ? current.filter((item) => item !== weekday) : [...current, weekday]);
                              }}
                            >
                              {TIME_SLOT_WEEKDAY_LABEL_VI[weekday]}
                            </Button>
                          );
                        })}
                      </div>
                    </Field>
                  )}
                />
                <form.Field name="templatePrice" children={(field)=><Field><FieldLabel htmlFor={field.name}>Template price</FieldLabel><Input type="number" min={0} value={field.state.value ?? 0} onChange={(e)=>field.handleChange(Number(e.target.value))} /></Field>} />
                <form.Field name="templateStartTime" children={(field)=><Field><FieldLabel htmlFor={field.name}>Start time</FieldLabel><Input type="time" step={60} value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
                <form.Field name="templateEndTime" children={(field)=><Field><FieldLabel htmlFor={field.name}>End time</FieldLabel><Input type="time" step={60} value={field.state.value ?? ""} onChange={(e)=>field.handleChange(e.target.value)} /></Field>} />
              </>
            ) : null}
            <div className="md:col-span-2 space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Time slots hien co</div>
                <Button type="button" size="sm" onClick={() => onAddTimeSlotFromConfig(form.state.values)} disabled={isSavingTimeSlot}>
                  {isSavingTimeSlot ? "Dang them..." : "Them time slot"}
                </Button>
              </div>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {isTimeSlotsLoading ? (
                  <div className="text-sm text-muted-foreground">Dang tai time slot...</div>
                ) : courtTimeSlots.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Chua co time slot nao cho court nay.</div>
                ) : (
                  courtTimeSlots.map((slot) => (
                    <div key={slot.id} className="rounded-md border p-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{slot.date} {slot.startTime} - {slot.endTime}</div>
                          <div className="text-muted-foreground">{slot.price.toLocaleString()} VND - {slot.status}</div>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setEditingSlotId(slot.id); setSlotDate(slot.date); setSlotStartTime(slot.startTime); setSlotEndTime(slot.endTime); setSlotPrice(slot.price); }}>
                          Edit slot
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {editingSlotId ? (
              <div className="md:col-span-2 grid gap-2 rounded-lg border border-dashed p-3">
                <div className="text-sm font-medium">Chinh sua time slot</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
                  <Input type="number" min={0} value={slotPrice} onChange={(e) => setSlotPrice(Number(e.target.value))} />
                  <Input type="time" step={60} value={slotStartTime} onChange={(e) => setSlotStartTime(e.target.value)} />
                  <Input type="time" step={60} value={slotEndTime} onChange={(e) => setSlotEndTime(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={() => { onUpdateTimeSlot(editingSlotId, { courtId: court?.id ?? "", date: slotDate, startTime: slotStartTime, endTime: slotEndTime, price: slotPrice }); setEditingSlotId(null); }} disabled={isSavingTimeSlot}>
                    Luu slot
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditingSlotId(null)}>Huy</Button>
                </div>
              </div>
            ) : null}
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={isCreating || isUpdating}>{isCreating || isUpdating ? "Saving..." : mode === "create" ? "Create court" : "Save changes"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

