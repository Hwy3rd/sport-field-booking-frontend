"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, Phone, Shield, User, UserCircle2 } from "lucide-react";
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

      <Card className="rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-accent/20">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/15 text-primary flex h-14 w-14 items-center justify-center rounded-full border">
              <UserCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Signed in as</p>
              <h2 className="text-xl font-semibold">{meQuery.data?.fullName ?? "Your account"}</h2>
              <div className="text-muted-foreground text-sm">{meQuery.data?.email ?? "-"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="text-primary h-4 w-4" />
            <Badge variant="outline" className="bg-background/70">
              {meQuery.data?.role ?? "-"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle>Update profile</CardTitle>
            <CardDescription>Keep your account information accurate and up to date.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form
                className="grid gap-4 sm:grid-cols-2"
                onSubmit={profileForm.handleSubmit(submitProfile)}
              >
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                          <Input className="pl-9" {...field} />
                        </div>
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
                        <div className="relative">
                          <UserCircle2 className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                          <Input className="pl-9" {...field} />
                        </div>
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
                        <div className="relative">
                          <Mail className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                          <Input className="pl-9" type="email" {...field} />
                        </div>
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
                        <div className="relative">
                          <Phone className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                          <Input className="pl-9" {...field} />
                        </div>
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
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Change password
            </CardTitle>
            <CardDescription>Use a strong password to keep your account secure.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form className="grid gap-4" onSubmit={passwordForm.handleSubmit(submitPassword)}>
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
                <Button disabled={changePasswordMutation.isPending} type="submit">
                  {changePasswordMutation.isPending ? "Updating..." : "Update password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
