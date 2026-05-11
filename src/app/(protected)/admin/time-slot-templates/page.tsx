"use client";

import { Eye, Pencil, RefreshCcw, SlidersHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  useTimeSlotTemplates,
  useCreateTimeSlotTemplate,
  useUpdateTimeSlotTemplate,
  useDeleteTimeSlotTemplate,
} from "@/hooks/useTimeSlot";
import { useDebounce } from "@/hooks/useDebounce";
import type { TimeSlotTemplate } from "@/types/time-slot.type";
import { TIME_SLOT_WEEKDAY_LABEL_EN } from "@/lib/constants/time-slot.constant";
import { TimeSlotTemplateFormDialog } from "./dialogs/time-slot-template-form-dialog";
import { TimeSlotTemplateGroupDialog } from "./dialogs/time-slot-template-group-dialog";

export default function AdminTimeSlotTemplatesPage() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  
  // Dialog States
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TimeSlotTemplate | null>(null);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);
  
  const [selectedGroup, setSelectedGroup] = useState<TimeSlotTemplate[] | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  const debouncedKeyword = useDebounce(keyword.trim(), 500);

  const templatesQuery = useTimeSlotTemplates({
    current,
    limit: pageSize,
    name: debouncedKeyword || undefined,
  });

  const createTemplateMutation = useCreateTimeSlotTemplate();
  const updateTemplateMutation = useUpdateTimeSlotTemplate();
  const deleteTemplateMutation = useDeleteTimeSlotTemplate();

  const pageItems = templatesQuery.data?.items ?? [];

  // Group items by Venue + Name + Court
  const groupedTemplates = useMemo(() => {
    const groups = new Map<string, TimeSlotTemplate[]>();
    pageItems.forEach((item) => {
      const key = `${item.venueId}_${item.name}_${item.courtId}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    });
    return Array.from(groups.values());
  }, [pageItems]);

  const submit = async (values: any) => {
    try {
      await createTemplateMutation.mutateAsync(values);
      setFormMode(null);
      templatesQuery.refetch();
    } catch {}
  };

  const submitEdit = async (values: any) => {
    if (!editingTemplate) return;
    try {
      const { weekdays, ...rest } = values;
      await updateTemplateMutation.mutateAsync({
        id: editingTemplate.id,
        payload: { ...rest, weekday: weekdays[0] },
      });
      setEditingTemplate(null);
      setFormMode(null);
      
      // Update selected group locally if the group dialog is open
      if (selectedGroup) {
        setSelectedGroup(prev => 
          prev?.map(item => 
            item.id === editingTemplate.id 
              ? { ...item, ...rest, weekday: weekdays[0] } 
              : item
          ) ?? null
        );
      }
      templatesQuery.refetch();
    } catch {}
  };

  const handleDeleteTemplate = async () => {
    if (!deleteTemplateId) return;
    try {
      await deleteTemplateMutation.mutateAsync(deleteTemplateId);
      setDeleteTemplateId(null);
      
      // Update selected group locally if the group dialog is open
      if (selectedGroup) {
        const newGroup = selectedGroup.filter(item => item.id !== deleteTemplateId);
        if (newGroup.length === 0) {
          setSelectedGroup(null); // Close dialog if group is empty
        } else {
          setSelectedGroup(newGroup);
        }
      }
      templatesQuery.refetch();
    } catch {}
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroupId) return;
    try {
      const groupToDelete = groupedTemplates.find(g => `${g[0].venueId}_${g[0].name}_${g[0].courtId}` === deleteGroupId);
      if (groupToDelete) {
        for (const template of groupToDelete) {
          await deleteTemplateMutation.mutateAsync(template.id);
        }
      }
      setDeleteGroupId(null);
      templatesQuery.refetch();
    } catch {}
  };

  useEffect(() => {
    setCurrent(1);
  }, [debouncedKeyword]);

  const openCreateTemplate = () => {
    setEditingTemplate(null);
    setFormMode("create");
  };

  const openEditTemplate = (template: TimeSlotTemplate) => {
    setEditingTemplate(template);
    setFormMode("edit");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Time Slot Templates" description="Manage reusable schedules for courts" />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Input
          placeholder="Search by template name"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          className="w-full md:max-w-sm"
        />
        <Button variant="outline" onClick={() => templatesQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button onClick={openCreateTemplate}>Create new</Button>
      </div>

      {templatesQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : groupedTemplates.length === 0 ? (
        <EmptyState title="No templates found" />
      ) : (
        <div className="surface-card p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Group</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Court Override</TableHead>
                <TableHead>Weekdays</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedTemplates.map((group) => {
                const first = group[0];
                const groupId = `${first.venueId}_${first.name}_${first.courtId}`;
                const days = group.map(i => TIME_SLOT_WEEKDAY_LABEL_EN[i.weekday]).join(", ");
                const allActive = group.every(i => i.isActive);
                const someActive = group.some(i => i.isActive);
                
                return (
                  <TableRow 
                    key={groupId} 
                    className="cursor-pointer"
                    onClick={() => setSelectedGroup(group)}
                  >
                    <TableCell className="font-medium">{first.name}</TableCell>
                    <TableCell>{first.venue?.name ?? "Unknown Venue"}</TableCell>
                    <TableCell>
                      {first.court?.name ?? (
                        <span className="text-muted-foreground italic">None (Applies to Venue)</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={days}>{days}</TableCell>
                    <TableCell>
                      {first.startTime} - {first.endTime}
                    </TableCell>
                    <TableCell>{first.price.toLocaleString()} VND</TableCell>
                    <TableCell>
                      <Badge variant={allActive ? "success" : someActive ? "warning" : "outline"}>
                        {allActive ? "Active" : someActive ? "Partial" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGroup(group);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteGroupId(groupId);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Card className="flex flex-wrap items-center justify-end gap-2 p-2">
        <TablePagination
          currentPage={templatesQuery.data?.current ?? current}
          total={templatesQuery.data?.total ?? 0}
          pageSize={pageSize}
          onChangePage={setCurrent}
          onChangePageSize={(value) => {
            setCurrent(1);
            setPageSize(value);
          }}
        />
      </Card>

      <TimeSlotTemplateGroupDialog
        group={selectedGroup}
        onOpenChange={(open) => !open && setSelectedGroup(null)}
        onEditItem={openEditTemplate}
        onDeleteItem={setDeleteTemplateId}
      />

      <TimeSlotTemplateFormDialog
        mode={formMode}
        template={editingTemplate}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setFormMode(null);
            setEditingTemplate(null);
          }
        }}
        onCreate={submit}
        onEdit={submitEdit}
        isCreating={createTemplateMutation.isPending}
        isUpdating={updateTemplateMutation.isPending}
      />

      {/* Delete Single Template Alert */}
      <AlertDialog
        open={!!deleteTemplateId}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteTemplateId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete specific day?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The template rule for this specific day will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Group Alert */}
      <AlertDialog
        open={!!deleteGroupId}
        onOpenChange={(open: boolean) => {
          if (!open) setDeleteGroupId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete entire group?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All template rules within this group will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
