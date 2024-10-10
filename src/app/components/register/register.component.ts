import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";

import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { RegisterDTO } from "../../dtos/user/register.dto";


@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
  @ViewChild(`registerForm`) registerForm: NgForm;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  fullname: string;
  dateOfBirth: Date;
  address: string;
  isAccepted: boolean;

  constructor(private router: Router, private userService: UserService) {
    this.phoneNumber = `1111111111`;
    this.password = `123456`;
    this.confirmPassword = `123456`;
    this.fullname = `admin`;
    this.dateOfBirth = new Date();
    this.address = `hn`;
    this.isAccepted = true;
    this.dateOfBirth.setFullYear(this.dateOfBirth.getFullYear() - 18);
  }

  ngOnInit(): void {}
  register() {
    const message =
      `phone: ${this.phoneNumber}` +
      `password: ${this.password}` +
      `confirmPassword: ${this.confirmPassword}` +
      `fullname: ${this.fullname}` +
      `address: ${this.address}` +
      `isAccepted: ${this.isAccepted}` +
      `date: ${this.dateOfBirth}`;


    const registerDTO: RegisterDTO = {
      "fullname": this.fullname,
      "phone_number": this.phoneNumber,
      "address": this.address,
      "password": this.password,
      "retype_password": this.confirmPassword,
      "date_of_birth": this.dateOfBirth,
      "facebook_account_id": 0,
      "google_account_id": 0,
      "role_id": 2,
    };
    this.userService.register(registerDTO).subscribe(
      {
        next: (response: any) => {
          this.router.navigate(["/login"]);
        },
        complete: () => {
        },
        error: (error: any) => {
          //xử lý lỗi nếu có
          alert(`Cannot register, error: ${error.error}`)
          console.log("Chi tiết lỗi: ", error.error); // In ra chi tiết lỗi
        },
      }
    );
  }
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  checkPasswordsMatch() {
    if (this.password !== this.confirmPassword) {
      this.registerForm.form.controls[`confirmPassword`].setErrors({
        passwordMismatch: true,
      });
    } else {
      this.registerForm.form.controls[`confirmPassword`].setErrors(null);
    }
  }
  checkAge() {
    if (this.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        this.registerForm.form.controls["dateOfBirth"].setErrors({
          invalidAge: true,
        });
      } else {
        this.registerForm.form.controls["dateOfBirth"].setErrors(null);
      }
    }
  }
}
