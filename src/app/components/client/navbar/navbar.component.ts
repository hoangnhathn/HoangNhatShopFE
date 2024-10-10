import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { Category } from "src/app/models/category";
import { UserResponse } from "src/app/responses/user/user.response";
import { CartService } from "src/app/services/cart.service";
import { CategoryService } from "src/app/services/category.service";
import { ProductService } from "src/app/services/product.service";
import { TokenService } from "src/app/services/token.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit {
  @Output() categoryChanged = new EventEmitter<number>();
  @Output() keywordChanged = new EventEmitter<string>();
  categories: Category[] = [];
  currentPage: number = 0;
  itemsPerPage: number = 20;
  selectedCategoryId: number = 0;
  keyword: string = "";
  keywordCategory: string = "";
  sortField: string = "id";
  sortDirection: string = "asc";
  userResponse?: UserResponse | null;
  constructor(
    private categoryService: CategoryService,
    private tokenService: TokenService,
    private router: Router,
    private userService: UserService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.getCategories(
      this.keywordCategory,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
    // Đăng ký (subscribe) để nhận thông tin người dùng khi có thay đổi
    this.userService.userResponse$.subscribe((user: UserResponse | null) => {
      this.userResponse = user;
    });
    this.userResponse = this.userService.getUserResponseFromLocalStorage();
  }

  onCategorySelect(categoryId: number): void {
    this.categoryChanged.emit(categoryId);
  }
  onKeywordChange(): void {
    this.keywordChanged.emit(this.keyword);
  }
  getCategories(
    keyword: string,
    page: number,
    limit: number,
    sortField: string,
    sortDirection: string
  ) {
    this.categoryService
      .getCategories(keyword, page, limit, sortField, sortDirection)
      .subscribe({
        next: (response: any) => {
          this.categories = response.categories;
        },
        complete: () => {},
        error: (error: any) => {
          console.error("Error: ", error);
        },
      });
  }
  logout(): void {
    this.cartService.resetCart(); // Reset lại trạng thái giỏ hàng khi đăng xuất
    this.tokenService.removeToken(); // Xóa token
    this.userService.removeUserFromLocalStorage(); // Xóa thông tin người dùng
    this.router.navigate(["/"]); // Điều hướng về trang đăng nhập
    this.userResponse = null; // Đặt lại userResponse
  }
}
