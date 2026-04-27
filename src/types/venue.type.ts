import { ISODateTimeString, LocalTimeString, UUID } from "./common.type";
import { User } from "./user.type";
import { VenueStatus } from "../lib/constants/venue.constant";

export interface VenueOperatingHours {
  startTime: LocalTimeString;
  endTime: LocalTimeString;
}

export interface VenueContactInfo {
  phone: string;
  email: string;
}

export interface Venue {
  id: UUID;

  ownerId: UUID;
  owner?: User;

  name: string;
  address: string;
  description: string;

  operatingHours: VenueOperatingHours;
  contactInfo: VenueContactInfo;

  status: VenueStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}