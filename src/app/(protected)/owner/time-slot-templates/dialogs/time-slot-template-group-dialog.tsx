"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TIME_SLOT_WEEKDAY_LABEL_EN } from "@/lib/constants/time-slot.constant";
import type { TimeSlotTemplate } from "@/types/time-slot.type";

interface TimeSlotTemplateGroupDialogProps {
  group: TimeSlotTemplate[] | null;
  onOpenChange: (open: boolean) => void;
  onEditItem: (item: TimeSlotTemplate) => void;
  onDeleteItem: (id: string) => void;
}

export function TimeSlotTemplateGroupDialog(props: TimeSlotTemplateGroupDialogProps) {
  const { group, onOpenChange, onEditItem, onDeleteItem } = props;
  const open = group !== null && group.length > 0;

  if (!group || group.length === 0) return null;

  const firstItem = group[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Template Group Details</DialogTitle>
          <DialogDescription>
            Manage individual days for the <strong>{firstItem.name}</strong> template.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 my-4 p-4 rounded-lg bg-muted/20 border">
          <div>
            <div className="text-xs text-muted-foreground">Venue</div>
            <div className="font-medium">{firstItem.venue?.name ?? "Unknown Venue"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Court Override</div>
            <div className="font-medium">
              {firstItem.court?.name ?? <span className="italic text-muted-foreground">None</span>}
            </div>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Weekday</TableHead>
                <TableHead>Time Range</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {group.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">
                    {TIME_SLOT_WEEKDAY_LABEL_EN[template.weekday]}
                  </TableCell>
                  <TableCell>
                    {template.startTime} - {template.endTime}
                  </TableCell>
                  <TableCell>{template.price.toLocaleString()} VND</TableCell>
                  <TableCell>
                    <Badge variant={template.isActive ? "success" : "outline"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditItem(template)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-7 w-7"
                      onClick={() => onDeleteItem(template.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
