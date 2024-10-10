import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { UpdateUserDTO } from "src/app/dtos/user/update.user.dto";
import { UserResponse } from "src/app/responses/user/user.response";
import { TokenService } from "src/app/services/token.service";
import { UserService } from "src/app/services/user.service";
import {
  dateOfBirthValidator,
  passwordValidator,
} from "src/app/validator/validator";

declare const bootstrap: any;

@Component({
  selector: "app-user-detail",
  templateUrl: "./user-detail.component.html",
  styleUrls: ["./user-detail.component.css"],
})
export class UserDetailComponent implements OnInit {
  editUserDetailForm: FormGroup;
  changePasswordForm: FormGroup;
  userResponse?: UserResponse | null;
  userToEdit: UpdateUserDTO = {
    fullname: "",
    phone_number: "",
    password: "",
    old_password: "",
    address: "",
    date_of_birth: new Date(),
    facebook_account_id: 0,
    google_account_id: 0,
    role: null,
    id: 0,
    is_active: false,
  };

  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.editUserDetailForm = this.fb.group(
      {
        fullname: ["", Validators.required],
        phone_number: [
          "",
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
            Validators.pattern(/^0\d{9}$/), // Số ĐT phải bắt đầu bằng 0 và dài 10 chữ số
          ],
        ],
        address: ["", [Validators.required, Validators.minLength(5)]],
        date_of_birth: [""],
      },
      {
        validator: [dateOfBirthValidator("date_of_birth")],
      }
    );
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ["", [Validators.required]],
        newPassword: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", [Validators.required]],
      },
      {
        validator: [passwordValidator("newPassword", "confirmPassword")],
      }
    );
  }

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
  }

  openEditModal(): void {
    this.editUserDetailForm.reset();
    this.userService.getUserDetail(this.tokenService.getToken()).subscribe(
      (user: UserResponse) => {
        if (user) {
          this.userToEdit.fullname = user.fullname;
          this.userToEdit.phone_number = user.phone_number;
          this.userToEdit.address = user.address;
          this.userToEdit.date_of_birth = user.date_of_birth;
          this.userToEdit.role = user.role;
          const formattedDateOfBirth = this.formatDateOrArray(
            user.date_of_birth
          );
          const editModalElement = document.getElementById(
            "editUserDetailModal"
          );
          if (editModalElement) {
            this.editUserDetailForm.patchValue({
              fullname: user.fullname,
              phone_number: user.phone_number,
              address: user.address,
              date_of_birth: formattedDateOfBirth,
            });
            const modal = new bootstrap.Modal(editModalElement);
            modal.show();
          }
        } else {
          console.error("Tài khoản không tồn tại");
        }
      },
      (error) => {
        console.error("Lỗi khi lấy chi tiết tài khoản:", error);
      }
    );
  }

  updateUserDetail(): void {
    this.userToEdit.fullname = this.editUserDetailForm.get("fullname")?.value;
    this.userToEdit.phone_number =
      this.editUserDetailForm.get("phone_number")?.value;
    this.userToEdit.password = "";
    this.userToEdit.address = this.editUserDetailForm.get("address")?.value;
    this.userToEdit.facebook_account_id = 0;
    this.userToEdit.google_account_id = 0;
    this.userService
      .updateUserDetail(this.tokenService.getUserId(), this.userToEdit)
      .subscribe(
        () => {
          this.toastr.success("Cập nhật thông tin thành công!", "Thành công");
          // Đóng modal sau khi lưu thành công
          const editModalElement = document.getElementById(
            "editUserDetailModal"
          );
          if (editModalElement) {
            const modal = bootstrap.Modal.getInstance(editModalElement);
            if (modal) {
              modal.hide();
            }
          }
          // Gọi lại API để lấy thông tin người dùng mới
          this.userService
            .getUserDetail(this.tokenService.getToken())
            .subscribe(
              (updatedUser: UserResponse) => {
                const userResponseJSONS = sessionStorage.getItem("user");
                if (
                  userResponseJSONS == null ||
                  userResponseJSONS == undefined
                ) {
                  this.userService.saveUserResponseToLocalStorage(updatedUser);
                } else {
                  this.userService.saveUserResponseToSessionStorage(
                    updatedUser
                  );
                }
                this.userService.setUserResponse(updatedUser);
                this.loadUser();
              },
              (error) => {
                this.toastr.error(
                  "Không thể tải lại thông tin người dùng!",
                  "Lỗi"
                );
                console.error("Lỗi khi tải lại thông tin người dùng:", error);
              }
            );
        },
        (error) => {
          this.toastr.error(
            "Cập nhật thông tin thất bại. Vui lòng thử lại!",
            "Lỗi"
          );
          console.error("Lỗi khi cập nhật thông tin:", error);
        }
      );
  }

  openChangePasswordModal(): void {
    this.userToEdit.password =
      this.editUserDetailForm.get("phone_number")?.value;
  }

  onChangePassword() {
    const newPassword = this.changePasswordForm.value.newPassword;
    const confirmPassword = this.changePasswordForm.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      return;
    }

    // Xử lý logic thay đổi mật khẩu
    console.log("Mật khẩu được thay đổi thành công!");
  }

  formatDateOrArray(date: Date | string | number[] | number | null): string {
    if (date === null || date === undefined) {
      console.error("Date is null or undefined:", date);
      return ""; // Trả về chuỗi rỗng nếu ngày không hợp lệ
    }

    if (Array.isArray(date)) {
      // Chuyển đổi từ mảng [year, month, day] thành Date
      date = new Date(date[0], date[1] - 1, date[2]);
    } else if (typeof date === "number") {
      // Nếu là timestamp, chuyển đổi trực tiếp thành Date
      date = new Date(date);
    } else if (typeof date === "string") {
      // Chuyển chuỗi thành Date nếu cần
      date = new Date(date);
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date:", date);
      return ""; // Trả về chuỗi rỗng nếu ngày không hợp lệ
    }

    // Định dạng ngày thành YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
