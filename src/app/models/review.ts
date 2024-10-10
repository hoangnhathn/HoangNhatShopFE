
import { User } from "./user";

export interface Review{
  id: number;
  product_id: number;
  user: User;
  rating: number;
  comment: string;
  created_at: Date;
  updated_at: Date;
}
