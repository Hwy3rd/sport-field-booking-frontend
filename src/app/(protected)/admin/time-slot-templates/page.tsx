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
  useCreateTimeSlotTemplate,
  useDeleteTimeSlotTemplate,
  useTimeSlotTemplates,
  useUpdateTimeSlotTemplate,
} from "@/hooks/useTimeSlot";
import {
  TIME_SLOT_WEEKDAY_LABEL_VI,
  TIME_SLOT_WEEKDAY_VALUES,
} from "@/lib/constants/time-slot.constant";
import type { TimeSlotWeekday } from "@/lib/constants/time-slot.constant";

const schema = z.object({
  courtId: z.string().min(1, "Court is required"),
  weekday: z.coerce
    .number()
    .refine((value) => TIME_SLOT_WEEKDAY_VALUES.includes(value as TimeSlotWeekday), {
      message: "Weekday is required",
    }),
  startTime: z.string().min(4, "Start time is required"),
  endTime: z.string().min(4, "End time is required"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  isActive: z.enum(["true", "false"]),
});
type FormValue = z.infer<typeof schema>;

export default function AdminTimeSlotTemplatesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const courtsQuery = useCourts({ current: 1, limit: 200 });
  const templatesQuery = useTimeSlotTemplates({ current: page, limit });
  const createMutation = useCreateTimeSlotTemplate();
  const updateMutation = useUpdateTimeSlotTemplate();
  const deleteMutation = useDeleteTimeSlotTemplate();

  const form = useForm<FormValue>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      courtId: "",
      weekday: 1,
      startTime: "06:00",
      endTime: "07:00",
      price: 100000,
      isActive: "true",
    },
  });

  const submit = (values: FormValue) => {
    const payload = {
      courtId: values.courtId,
      weekday: values.weekday as TimeSlotWeekday,
      startTime: values.startTime,
      endTime: values.endTime,
      price: values.price,
      isActive: values.isActive === "true",
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload },
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

    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      },
    });
  };

  const rows = templatesQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Manage slot templates" description="Maintain weekly time slot templates" />

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

      {templatesQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : rows.length === 0 ? (
        <EmptyState title="No templates found" />
      ) : (
        <div className="surface-card p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Court</TableHead>
                <TableHead>Weekday</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>{template.courtId.slice(0, 8)}</TableCell>
                  <TableCell>
                    {TIME_SLOT_WEEKDAY_LABEL_VI[template.weekday] ?? template.weekday}
                  </TableCell>
                  <TableCell>
                    {template.startTime} - {template.endTime}
                  </TableCell>
                  <TableCell>{template.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">{template.price.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-2"
                      onClick={() => {
                        setEditingId(template.id);
                        form.reset({
                          courtId: template.courtId,
                          weekday: template.weekday,
                          startTime: template.startTime,
                          endTime: template.endTime,
                          price: template.price,
                          isActive: template.isActive ? "true" : "false",
                        });
                        setIsCreateOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(template.id)}
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
          currentPage={templatesQuery.data?.current ?? page}
          total={templatesQuery.data?.total ?? 0}
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
            <DialogTitle>{editingId ? "Edit template" : "Create template"}</DialogTitle>
            <DialogDescription>Fill template information below.</DialogDescription>
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
                name="weekday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weekday</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select weekday" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIME_SLOT_WEEKDAY_VALUES.map((weekday) => (
                          <SelectItem key={weekday} value={String(weekday)}>
                            {TIME_SLOT_WEEKDAY_LABEL_VI[weekday]}
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
                name="isActive"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Active</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select active status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
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
