import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/app/environments/environment";
import { User } from "src/app/models/user";
import { RoleService } from "src/app/services/role.service";
import { UserService } from "src/app/services/user.service";
import { Role } from "src/app/models/role";
import { RegisterDTO } from "src/app/dtos/user/register.dto";
import {
  dateOfBirthValidator,
  passwordValidator,
} from "src/app/validator/validator";
import { UserResponse } from "src/app/responses/user/user.response";
import { UpdateUserDTO } from "src/app/dtos/user/update.user.dto";

declare const bootstrap: any;
@Component({
  selector: "app-user-admin",
  templateUrl: "./user-admin.component.html",
  styleUrls: ["./user-admin.component.css"],
})
export class UserAdminComponent implements OnInit {
  editUserForm: FormGroup;
  createUserForm: FormGroup;
  users: User[];
  selectedRole: string = "Chọn theo quyền"; // Biến lưu trữ danh mục đã chọn
  roles: Role[] = [];
  selectedUser?: User;
  roleId: number = 0;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  pages: number[] = [];
  totalPages: number = 0;
  keyword: string = "";
  sortField: string = "id";
  sortDirection: string = "asc";
  visiblePages: number[] = [];
  userToCreate: RegisterDTO = {
    fullname: "",
    phone_number: "",
    password: "",
    retype_password: "",
    address: "",
    date_of_birth: new Date(),
    facebook_account_id: 0,
    google_account_id: 0,
    role_id: 0,
  };
  userToEdit: UpdateUserDTO = {
    id: 0,
    fullname: "",
    phone_number: "",
    old_password: "",
    password: "",
    address: "",
    is_active: true,
    date_of_birth: new Date(),
    facebook_account_id: 0,
    google_account_id: 0,
    role: null,
  };

  constructor(
    private roleService: RoleService,
    private userService: UserService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group(
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
        password: ["", Validators.required],
        retype_password: ["", Validators.required],
        address: ["", [Validators.required, Validators.minLength(5)]],
        date_of_birth: [""],
        google_account_id: [0],
        facebook_account_id: [0],
        role: [0, Validators.required],
      },
      {
        validator: [
          dateOfBirthValidator("date_of_birth"),
          passwordValidator("password", "retype_password"),
        ],
      }
    );
    this.editUserForm = this.fb.group(
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
        password: [""],
        address: ["", [Validators.required, Validators.minLength(5)]],
        date_of_birth: [""],
        is_active: [true, Validators.required],
        google_account_id: [0],
        facebook_account_id: [0],
        role: [0, Validators.required],
      },
      {
        validator: [dateOfBirthValidator("date_of_birth")],
      }
    );
  }

  ngOnInit(): void {
    this.getAllUsers(
      this.keyword,
      this.roleId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );

    // Lấy danh sách danh mục
    this.roleService.getRoles().subscribe((data: Role[]) => {
      this.roles = data;
    });
  }

  openCreateModal(): void {
    this.createUserForm.reset();
    this.userToCreate = {
      fullname: "",
      phone_number: "",
      password: "",
      retype_password: "",
      address: "",
      date_of_birth: null,
      google_account_id: 0,
      facebook_account_id: 0,
      role_id: 0,
    };
    const createModalElement = document.getElementById("createUserModal");
    if (createModalElement) {
      const modal = new bootstrap.Modal(createModalElement);
      modal.show();
    } else {
      console.error("Không tìm thấy phần tử modal với id 'createUserModal'");
    }
  }

  createUser(): void {
    if (this.createUserForm.invalid) {
      this.toastr.error("Vui lòng điền đầy đủ thông tin cần thiết!", "Lỗi");
      return;
    }
    this.userToCreate.fullname = this.createUserForm.get("fullname")?.value;
    this.userToCreate.phone_number =
      this.createUserForm.get("phone_number")?.value;
    this.userToCreate.password = this.createUserForm.get("password")?.value;
    this.userToCreate.retype_password =
      this.createUserForm.get("retype_password")?.value;
    this.userToCreate.address = this.createUserForm.get("address")?.value;
    this.userToCreate.date_of_birth = new Date(
      this.createUserForm.get("date_of_birth")?.value
    );
    this.userToCreate.google_account_id =
      this.createUserForm.get("google_account_id")?.value;
    this.userToCreate.facebook_account_id = this.createUserForm.get(
      "facebook_account_id"
    )?.value;
    this.userToCreate.role_id = this.createUserForm.get("role")?.value;
    this.userService.createUser(this.userToCreate).subscribe(
      () => {
        this.toastr.success("Thêm mới thành công!", "Thành công");
        // Đóng modal sau khi lưu thành công
        const editModalElement = document.getElementById("createUserModal");
        if (editModalElement) {
          const modal = bootstrap.Modal.getInstance(editModalElement);
          if (modal) {
            modal.hide();
          }
        }
        // Tải lại danh sách user
        this.getAllUsers(
          this.keyword,
          this.roleId,
          this.currentPage,
          this.itemsPerPage,
          this.sortField,
          this.sortDirection
        );
      },
      (error) => {
        this.toastr.error("Thêm mới thất bại. Vui lòng thử lại!", "Lỗi");
        console.error("Lỗi khi thêm mới:", error);
      }
    );
  }

  openModal(userId: number): void {
    this.userService
      .getUserDetailById(userId)
      .subscribe((user: UserResponse) => {
        // Cập nhật đường dẫn hình ảnh cho mỗi tài khoản
        this.selectedUser = user;
        const modalElement = document.getElementById("userModal");
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      });
  }
  openEditModal(userId: number): void {
    this.editUserForm.reset();
    this.userService.getUserDetailById(userId).subscribe(
      (user: UserResponse) => {
        console.log(user);
        if (user) {
          this.userToEdit.id = user.id;
          this.userToEdit.fullname = user.fullname;
          this.userToEdit.phone_number = user.phone_number;
          this.userToEdit.address = user.address;
          this.userToEdit.is_active = user.is_active;
          this.userToEdit.date_of_birth = user.date_of_birth;
          this.userToEdit.facebook_account_id = user.facebook_account_id;
          this.userToEdit.google_account_id = user.google_account_id;
          this.userToEdit.role = user.role;
          this.userToEdit.password = "";

          const formattedDateOfBirth = this.formatDateOrArray(
            user.date_of_birth
          );
          const editModalElement = document.getElementById("editUserModal");
          if (editModalElement) {
            this.editUserForm.patchValue({
              fullname: user.fullname,
              phone_number: user.phone_number,
              password: "",
              address: user.address,
              is_active: user.is_active,
              date_of_birth: formattedDateOfBirth,
              facebook_account_id: user.facebook_account_id,
              google_account_id: user.google_account_id,
              role: user.role.id,
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

  updateUser(): void {
    this.userToEdit.fullname = this.editUserForm.get("fullname")?.value;
    this.userToEdit.phone_number = this.editUserForm.get("phone_number")?.value;
    this.userToEdit.password = this.editUserForm.get("password")?.value;
    this.userToEdit.address = this.editUserForm.get("address")?.value;
    this.userToEdit.is_active = this.editUserForm.get("is_active")?.value;
    this.userToEdit.facebook_account_id = this.editUserForm.get(
      "facebook_account_id"
    )?.value;
    this.userToEdit.google_account_id =
      this.editUserForm.get("google_account_id")?.value;
    this.userToEdit.role = this.editUserForm.get("role")?.value;
    this.userService.updateUser(this.userToEdit).subscribe(
      () => {
        this.toastr.success("Cập nhật đơn hàng thành công!", "Thành công");
        // Đóng modal sau khi lưu thành công
        const editModalElement = document.getElementById("editOrderModal");
        if (editModalElement) {
          const modal = bootstrap.Modal.getInstance(editModalElement);
          if (modal) {
            modal.hide();
          }
        }
        // Tải lại danh sách user
        this.getAllUsers(
          this.keyword,
          this.roleId,
          this.currentPage,
          this.itemsPerPage,
          this.sortField,
          this.sortDirection
        );
      },
      (error) => {
        this.toastr.error(
          "Cập nhật tài khoản thất bại. Vui lòng thử lại!",
          "Lỗi"
        );
        console.error("Lỗi khi cập nhật tài khoản:", error);
      }
    );
  }

  deleteUser(userId: number): void {
    if (confirm("Bạn có chắc muốn xóa tài khoản này không?")) {
      this.userService.deleteUser(userId).subscribe(
        (response) => {
          this.toastr.success("Xóa tài khoản thành công!", "Thành công");
          // Tải lại danh sách user
          this.getAllUsers(
            this.keyword,
            this.roleId,
            this.currentPage,
            this.itemsPerPage,
            this.sortField,
            this.sortDirection
          );
        },
        (error) => {
          this.toastr.error("Xóa tài khoản thất bại. Vui lòng thử lại!", "Lỗi");
          console.error("Lỗi khi xóa tài khoản:", error);
        }
      );
    }
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

  getAllUsers(
    keyword: string,
    roleId: number,
    page: number,
    limit: number,
    sortField: string,
    sortDirection: string
  ) {
    this.userService
      .getAllUsers(keyword, roleId, page, limit, sortField, sortDirection)
      .subscribe({
        next: (response: any) => {
          this.users = response.users;
          this.totalPages = response.totalPages;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        },
        complete: () => {},
        error: (error: any) => {
          console.error("Error fetching products: ", error);
        },
      });
  }
  onPageChange(page: number) {
    debugger;
    this.currentPage = page;
    this.getAllUsers(
      this.keyword,
      this.roleId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onKeywordChange(): void {
    this.getAllUsers(
      this.keyword,
      this.roleId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onRoleChange(roleId: number): void {
    const selected = this.roles.find((role) => role.id === roleId);
    this.selectedRole = selected ? selected.name : "Chọn theo quyền"; // Cập nhật selectedRole
    this.roleId = roleId; // Cập nhật roleId
    this.getAllUsers(
      this.keyword,
      this.roleId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onSortChange(sortField: string, sortDirection): void {
    this.sortField = sortField;
    this.sortDirection = sortDirection;
    this.getAllUsers(
      this.keyword,
      this.roleId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }
  generateVisiblePageArray(currentPage: number, totalPages: number): number[] {
    const maxVisiblePages = 5;
    const halfVisiblePages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(currentPage - halfVisiblePages, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }

    return new Array(endPage - startPage + 1)
      .fill(0)
      .map((_, index) => startPage + index);
  }
}
