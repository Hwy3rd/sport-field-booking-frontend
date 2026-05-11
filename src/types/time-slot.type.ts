import { FilterQuery } from "./api.type";
import { TimeSlotStatus, TimeSlotWeekday } from "../lib/constants/time-slot.constant";
import { ISODateTimeString, LocalDateString, LocalTimeString, UUID } from "./common.type";
import { Court } from "./court.type";
import { Venue } from "./venue.type";

export interface TimeSlotTemplate {
  id: UUID;

  venueId: UUID;
  venue?: Venue;

  name: string;

  courtId?: UUID | null;
  court?: Court;

  weekday: TimeSlotWeekday;

  startTime: LocalTimeString;
  endTime: LocalTimeString;

  price: number;
  isActive: boolean;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface TimeSlot {
  id: UUID;

  courtId: UUID;
  court?: Court;

  templateId?: UUID;
  template?: TimeSlotTemplate;

  date: LocalDateString;

  startTime: LocalTimeString;
  endTime: LocalTimeString;

  price: number;
  status: TimeSlotStatus;

  lockedAt?: ISODateTimeString | null;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface GetAllTimeSlotsRequest extends FilterQuery {
  courtId?: UUID;
  templateId?: UUID;
  date?: LocalDateString;
  status?: TimeSlotStatus;
}

export interface GetAllTimeSlotTemplatesRequest extends FilterQuery {
  venueId?: UUID;
  courtId?: UUID;
  name?: string;
  weekday?: TimeSlotWeekday;
}

export interface CreateTimeSlotRequest {
  courtId: UUID;
  templateId?: UUID;
  date: LocalDateString;
  startTime: LocalTimeString;
  endTime: LocalTimeString;
  price: number;
  status?: TimeSlotStatus;
}

export interface UpdateTimeSlotRequest extends Partial<CreateTimeSlotRequest> {}

export interface CreateTimeSlotTemplateRequest {
  venueId: UUID;
  name: string;
  courtId?: UUID;
  weekdays: number[];
  startTime: LocalTimeString;
  endTime: LocalTimeString;
  price: number;
  isActive?: boolean;
}

export interface UpdateTimeSlotTemplateRequest
  extends Partial<CreateTimeSlotTemplateRequest> {}