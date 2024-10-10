import {
  IsString, IsNotEmpty, IsPhoneNumber, IsDate
} from 'class-validator';


export class RegisterDTO {
  @IsString()
  fullname: string;

  @IsPhoneNumber()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  password: string;

  @IsString()
  retype_password: string;

  @IsDate()
  date_of_birth: Date;
  facebook_account_id: number = 0;
  google_account_id: number = 0;
  role_id: number;
  constructor(data: any) {
    this.fullname = data.fullname;
    this.phone_number = data.phone_number;
    this.address = data.address;
    this.password = data.password;
    this.retype_password = data.retype_password;
    this.date_of_birth = data.date_of_birth;
    this.facebook_account_id = data.facebook_account_id;
    this.google_account_id = data.google_account_id;
    this.role_id = data.role_id || 1;
  }
}
