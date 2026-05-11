"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { USER_ROLE_VALUES, USER_STATUS_VALUES } from "@/lib/constants/user.constant";
import type { UserRole, UserStatus } from "@/lib/constants/user.constant";
import type { User } from "@/types/user.type";

type FormMode = "create" | "edit" | "password" | null;

const createUserSchema = z.object({
  username: z.string().min(3, "Username is required"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(USER_ROLE_VALUES as [UserRole, ...UserRole[]]),
  status: z.enum(USER_STATUS_VALUES as [UserStatus, ...UserStatus[]]),
});

const editUserSchema = createUserSchema.omit({ password: true });
const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const toFieldErrors = (errors: unknown[]) =>
  errors
    .map((error) => {
      if (typeof error === "string") return { message: error };
      if (error && typeof error === "object" && "message" in error) {
        const msg = (error as { message?: unknown }).message;
        return { message: typeof msg === "string" ? msg : undefined };
      }
      return undefined;
    })
    .filter(Boolean) as Array<{ message?: string }>;

interface UserFormDialogProps {
  mode: FormMode;
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onCreateUser: (values: {
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  }) => void;
  onEditUser: (values: {
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
  }) => void;
  onChangePassword: (values: { newPassword: string }) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isChangingPassword: boolean;
}

export function UserFormDialog(props: UserFormDialogProps) {
  const {
    mode,
    user,
    onOpenChange,
    onCreateUser,
    onEditUser,
    onChangePassword,
    isCreating,
    isUpdating,
    isChangingPassword,
  } = props;
  const open = mode !== null;

  const defaultValues = useMemo(
    () => ({
      username: user?.username ?? "",
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      password: "",
      role: (user?.role ?? "user") as UserRole,
      status: (user?.status ?? "active") as UserStatus,
      newPassword: "",
    }),
    [user],
  );

  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      if (mode === "create") {
        const result = createUserSchema.safeParse(value);
        if (!result.success) return;
      }
      if (mode === "edit") {
        const result = editUserSchema.safeParse(value);
        if (!result.success) return;
      }
      if (mode === "password") {
        const result = changePasswordSchema.safeParse(value);
        if (!result.success) return;
      }
      if (mode === "create") {
        onCreateUser({
          username: value.username,
          fullName: value.fullName,
          email: value.email,
          phone: value.phone || undefined,
          password: value.password,
          role: value.role,
          status: value.status,
        });
      } else if (mode === "edit") {
        onEditUser({
          username: value.username,
          fullName: value.fullName,
          email: value.email,
          phone: value.phone || undefined,
          role: value.role,
          status: value.status,
        });
      } else if (mode === "password") {
        onChangePassword({
          newPassword: value.newPassword,
        });
      }
    },
  });

  const validateByMode = (name: "username" | "fullName" | "email" | "password" | "newPassword") => {
    return ({ value }: { value: string }) => {
      if (mode === "create") {
        const schema = createUserSchema.shape[
          name as keyof typeof createUserSchema.shape
        ] as z.ZodTypeAny;
        const result = schema.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
      }
      if (mode === "edit" && name !== "password" && name !== "newPassword") {
        const schema = editUserSchema.shape[
          name as keyof typeof editUserSchema.shape
        ] as z.ZodTypeAny;
        const result = schema.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
      }
      if (mode === "password" && name === "newPassword") {
        const result = changePasswordSchema.shape.newPassword.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
      }
      return undefined;
    };
  };

  useEffect(() => {
    if (!open) return;
    form.reset(defaultValues);
  }, [defaultValues, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Create user"
              : mode === "edit"
                ? "Edit user"
                : "Change user password"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new user account from admin panel."
              : mode === "edit"
                ? "Update user profile, role and status."
                : `Set new password for ${user?.username ?? "selected user"}.`}
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
            {mode !== "password" ? (
              <>
                <form.Field
                  name="username"
                  validators={{ onBlur: validateByMode("username") }}
                  children={(field) => (
                    <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                    </Field>
                  )}
                />
                <form.Field
                  name="fullName"
                  validators={{ onBlur: validateByMode("fullName") }}
                  children={(field) => (
                    <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                      <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                    </Field>
                  )}
                />
                <form.Field
                  name="email"
                  validators={{ onBlur: validateByMode("email") }}
                  children={(field) => (
                    <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                    </Field>
                  )}
                />
                <form.Field
                  name="phone"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                      <Input
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </Field>
                  )}
                />
                {mode === "create" ? (
                  <form.Field
                    name="password"
                    validators={{ onBlur: validateByMode("password") }}
                    children={(field) => (
                      <Field data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}>
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Input
                          type="password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                      </Field>
                    )}
                  />
                ) : null}
                <form.Field
                  name="role"
                  children={(field) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as UserRole)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
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
                    <Field className="md:col-span-2">
                      <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => field.handleChange(value as UserStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
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
              </>
            ) : (
              <form.Field
                name="newPassword"
                validators={{ onBlur: validateByMode("newPassword") }}
                children={(field) => (
                  <Field
                    className="md:col-span-2"
                    data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  >
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
                    <Input
                      type="password"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldError errors={toFieldErrors(field.state.meta.errors)} />
                  </Field>
                )}
              />
            )}
          </FieldGroup>

          <DialogFooter className="pt-4 md:col-span-2">
            <Button type="submit" disabled={isCreating || isUpdating || isChangingPassword}>
              {isCreating || isUpdating || isChangingPassword
                ? "Saving..."
                : mode === "create"
                  ? "Create user"
                  : mode === "edit"
                    ? "Save changes"
                    : "Change password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
