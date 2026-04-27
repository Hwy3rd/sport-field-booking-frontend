import { ISODateTimeString, UUID } from "./common.type";
import { User } from "./user.type";
import { Venue } from "./venue.type";

export interface Review {
  id: UUID;

  userId: UUID;
  user?: User;

  venueId: UUID;
  venue?: Venue;

  comment?: string;

  rating: number;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}