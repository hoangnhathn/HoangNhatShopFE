import { Component, OnInit, ViewChild } from "@angular/core";
import { LoginDTO } from "../../dtos/user/login.dto";
import { Router } from "@angular/router";
import { UserService } from "../../services/user.service";
import { NgForm } from "@angular/forms";
import { LoginResponse } from "../../responses/user/login.response";
import { TokenService } from "src/app/services/token.service";
import { Role } from "src/app/models/role";
import { UserResponse } from "src/app/responses/user/user.response";
import { CartService } from "src/app/services/cart.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  @ViewChild(`loginForm`) loginForm: NgForm;
  phoneNumber: string;
  password: string;

  roles: Role[] = [];
  rememberMe: boolean = true;
  showPassword: boolean = false; // Thêm thuộc tính này
  userResponse?: UserResponse;

  constructor(
    private router: Router,
    private userService: UserService,
    private tokenService: TokenService,
    private cartService: CartService
  ) {
    this.phoneNumber = `0123456789`;
    this.password = `123456`;
  }

  ngOnInit(): void {}

  login() {
    const loginDTO: LoginDTO = {
      phone_number: this.phoneNumber,
      password: this.password,
    };

    this.userService.login(loginDTO).subscribe({
      next: (response: LoginResponse) => {
        const { token, role_id } = response;
        if (this.rememberMe) {
          this.tokenService.setTokenLocal(token);
        } else{
          // Lưu token vào sessionStorage khi rememberMe không được chọn
          this.tokenService.setTokenSession(token);
        }
          this.userService.getUserDetail(token).subscribe({
            next: (response: any) => {
              this.userResponse = {
                ...response,
                date_of_birth : new Date(
                  response.date_of_birth)
            }
            if (this.rememberMe) {
              // Lưu UserResponse vào localStorage nếu có chọn "Ghi nhớ đăng nhập"
              this.userService.saveUserResponseToLocalStorage(this.userResponse);
            } else {
              // Lưu UserResponse vào sessionStorage nếu không chọn "Ghi nhớ đăng nhập"
              this.userService.saveUserResponseToSessionStorage(this.userResponse);
            }
              // Chuyển hướng hoặc xử lý dựa trên role_id
              if (this.userResponse.role.id === 1) {
                // Điều hướng đến trang admin
                this.router.navigate(["/admin"]);
              } else {
                // Điều hướng đến trang người dùng bình thường
                this.router.navigate(["/"]);
              }
              this.loadCart();
            },
            complete: () => {},
            error: (error: any) => {
              //xử lý lỗi nếu có
              alert(error?.error?.message);
            },
          });

      },
      complete: () => {},
      error: (error: any) => {
        //xử lý lỗi nếu có
        alert(error?.error?.message);
      },
    });
  }
  loadCart() {
    const userId = this.tokenService.getUserId();
    this.cartService.getCartByUserId(userId);
  }
    // Phương thức để hiển thị/ẩn mật khẩu
    togglePasswordVisibility(): void {
      this.showPassword = !this.showPassword;
    }
}
