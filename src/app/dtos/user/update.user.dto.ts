import { Role } from "src/app/models/role";

export interface UpdateUserDTO {
  id: number;
  fullname: string;
  phone_number: string;
  old_password: string
  password: string;
  address: string;
  is_active: boolean;
  date_of_birth: Date;
  facebook_account_id: number;
  google_account_id: number;
  role: Role;
}
