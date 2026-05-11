import { FilterQuery } from "./api.type";
import { CourtStatus } from "../lib/constants/court.constant";
import { ISODateTimeString, UUID } from "./common.type";
import { TimeSlotStatus, TimeSlotWeekday } from "../lib/constants/time-slot.constant";
import { Sport } from "./sport.type";
import { Venue } from "./venue.type";

export interface Court {
  id: UUID;

  venueId: UUID;
  venue?: Venue;

  sportId: UUID;
  sport?: Sport;

  name: string;

  pricePerHour: number;

  imageUrl?: string;

  templateNames?: string[] | null;

  status: CourtStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface GetAllCourtsRequest extends FilterQuery {
  name?: string;
  sportId?: UUID;
  venueId?: UUID;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateManualSlotRequest {
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface CreateCourtRequest {
  venueId: UUID;
  sportId: UUID;
  name: string;
  pricePerHour: number;
  imageUrl?: string | null;
  templateNames?: string[];
  manualTimeSlots?: CreateManualSlotRequest[];
}

export interface UpdateCourtRequest extends Partial<CreateCourtRequest> {
  status?: CourtStatus;
}