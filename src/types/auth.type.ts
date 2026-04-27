import { UUID } from "crypto";
import { User } from "./user.type";
import { ISODateTimeString } from "./common.type";

export interface Session {
  id: UUID;

  userId: UUID;
  user?: User;

  expiresAt: ISODateTimeString;
  revokedAt?: ISODateTimeString;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}