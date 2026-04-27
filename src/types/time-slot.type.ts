import { TimeSlotStatus, TimeSlotWeekday } from "../lib/constants/time-slot.constant";
import { ISODateTimeString, LocalDateString, LocalTimeString, UUID } from "./common.type";
import { Court } from "./court.type";

export interface TimeSlotTemplate {
  id: UUID;

  courtId: UUID;
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

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}