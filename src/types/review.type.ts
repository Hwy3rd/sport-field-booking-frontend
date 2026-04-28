import { FilterQuery } from "./api.type";
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

export interface GetVenueReviewsRequest extends FilterQuery {
  venueId: UUID;
  newest?: boolean;
  rating?: number;
}

export interface CreateReviewRequest {
  venueId: UUID;
  rating: number;
  comment?: string;
}

export interface UpdateReviewRequest {
  id: UUID;
  rating?: number;
  comment?: string;
}
