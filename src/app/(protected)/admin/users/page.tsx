"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RefreshCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
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
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  useCreateUser,
  useDeleteMultipleUsers,
  useDeleteUser,
  useUserDetail,
  useUsersList,
} from "@/hooks/useUser";
import { USER_ROLE_VALUES, USER_STATUS_VALUES } from "@/lib/constants/user.constant";
import type { UserRole, UserStatus } from "@/lib/constants/user.constant";

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

  const usersQuery = useUsersList({
    current: page,
    limit,
    fullName: search || undefined,
    email: search || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  });
  const createUserMutation = useCreateUser();
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
                <TableRow key={user.id} className="cursor-pointer" onClick={() => setDetailUserId(user.id)}>
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

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Pagination
          current={usersQuery.data?.current ?? page}
          totalPages={usersQuery.data?.totalPages ?? 1}
          onChange={(value) => {
            setSelectedIds([]);
            setPage(value);
          }}
        />
        <div className="flex items-center gap-2">
          <Select
            value={String(page)}
            onValueChange={(value) => {
              setSelectedIds([]);
              setPage(Number(value));
            }}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Page" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: usersQuery.data?.totalPages ?? 1 }).map((_, index) => {
                const value = index + 1;
                return (
                  <SelectItem key={value} value={String(value)}>
                    Page {value}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select
            value={String(limit)}
            onValueChange={(value) => {
              setPage(1);
              setSelectedIds([]);
              setLimit(Number(value));
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map((item) => (
                <SelectItem key={item} value={String(item)}>
                  {item} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
              <Select value={draftStatus} onValueChange={(value) => setDraftStatus(value as UserStatus | "all")}>
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
              <div><span className="font-medium">ID:</span> {userDetailQuery.data.id}</div>
              <div><span className="font-medium">Username:</span> {userDetailQuery.data.username}</div>
              <div><span className="font-medium">Full name:</span> {userDetailQuery.data.fullName}</div>
              <div><span className="font-medium">Email:</span> {userDetailQuery.data.email}</div>
              <div><span className="font-medium">Phone:</span> {userDetailQuery.data.phone ?? "-"}</div>
              <div><span className="font-medium">Role:</span> {userDetailQuery.data.role}</div>
              <div><span className="font-medium">Status:</span> {userDetailQuery.data.status}</div>
            </div>
          ) : (
            <EmptyState title="No detail found" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
