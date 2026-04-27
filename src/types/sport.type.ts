import { UUID } from "./common.type";

export interface Sport {
  id: UUID;
  name: string;
  description?: string;
}