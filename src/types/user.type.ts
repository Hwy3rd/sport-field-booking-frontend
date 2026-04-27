import { UserRole, UserStatus } from "../lib/constants/user.constant";
import { ISODateTimeString, UUID } from "./common.type";

export interface User {
  id: UUID;

  username: string;
  email: string;
  fullName: string;

  phone?: string;

  role: UserRole;
  status: UserStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}


