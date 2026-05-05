import { FilterBody, FilterQuery } from "./api.type";
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

export interface VenueOperatingHoursPayload {
  startTime: LocalTimeString;
  endTime: LocalTimeString;
}

export interface VenueContactInfoPayload {
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
  imageUrl?: string;

  operatingHours: VenueOperatingHours;
  contactInfo: VenueContactInfo;

  status: VenueStatus;

  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface VenueFilter {
  ownerId?: UUID;
  name?: string;
  address?: string;
}

export interface SearchVenuesRequest extends FilterBody<VenueFilter> {}

export interface GetAllVenuesRequest extends FilterQuery {
  name?: string;
  address?: string;
}

export interface CreateVenueRequest {
  ownerId: UUID;
  name: string;
  address: string;
  description: string;
  imageUrl?: string;
  operatingHours: VenueOperatingHoursPayload;
  contactInfo: VenueContactInfoPayload;
}

export interface UpdateVenueRequest extends Partial<CreateVenueRequest> {
  status?: VenueStatus;
}