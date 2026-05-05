"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { TablePagination } from "@/components/shared/table-pagination";
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
import {
  useAdminChangePassword,
  useAdminUpdateUser,
  useCreateUser,
  useDeleteMultipleUsers,
  useDeleteUser,
  useUserDetail,
  useUsersList,
} from "@/hooks/useUser";
import { USER_ROLE_VALUES, USER_STATUS_VALUES } from "@/lib/constants/user.constant";
import type { UserRole, UserStatus } from "@/lib/constants/user.constant";
import type { User } from "@/types/user.type";
import { AdminUsersDialogs } from "./dialogs";

const createUserSchema = z.object({
  username: z.string().min(3, "Username is required"),
  email: z.string().email("Invalid email"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(USER_ROLE_VALUES as [UserRole, ...UserRole[]]),
  status: z.enum(USER_STATUS_VALUES as [UserStatus, ...UserStatus[]]),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm = Omit<CreateUserForm, "password">;
type ChangePasswordForm = { newPassword: string };

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [draftRole, setDraftRole] = useState<UserRole | "all">("all");
  const [draftStatus, setDraftStatus] = useState<UserStatus | "all">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  const usersQuery = useUsersList({
    current: page,
    limit,
    fullName: search || undefined,
    email: search || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  });
  const createUserMutation = useCreateUser();
  const updateUserMutation = useAdminUpdateUser();
  const changePasswordMutation = useAdminChangePassword();
  const deleteMultipleUsersMutation = useDeleteMultipleUsers();
  const deleteUserMutation = useDeleteUser();
  const userDetailQuery = useUserDetail(detailUserId ?? "", !!detailUserId);
  const pageItems = usersQuery.data?.items ?? [];
  const isAllSelected = useMemo(
    () => pageItems.length > 0 && pageItems.every((item) => selectedIds.includes(item.id)),
    [pageItems, selectedIds],
  );
  const createForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema as any),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      phone: "",
      password: "",
      role: "user",
      status: "active",
    },
  });
  const editForm = useForm<EditUserForm>({
    resolver: zodResolver(createUserSchema.omit({ password: true }) as any),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      phone: "",
      role: "user",
      status: "active",
    },
  });
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(
      z.object({
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
      }) as any,
    ),
    defaultValues: {
      newPassword: "",
    },
  });

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pageItems.map((item) => item.id));
      return;
    }
    setSelectedIds([]);
  };

  const onCreateUser = (values: CreateUserForm) => {
    createUserMutation.mutate(values, {
      onSuccess: () => {
        setIsCreateOpen(false);
        createForm.reset();
        usersQuery.refetch();
      },
    });
  };
  const onEditUser = (values: EditUserForm) => {
    if (!editingUser) return;
    updateUserMutation.mutate(
      {
        id: editingUser.id,
        ...values,
      },
      {
        onSuccess: () => {
          setEditingUser(null);
          editForm.reset();
          usersQuery.refetch();
        },
      },
    );
  };
  const onChangePassword = (values: ChangePasswordForm) => {
    if (!passwordUser) return;
    changePasswordMutation.mutate(
      {
        userId: passwordUser.id,
        payload: { newPassword: values.newPassword },
      },
      {
        onSuccess: () => {
          setPasswordUser(null);
          passwordForm.reset();
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Manage users" description="View and remove user accounts" />

      <div className="surface-card flex flex-wrap items-center gap-2 p-4">
        <Input
          placeholder="Search by full name or email"
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
          }}
          className="w-full md:max-w-sm"
        />
        <Button
          onClick={() => {
            setPage(1);
            setSearch(keyword.trim());
          }}
        >
          Search
        </Button>
        <Button variant="outline" onClick={() => usersQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setDraftRole(role);
            setDraftStatus(status);
            setIsFilterOpen(true);
          }}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button onClick={() => setIsCreateOpen(true)}>Create new</Button>
        {selectedIds.length > 0 ? (
          <Button
            variant="destructive"
            onClick={() => {
              deleteMultipleUsersMutation.mutate(selectedIds, {
                onSuccess: () => setSelectedIds([]),
              });
            }}
          >
            Delete selected ({selectedIds.length})
          </Button>
        ) : null}
      </div>

      {usersQuery.isLoading ? (
        <Skeleton className="h-72 rounded-2xl" />
      ) : (usersQuery.data?.items?.length ?? 0) === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="surface-card p-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(event) => toggleSelectAll(event.target.checked)}
                  />
                </TableHead>
                <TableHead>Full name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(usersQuery.data?.items ?? []).map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => setDetailUserId(user.id)}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={(event) => {
                        if (event.target.checked) {
                          setSelectedIds((prev) => [...prev, user.id]);
                          return;
                        }
                        setSelectedIds((prev) => prev.filter((id) => id !== user.id));
                      }}
                    />
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="capitalize">{user.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditingUser(user);
                        editForm.reset({
                          username: user.username,
                          email: user.email,
                          fullName: user.fullName,
                          phone: user.phone ?? "",
                          role: user.role,
                          status: user.status,
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPasswordUser(user);
                        passwordForm.reset({ newPassword: "" });
                      }}
                    >
                      Change password
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteUserMutation.mutate(user.id);
                      }}
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
          currentPage={usersQuery.data?.current ?? page}
          total={usersQuery.data?.total ?? 0}
          pageSize={limit}
          onChangePage={(value) => {
            setSelectedIds([]);
            setPage(value);
          }}
          onChangePageSize={(value) => {
            setPage(1);
            setSelectedIds([]);
            setLimit(value);
          }}
        />
      </Card>

      <AdminUsersDialogs
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        draftRole={draftRole}
        setDraftRole={setDraftRole}
        draftStatus={draftStatus}
        setDraftStatus={setDraftStatus}
        setPage={setPage}
        setRole={setRole}
        setStatus={setStatus}
        isCreateOpen={isCreateOpen}
        setIsCreateOpen={setIsCreateOpen}
        createForm={createForm}
        onCreateUser={onCreateUser}
        createUserMutation={createUserMutation as any}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        editForm={editForm}
        onEditUser={onEditUser}
        updateUserMutation={updateUserMutation as any}
        passwordUser={passwordUser}
        setPasswordUser={setPasswordUser}
        passwordForm={passwordForm}
        onChangePassword={onChangePassword}
        changePasswordMutation={changePasswordMutation as any}
        detailUserId={detailUserId}
        setDetailUserId={setDetailUserId}
        userDetailQuery={userDetailQuery}
      />
    </div>
  );
}
