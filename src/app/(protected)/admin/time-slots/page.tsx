"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourts } from "@/hooks/useCourt";
import {
  useCreateTimeSlot,
  useDeleteTimeSlot,
  useTimeSlots,
  useUpdateTimeSlot,
} from "@/hooks/useTimeSlot";
import { TIME_SLOT_STATUS_VALUES } from "@/lib/constants/time-slot.constant";
import type { TimeSlotStatus } from "@/lib/constants/time-slot.constant";

const schema = z.object({
  courtId: z.string().min(1, "Court is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(4, "Start time is required"),
  endTime: z.string().min(4, "End time is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  status: z.enum(TIME_SLOT_STATUS_VALUES as [TimeSlotStatus, ...TimeSlotStatus[]]),
});
type FormValue = z.infer<typeof schema>;

export default function AdminTimeSlotsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const courtsQuery = useCourts({ current: 1, limit: 200 });
  const timeSlotsQuery = useTimeSlots({ current: page, limit });
  const createMutation = useCreateTimeSlot();
  const updateMutation = useUpdateTimeSlot();
  const deleteMutation = useDeleteTimeSlot();

  const form = useForm<FormValue>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      courtId: "",
      date: "",
      startTime: "06:00",
      endTime: "07:00",
      price: 100000,
      status: "available",
    },
  });

  const submit = (values: FormValue) => {
    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload: values },
        {
          onSuccess: () => {
            setEditingId(null);
            setIsCreateOpen(false);
            form.reset();
          },
        },
      );
      return;
    }

    createMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      },
    });
  };

  const rows = timeSlotsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Manage time slots" description="Create and maintain court time slots" />

      <div className="surface-card flex items-center gap-2 p-4">
        <Button
          onClick={() => {
            setEditingId(null);
            form.reset();
            setIsCreateOpen(true);
          }}
        >
          Create new
        </Button>
      </div>

      {timeSlotsQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState title="No time slots found" />
      ) : (
        <div className="surface-card p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Court</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell>{slot.courtId.slice(0, 8)}</TableCell>
                  <TableCell>{slot.date}</TableCell>
                  <TableCell>
                    {slot.startTime} - {slot.endTime}
                  </TableCell>
                  <TableCell>{slot.status}</TableCell>
                  <TableCell className="text-right">{slot.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => {
                        setEditingId(slot.id);
                        form.reset({
                          courtId: slot.courtId,
                          date: slot.date,
                          startTime: slot.startTime,
                          endTime: slot.endTime,
                          price: slot.price,
                          status: slot.status,
                        });
                        setIsCreateOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(slot.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-end gap-2 p-2">
        <TablePagination
          currentPage={timeSlotsQuery.data?.current ?? page}
          total={timeSlotsQuery.data?.total ?? 0}
          pageSize={limit}
          onChangePage={setPage}
          onChangePageSize={(value) => {
            setPage(1);
            setLimit(value);
          }}
        />
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit time slot" : "Create time slot"}</DialogTitle>
            <DialogDescription>Fill slot information below.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(submit)}>
              <FormField
                control={form.control}
                name="courtId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Court</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select court" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(courtsQuery.data?.items ?? []).map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name}
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
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start time</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End time</FormLabel>
                    <FormControl>
                      <Input type="time" step={60} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_SLOT_STATUS_VALUES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingId
                      ? "Save changes"
                      : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
