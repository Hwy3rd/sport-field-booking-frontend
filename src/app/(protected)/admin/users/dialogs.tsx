"use client";

import type { UseFormReturn } from "react-hook-form";
import type { UseMutationResult } from "@tanstack/react-query";

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
import { USER_ROLE_VALUES, USER_STATUS_VALUES } from "@/lib/constants/user.constant";
import type { UserRole, UserStatus } from "@/lib/constants/user.constant";

type CreateUserForm = {
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
};
type EditUserForm = Omit<CreateUserForm, "password">;
type ChangePasswordForm = {
  newPassword: string;
};
type UserListItem = {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
};

interface UserDetailData {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: string;
  status: string;
}

interface AdminUsersDialogsProps {
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  draftRole: UserRole | "all";
  setDraftRole: (value: UserRole | "all") => void;
  draftStatus: UserStatus | "all";
  setDraftStatus: (value: UserStatus | "all") => void;
  setPage: (value: number) => void;
  setRole: (value: UserRole | "all") => void;
  setStatus: (value: UserStatus | "all") => void;
  isCreateOpen: boolean;
  setIsCreateOpen: (open: boolean) => void;
  createForm: UseFormReturn<CreateUserForm>;
  onCreateUser: (values: CreateUserForm) => void;
  createUserMutation: UseMutationResult<any, Error, any, unknown>;
  editingUser: UserListItem | null;
  setEditingUser: (value: UserListItem | null) => void;
  editForm: UseFormReturn<EditUserForm>;
  onEditUser: (values: EditUserForm) => void;
  updateUserMutation: UseMutationResult<any, Error, any, unknown>;
  passwordUser: UserListItem | null;
  setPasswordUser: (value: UserListItem | null) => void;
  passwordForm: UseFormReturn<ChangePasswordForm>;
  onChangePassword: (values: ChangePasswordForm) => void;
  changePasswordMutation: UseMutationResult<any, Error, any, unknown>;
  detailUserId: string | null;
  setDetailUserId: (value: string | null) => void;
  userDetailQuery: {
    isLoading: boolean;
    data?: UserDetailData | null;
  };
}

export function AdminUsersDialogs(props: AdminUsersDialogsProps) {
  const {
    isFilterOpen,
    setIsFilterOpen,
    draftRole,
    setDraftRole,
    draftStatus,
    setDraftStatus,
    setPage,
    setRole,
    setStatus,
    isCreateOpen,
    setIsCreateOpen,
    createForm,
    onCreateUser,
    createUserMutation,
    editingUser,
    setEditingUser,
    editForm,
    onEditUser,
    updateUserMutation,
    passwordUser,
    setPasswordUser,
    passwordForm,
    onChangePassword,
    changePasswordMutation,
    detailUserId,
    setDetailUserId,
    userDetailQuery,
  } = props;

  return (
    <>
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter users</DialogTitle>
            <DialogDescription>Apply role and status filters from backend query.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Role</div>
              <Select value={draftRole} onValueChange={(value) => setDraftRole(value as UserRole | "all")}>
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
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Status</div>
              <Select
                value={draftStatus}
                onValueChange={(value) => setDraftStatus(value as UserStatus | "all")}
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
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDraftRole("all");
                setDraftStatus("all");
              }}
            >
              Reset
            </Button>
            <Button
              onClick={() => {
                setPage(1);
                setRole(draftRole);
                setStatus(draftStatus);
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
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>Create a new user account from admin panel.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={createForm.handleSubmit(onCreateUser)}>
              <FormField
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
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
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLE_VALUES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
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
                        {USER_STATUS_VALUES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Create user"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => {
          if (!open) {
            setEditingUser(null);
            editForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>Update user profile, role and status.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={editForm.handleSubmit(onEditUser)}>
              <FormField
                control={editForm.control}
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
                control={editForm.control}
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
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
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
              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLE_VALUES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_STATUS_VALUES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!passwordUser}
        onOpenChange={(open) => {
          if (!open) {
            setPasswordUser(null);
            passwordForm.reset();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change user password</DialogTitle>
            <DialogDescription>
              Set new password for {passwordUser?.username ?? "selected user"}.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form className="space-y-4" onSubmit={passwordForm.handleSubmit(onChangePassword)}>
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
              <DialogFooter>
                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? "Updating..." : "Change password"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!detailUserId} onOpenChange={(open) => !open && setDetailUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User detail</DialogTitle>
            <DialogDescription>Data loaded from detail API endpoint.</DialogDescription>
          </DialogHeader>
          {userDetailQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-1/2" />
            </div>
          ) : userDetailQuery.data ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">ID:</span> {userDetailQuery.data.id}
              </div>
              <div>
                <span className="font-medium">Username:</span> {userDetailQuery.data.username}
              </div>
              <div>
                <span className="font-medium">Full name:</span> {userDetailQuery.data.fullName}
              </div>
              <div>
                <span className="font-medium">Email:</span> {userDetailQuery.data.email}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {userDetailQuery.data.phone ?? "-"}
              </div>
              <div>
                <span className="font-medium">Role:</span> {userDetailQuery.data.role}
              </div>
              <div>
                <span className="font-medium">Status:</span> {userDetailQuery.data.status}
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
