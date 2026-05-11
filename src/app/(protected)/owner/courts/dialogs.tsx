"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import { EmptyState } from "@/components/shared/empty-state";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TIME_SLOT_WEEKDAY_LABEL_VI,
  TIME_SLOT_WEEKDAY_VALUES,
} from "@/lib/constants/time-slot.constant";
import type { Court } from "@/types/court.type";
import type { UpdateTimeSlotRequest } from "@/types/time-slot.type";

type CreateCourtForm = {
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
};

interface SimpleOption {
  id: string;
  name: string;
}

interface CourtDetailData {
  id: string;
  name: string;
  venueId: string;
  sportId: string;
  pricePerHour: number;
  status: string;
  imageUrl?: string | null;
  venue?: { name?: string } | null;
  sport?: { name?: string } | null;
}
interface CourtTimeSlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
}

interface OwnerCourtsDialogsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftFilterVenueId: string;
  setDraftFilterVenueId: (value: string) => void;
  draftFilterSportId: string;
  setDraftFilterSportId: (value: string) => void;
  venues: SimpleOption[];
  sports: SimpleOption[];
  setFilterVenueId: (value: string) => void;
  setFilterSportId: (value: string) => void;
  setPage: (value: number) => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  form: UseFormReturn<CreateCourtForm>;
  submit: (values: CreateCourtForm) => void;
  createCourtMutation: { isPending: boolean };
  editingCourt: Court | null;
  setEditingCourt: (value: Court | null) => void;
  editForm: UseFormReturn<CreateCourtForm>;
  submitEdit: (values: CreateCourtForm) => void;
  updateCourtMutation: { isPending: boolean };
  detailCourtId: string | null;
  setDetailCourtId: (value: string | null) => void;
  detailCourtQuery: {
    isLoading: boolean;
    data?: CourtDetailData | null;
  };
  courtTimeSlots: CourtTimeSlotItem[];
  isTimeSlotsLoading: boolean;
  onAddTimeSlotFromConfig: () => void;
  onUpdateTimeSlot: (
    id: string,
    payload: UpdateTimeSlotRequest,
  ) => void;
  isSavingTimeSlot: boolean;
}

export function OwnerCourtsDialogs(props: OwnerCourtsDialogsProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftFilterVenueId,
    setDraftFilterVenueId,
    draftFilterSportId,
    setDraftFilterSportId,
    venues,
    sports,
    setFilterVenueId,
    setFilterSportId,
    setPage,
    isCreateOpen,
    setIsCreateOpen,
    form,
    submit,
    createCourtMutation,
    editingCourt,
    setEditingCourt,
    editForm,
    submitEdit,
    updateCourtMutation,
    detailCourtId,
    setDetailCourtId,
    detailCourtQuery,
    courtTimeSlots,
    isTimeSlotsLoading,
    onAddTimeSlotFromConfig,
    onUpdateTimeSlot,
    isSavingTimeSlot,
  } = props;
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotDate, setSlotDate] = useState("");
  const [slotStartTime, setSlotStartTime] = useState("06:00");
  const [slotEndTime, setSlotEndTime] = useState("07:00");
  const [slotPrice, setSlotPrice] = useState(100000);

  return (
    <>
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter courts</DialogTitle>
            <DialogDescription>Apply backend filters by venue and sport.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Venue</div>
              <Select value={draftFilterVenueId} onValueChange={setDraftFilterVenueId}>
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
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Sport</div>
              <Select value={draftFilterSportId} onValueChange={setDraftFilterSportId}>
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
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDraftFilterVenueId("all");
                setDraftFilterSportId("all");
                setFilterVenueId("all");
                setFilterSportId("all");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setFilterVenueId(draftFilterVenueId);
                setFilterSportId(draftFilterSportId);
                setIsFilterOpen(false);
              }}
            >
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create court</DialogTitle>
            <DialogDescription>Add a new court in your venues.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="venueId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select venue" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {venues.map((venue) => (
                          <SelectItem key={venue.id} value={venue.id}>
                            {venue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sport</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sport" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="pricePerHour" render={({ field }) => (
                <FormItem><FormLabel>Price per hour</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Image URL (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField
                control={form.control}
                name="slotMode"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Time-slot setup</FormLabel>
                    <Select value={field.value ?? "none"} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select setup mode" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">No setup</SelectItem>
                        <SelectItem value="manual">Create one manual slot</SelectItem>
                        <SelectItem value="template">Generate by template</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("slotMode") === "manual" ? (
                <>
                  <FormField control={form.control} name="manualDate" render={({ field }) => (
                    <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="manualPrice" render={({ field }) => (
                    <FormItem><FormLabel>Slot price</FormLabel><FormControl><Input type="number" min={0} value={field.value ?? 0} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="manualStartTime" render={({ field }) => (
                    <FormItem><FormLabel>Start time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="manualEndTime" render={({ field }) => (
                    <FormItem><FormLabel>End time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </>
              ) : null}
              {form.watch("slotMode") === "template" ? (
                <>
                  <FormField control={form.control} name="templateStartDate" render={({ field }) => (
                    <FormItem><FormLabel>Start date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="templateEndDate" render={({ field }) => (
                    <FormItem><FormLabel>End date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField
                    control={form.control}
                    name="templateWeekdays"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Weekdays</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_SLOT_WEEKDAY_VALUES.map((weekday) => {
                            const selected = (field.value ?? []).includes(weekday);
                            return (
                              <Button
                                key={weekday}
                                type="button"
                                variant={selected ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => {
                                  const current = field.value ?? [];
                                  if (selected) {
                                    field.onChange(current.filter((item) => item !== weekday));
                                  } else {
                                    field.onChange([...current, weekday]);
                                  }
                                }}
                              >
                                {TIME_SLOT_WEEKDAY_LABEL_VI[weekday]}
                              </Button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="templatePrice" render={({ field }) => (
                    <FormItem><FormLabel>Template price</FormLabel><FormControl><Input type="number" min={0} value={field.value ?? 0} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="templateStartTime" render={({ field }) => (
                    <FormItem><FormLabel>Start time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="templateEndTime" render={({ field }) => (
                    <FormItem><FormLabel>End time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </>
              ) : null}
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={createCourtMutation.isPending}>
                  {createCourtMutation.isPending ? "Creating..." : "Create court"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCourt} onOpenChange={(open) => {
        if (!open) {
          setEditingCourt(null);
          editForm.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit court</DialogTitle>
            <DialogDescription>Update court details, pricing and relationships.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={editForm.handleSubmit(submitEdit)}>
              <FormField control={editForm.control} name="venueId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select venue" /></SelectTrigger></FormControl>
                    <SelectContent>{venues.map((venue) => <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="sportId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Sport</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger></FormControl>
                    <SelectContent>{sports.map((sport) => <SelectItem key={sport.id} value={sport.id}>{sport.name}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="pricePerHour" render={({ field }) => (
                <FormItem><FormLabel>Price per hour</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={editForm.control} name="imageUrl" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Image URL (optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField
                control={editForm.control}
                name="slotMode"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Time-slot setup</FormLabel>
                    <Select value={field.value ?? "none"} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select setup mode" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">No setup</SelectItem>
                        <SelectItem value="manual">Create one manual slot</SelectItem>
                        <SelectItem value="template">Generate by template</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editForm.watch("slotMode") === "manual" ? (
                <>
                  <FormField control={editForm.control} name="manualDate" render={({ field }) => (
                    <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="manualPrice" render={({ field }) => (
                    <FormItem><FormLabel>Slot price</FormLabel><FormControl><Input type="number" min={0} value={field.value ?? 0} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="manualStartTime" render={({ field }) => (
                    <FormItem><FormLabel>Start time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="manualEndTime" render={({ field }) => (
                    <FormItem><FormLabel>End time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </>
              ) : null}
              {editForm.watch("slotMode") === "template" ? (
                <>
                  <FormField control={editForm.control} name="templateStartDate" render={({ field }) => (
                    <FormItem><FormLabel>Start date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="templateEndDate" render={({ field }) => (
                    <FormItem><FormLabel>End date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField
                    control={editForm.control}
                    name="templateWeekdays"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Weekdays</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_SLOT_WEEKDAY_VALUES.map((weekday) => {
                            const selected = (field.value ?? []).includes(weekday);
                            return (
                              <Button
                                key={weekday}
                                type="button"
                                variant={selected ? "default" : "outline"}
                                className="justify-start"
                                onClick={() => {
                                  const current = field.value ?? [];
                                  if (selected) {
                                    field.onChange(current.filter((item) => item !== weekday));
                                  } else {
                                    field.onChange([...current, weekday]);
                                  }
                                }}
                              >
                                {TIME_SLOT_WEEKDAY_LABEL_VI[weekday]}
                              </Button>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={editForm.control} name="templatePrice" render={({ field }) => (
                    <FormItem><FormLabel>Template price</FormLabel><FormControl><Input type="number" min={0} value={field.value ?? 0} onChange={(e)=>field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="templateStartTime" render={({ field }) => (
                    <FormItem><FormLabel>Start time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={editForm.control} name="templateEndTime" render={({ field }) => (
                    <FormItem><FormLabel>End time</FormLabel><FormControl><Input type="time" step={60} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </>
              ) : null}
              <div className="md:col-span-2 space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Time slots hiện có</div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={onAddTimeSlotFromConfig}
                    disabled={isSavingTimeSlot}
                  >
                    {isSavingTimeSlot ? "Đang thêm..." : "Thêm time slot"}
                  </Button>
                </div>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {isTimeSlotsLoading ? (
                    <div className="text-sm text-muted-foreground">Đang tải time slot...</div>
                  ) : courtTimeSlots.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Chưa có time slot nào cho court này.</div>
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
                <div className="md:col-span-2 grid gap-2 rounded-lg border border-dashed p-3">
                  <div className="text-sm font-medium">Chỉnh sửa time slot</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" value={slotDate} onChange={(e) => setSlotDate(e.target.value)} />
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
                          courtId: editingCourt?.id ?? "",
                          date: slotDate,
                          startTime: slotStartTime,
                          endTime: slotEndTime,
                          price: slotPrice,
                        });
                        setEditingSlotId(null);
                      }}
                      disabled={isSavingTimeSlot}
                    >
                      Lưu slot
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditingSlotId(null)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              ) : null}
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={updateCourtMutation.isPending}>
                  {updateCourtMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailCourtId} onOpenChange={(open) => !open && setDetailCourtId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Court detail</DialogTitle>
            <DialogDescription>Data loaded from court detail API.</DialogDescription>
          </DialogHeader>
          {detailCourtQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : detailCourtQuery.data ? (
            <div className="space-y-4">
              {detailCourtQuery.data.imageUrl ? (
                <img src={detailCourtQuery.data.imageUrl} alt={detailCourtQuery.data.name} className="h-44 w-full rounded-lg border object-cover" />
              ) : null}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Name</div><div className="font-medium">{detailCourtQuery.data.name}</div></div>
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Status</div><div className="font-medium capitalize">{detailCourtQuery.data.status}</div></div>
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Venue</div><div className="font-medium">{detailCourtQuery.data.venue?.name ?? detailCourtQuery.data.venueId}</div></div>
                <div className="rounded-md border p-3"><div className="text-muted-foreground">Sport</div><div className="font-medium">{detailCourtQuery.data.sport?.name ?? detailCourtQuery.data.sportId}</div></div>
                <div className="rounded-md border p-3 col-span-2"><div className="text-muted-foreground">Price/hour</div><div className="font-medium">{detailCourtQuery.data.pricePerHour.toLocaleString()} VND</div></div>
              </div>
            </div>
          ) : (
            <EmptyState title="No detail found" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
