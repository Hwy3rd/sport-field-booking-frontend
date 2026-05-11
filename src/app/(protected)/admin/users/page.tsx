"use client";

import { KeyRound, Pencil, RefreshCcw, SlidersHorizontal, Trash2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import { useDebounce } from "@/hooks/useDebounce";
import type { UserRole, UserStatus } from "@/lib/constants/user.constant";
import type { User } from "@/types/user.type";
import { UserDetailDialog } from "./dialogs/user-detail-dialog";
import { UserFilterDialog } from "./dialogs/user-filter-dialog";
import { UserFormDialog } from "./dialogs/user-form-dialog";

type UserFilters = {
  role: UserRole | "all";
  status: UserStatus | "all";
};

const DEFAULT_PAGE_SIZE = 10;
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case "admin":
      return "destructive" as const;
    case "manager":
      return "warning" as const;
    case "owner":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "active":
      return "success" as const;
    case "deleted":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

const getStatusBadgeClassName = (status: string) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "deleted":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "";
  }
};

const getRoleBadgeClassName = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-rose-100 text-rose-700 border-rose-200";
    case "manager":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "owner":
      return "bg-violet-100 text-violet-700 border-violet-200";
    default:
      return "";
  }
};

export default function AdminUsersPage() {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [keywordInput, setKeywordInput] = useState("");
  const [filters, setFilters] = useState<UserFilters>({
    role: "all",
    status: "all",
  });

  const [draftRole, setDraftRole] = useState<UserRole | "all">(filters.role);
  const [draftStatus, setDraftStatus] = useState<UserStatus | "all">(filters.status);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [formDialogMode, setFormDialogMode] = useState<"create" | "edit" | "password" | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);

  const debouncedKeyword = useDebounce(keywordInput.trim(), 500);
  const usersListFilter = useMemo(
    () => ({
      current,
      limit: pageSize,
      fullName: debouncedKeyword || undefined,
      role: filters.role === "all" ? undefined : filters.role,
      status: filters.status === "all" ? undefined : filters.status,
    }),
    [current, pageSize, debouncedKeyword, filters.role, filters.status],
  );

  const usersQuery = useUsersList(usersListFilter);
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
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pageItems.map((item) => item.id));
      return;
    }
    setSelectedIds([]);
  };

  const openCreateUser = () => {
    setActiveUser(null);
    setFormDialogMode("create");
  };

  const openEditUser = (user: User) => {
    setActiveUser(user);
    setFormDialogMode("edit");
  };

  const openChangePassword = (user: User) => {
    setActiveUser(user);
    setFormDialogMode("password");
  };

  const onCreateUser = async (values: {
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  }) => {
    try {
      await createUserMutation.mutateAsync(values);
      setFormDialogMode(null);
      usersQuery.refetch();
    } catch {
      // mutation hook already handles user feedback
    }
  };
  const onEditUser = async (values: {
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
  }) => {
    if (!activeUser) return;
    try {
      await updateUserMutation.mutateAsync({
        id: activeUser.id,
        ...values,
      });
      setActiveUser(null);
      setFormDialogMode(null);
      usersQuery.refetch();
    } catch {
      // mutation hook already handles user feedback
    }
  };
  const onChangePassword = async (values: { newPassword: string }) => {
    if (!activeUser) return;
    try {
      await changePasswordMutation.mutateAsync({
        userId: activeUser.id,
        payload: { newPassword: values.newPassword },
      });
      setActiveUser(null);
      setFormDialogMode(null);
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    try {
      await deleteUserMutation.mutateAsync(deleteUserId);
      setSelectedIds((prev) => prev.filter((id) => id !== deleteUserId));
      setDeleteUserId(null);
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleDeleteSelectedUsers = async () => {
    if (!selectedIds.length) return;

    try {
      await deleteMultipleUsersMutation.mutateAsync(selectedIds);
      setSelectedIds([]);
      setDeleteSelectedOpen(false);
    } catch {
      // mutation hook already handles user feedback
    }
  };

  const handleApplyFilter = (nextRole: UserRole | "all", nextStatus: UserStatus | "all") => {
    setCurrent(1);
    setFilters((prev) => ({
      ...prev,
      role: nextRole,
      status: nextStatus,
    }));
  };

  useEffect(() => {
    setCurrent(1);
  }, [debouncedKeyword]);

  useEffect(() => {
    setSelectedIds([]);
  }, [current, pageSize, filters.role, filters.status, debouncedKeyword]);

  return (
    <div className="space-y-6">
      <PageHeader title="Manage users" description="View and remove user accounts" />

      <div className="surface-card flex flex-wrap items-center justify-between gap-2 p-4">
        <div className="flex w-full items-center justify-center gap-2 md:max-w-sm">
          <Input
            placeholder="Search by full name"
            value={keywordInput}
            onChange={(event) => {
              setKeywordInput(event.target.value);
            }}
            className="w-full md:max-w-sm"
          />
        </div>
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => usersQuery.refetch()}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setDraftRole(filters.role);
              setDraftStatus(filters.status);
              setIsFilterOpen(true);
            }}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={openCreateUser}>Create new</Button>
          {selectedIds.length > 0 ? (
            <Button variant="destructive" onClick={() => setDeleteSelectedOpen(true)}>
              Delete selected ({selectedIds.length})
            </Button>
          ) : null}
        </div>
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
                  <TableCell>
                    <Badge
                      variant={getRoleBadgeVariant(user.role)}
                      className={`capitalize ${getRoleBadgeClassName(user.role)}`}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusBadgeVariant(user.status)}
                      className={`capitalize ${getStatusBadgeClassName(user.status)}`}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditUser(user);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(event) => {
                        event.stopPropagation();
                        openChangePassword(user);
                      }}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDeleteUserId(user.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
          currentPage={usersQuery.data?.current ?? current}
          total={usersQuery.data?.total ?? 0}
          pageSize={pageSize}
          onChangePage={(value) => {
            setSelectedIds([]);
            setCurrent(value);
          }}
          onChangePageSize={(value) => {
            setCurrent(1);
            setSelectedIds([]);
            setPageSize(value);
          }}
        />
      </Card>

      <UserFilterDialog
        isFilterOpen={isFilterOpen}
        setIsFilterOpen={setIsFilterOpen}
        draftRole={draftRole}
        draftStatus={draftStatus}
        onDraftRoleChange={setDraftRole}
        onDraftStatusChange={setDraftStatus}
        onApply={handleApplyFilter}
      />
      <UserFormDialog
        mode={formDialogMode}
        user={activeUser}
        onOpenChange={(open) => {
          if (!open) {
            setFormDialogMode(null);
            setActiveUser(null);
          }
        }}
        onCreateUser={onCreateUser}
        onEditUser={onEditUser}
        onChangePassword={onChangePassword}
        isCreating={createUserMutation.isPending}
        isUpdating={updateUserMutation.isPending}
        isChangingPassword={changePasswordMutation.isPending}
      />
      <UserDetailDialog
        detailUserId={detailUserId}
        setDetailUserId={setDetailUserId}
        userDetailQuery={userDetailQuery}
      />

      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={(open) => {
          if (!open) setDeleteUserId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected user account will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteSelectedOpen}
        onOpenChange={(open) => {
          if (!open) setDeleteSelectedOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected users?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. It will permanently delete {selectedIds.length} selected user(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelectedUsers}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
