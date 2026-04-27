import { BookingStatus } from "../lib/constants/booking.constant";
import { ISODateTimeString, LocalDateString, LocalTimeString, UUID } from "./common.type";
import { TimeSlot } from "./time-slot.type";
import { User } from "./user.type";

export interface BookingItem {
  id: UUID;

  bookingId?: UUID;

  timeSlotId?: UUID;
  timeSlot?: TimeSlot;

  courtId: UUID;

  slotDate: LocalDateString;
  startTime: LocalTimeString;
  endTime: LocalTimeString;

  unitPrice: number;
  totalPrice: number;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface Booking {
  id: UUID;

  userId: UUID;
  user?: User;

  items: BookingItem[];

  totalPrice: number;
  status: BookingStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}