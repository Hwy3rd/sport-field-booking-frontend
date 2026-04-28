import { USER_ROLE, type UserRole } from "@/lib/constants/user.constant"
import { Badge } from "@/components/ui/badge"

const roleLabel: Record<UserRole, string> = {
  [USER_ROLE.ADMIN]: "Admin",
  [USER_ROLE.OWNER]: "Owner",
  [USER_ROLE.USER]: "User",
  [USER_ROLE.MANAGER]: "Manager",
}

const roleVariant: Record<UserRole, "default" | "secondary" | "outline"> = {
  [USER_ROLE.ADMIN]: "default",
  [USER_ROLE.OWNER]: "secondary",
  [USER_ROLE.USER]: "outline",
  [USER_ROLE.MANAGER]: "secondary",
}

export function RoleBadge({ role }: { role?: UserRole }) {
  if (!role) return null
  return <Badge variant={roleVariant[role]}>{roleLabel[role]}</Badge>
}
