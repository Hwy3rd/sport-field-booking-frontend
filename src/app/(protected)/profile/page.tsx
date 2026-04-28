"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useChangeMyPassword, useMe, useUpdateMe } from "@/hooks/useUser";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordSchema,
  type UpdateProfileSchema,
} from "@/lib/schemas/profile.schema";

export default function ProfilePage() {
  const meQuery = useMe();
  const updateMeMutation = useUpdateMe();
  const changePasswordMutation = useChangeMyPassword();

  const profileForm = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema as any),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const passwordForm = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema as any),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (meQuery.data) {
      profileForm.reset({
        username: meQuery.data.username,
        fullName: meQuery.data.fullName,
        email: meQuery.data.email,
        phone: meQuery.data.phone ?? "",
      });
    }
  }, [meQuery.data, profileForm]);

  const submitProfile = (values: UpdateProfileSchema) => {
    updateMeMutation.mutate(values);
  };

  const submitPassword = ({ confirmPassword, ...values }: ChangePasswordSchema) => {
    void confirmPassword;
    changePasswordMutation.mutate(values);
    passwordForm.reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account security"
      />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Account summary</CardTitle>
          <CardDescription>Your current profile and role information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>Name: {meQuery.data?.fullName ?? "-"}</div>
          <div>Email: {meQuery.data?.email ?? "-"}</div>
          <div className="flex items-center gap-2">
            Role:
            <Badge variant="outline">{meQuery.data?.role ?? "-"}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Update profile</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={profileForm.handleSubmit(submitProfile)}>
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2">
                <Button disabled={updateMeMutation.isPending} type="submit">
                  {updateMeMutation.isPending ? "Updating..." : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={passwordForm.handleSubmit(submitPassword)}>
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="sm:col-span-2">
                <Button disabled={changePasswordMutation.isPending} type="submit">
                  {changePasswordMutation.isPending ? "Updating..." : "Update password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
