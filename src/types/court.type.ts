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

export interface CreateCourtRequest {
  venueId: UUID;
  sportId: UUID;
  name: string;
  pricePerHour: number;
  imageUrl?: string | null;
  timeSlotConfig?: {
    manualSlots?: Array<{
      date: string;
      startTime: string;
      endTime: string;
      price: number;
      status?: TimeSlotStatus;
    }>;
    templateGeneration?: {
      startDate: string;
      endDate: string;
      weekdays: TimeSlotWeekday[];
      startTime: string;
      endTime: string;
      price: number;
      createTemplate?: boolean;
    };
  };
}

export interface UpdateCourtRequest extends Partial<CreateCourtRequest> {
  status?: CourtStatus;
}