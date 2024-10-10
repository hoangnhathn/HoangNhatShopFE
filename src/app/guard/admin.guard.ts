import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { TokenService } from "../services/token.service";
import { UserService } from "../services/user.service";
import { UserResponse } from "../responses/user/user.response";

@Injectable({
  providedIn: "root",
})
export class AdminGuard {
  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userService: UserService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isTokenExpired = this.tokenService.isTokenExpired();
    const isUserIdValid = this.tokenService.getUserId() > 0;
    let userResponse: UserResponse = this.userService.getUserResponseFromLocalStorage();
    const isAdmin = userResponse.role.id == 1;
    if (!isTokenExpired && isUserIdValid && isAdmin) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
