"use client";

import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_VALUES, USER_STATUS_VALUES } from "@/lib/constants/user.constant";
import type { UserRole, UserStatus } from "@/lib/constants/user.constant";

const filterSchema = z.object({
  role: z.union([z.literal("all"), z.enum(USER_ROLE_VALUES as [UserRole, ...UserRole[]])]),
  status: z.union([z.literal("all"), z.enum(USER_STATUS_VALUES as [UserStatus, ...UserStatus[]])]),
});

interface UserFilterDialogProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftRole: UserRole | "all";
  draftStatus: UserStatus | "all";
  onDraftRoleChange: (value: UserRole | "all") => void;
  onDraftStatusChange: (value: UserStatus | "all") => void;
  onApply: (role: UserRole | "all", status: UserStatus | "all") => void;
}

export function UserFilterDialog(props: UserFilterDialogProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftRole,
    draftStatus,
    onDraftRoleChange,
    onDraftStatusChange,
    onApply,
  } = props;

  const form = useForm({
    defaultValues: {
      role: draftRole,
      status: draftStatus,
    },
    validators: {
      onSubmit: filterSchema,
    },
    onSubmit: ({ value }) => {
      onApply(value.role, value.status);
      setIsFilterOpen(false);
    },
  });

  useEffect(() => {
    if (!isFilterOpen) return;
    form.setFieldValue("role", draftRole);
    form.setFieldValue("status", draftStatus);
  }, [draftRole, draftStatus, form, isFilterOpen]);

  return (
    <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Filter users</DialogTitle>
          <DialogDescription>Apply role and status filters from backend query.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="role"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      const casted = value as UserRole | "all";
                      field.handleChange(casted);
                      onDraftRoleChange(casted);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All roles</SelectItem>
                      {USER_ROLE_VALUES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <form.Field
              name="status"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      const casted = value as UserStatus | "all";
                      field.handleChange(casted);
                      onDraftStatusChange(casted);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      {USER_STATUS_VALUES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.setFieldValue("role", "all");
                form.setFieldValue("status", "all");
                onDraftRoleChange("all");
                onDraftStatusChange("all");
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
