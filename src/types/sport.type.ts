import { FilterQuery } from "./api.type";
import { UUID } from "./common.type";

export interface Sport {
  id: UUID;
  name: string;
  description?: string;
}

export interface GetAllSportsRequest extends FilterQuery {
  name?: string;
}

export interface CreateSportRequest {
  name: string;
  description?: string | null;
}

export interface UpdateSportRequest extends Partial<CreateSportRequest> {}