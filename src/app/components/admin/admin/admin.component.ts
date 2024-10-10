import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserResponse } from "src/app/responses/user/user.response";
import { TokenService } from "src/app/services/token.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.css"],
})
export class AdminComponent implements OnInit {
  userResponse?: UserResponse | null;
  constructor(
    private tokenService: TokenService,
    private userService: UserService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
  }

  selectedView: string = "list"; // Giá trị mặc định là 'list'

  selectView(view: string) {
    this.selectedView = view;
  }

  logout(): void {
    this.tokenService.removeToken(); // Xóa token
    this.userService.removeUserFromLocalStorage(); // Xóa thông tin người dùng
    this.router.navigate(["/login"]);
  }
}
