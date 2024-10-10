import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { Category } from "src/app/models/category";
import { CategoryService } from "src/app/services/category.service";

declare const bootstrap: any;

@Component({
  selector: "app-category-admin",
  templateUrl: "./category-admin.component.html",
  styleUrls: ["./category-admin.component.css"],
})
export class CategoryAdminComponent implements OnInit {
  editCategoryForm: FormGroup;
  createCategoryForm: FormGroup;
  categories: Category[];
  selectedCategory?: Category;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  pages: number[] = [];
  totalPages: number = 0;
  keyword: string = "";
  sortField: string = "id";
  sortDirection: string = "asc";
  visiblePages: number[] = [];
  categoryToEdit: Category = {
    id: 0,
    name: "",
  };

  constructor(
    private categoryService: CategoryService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.editCategoryForm = this.fb.group({
      name: ["", Validators.required],
    });
    this.createCategoryForm = this.fb.group({
      name: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllCategories(
      this.keyword,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  getAllCategories(
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
          this.totalPages = response.totalPages;
          this.visiblePages = this.generateVisiblePageArray(
            this.currentPage,
            this.totalPages
          );
        },
        complete: () => {},
        error: (error: any) => {
          console.error("Error fetching categories: ", error);
        },
      });
  }

  openCreateModal(): void {
    this.createCategoryForm.reset();
    this.categoryToEdit = {
      id: 0,
      name: "",
    };
    const createModalElement = document.getElementById("createCategoryModal");
    if (createModalElement) {
      const modal = new bootstrap.Modal(createModalElement);
      modal.show();
    } else {
      console.error(
        "Không tìm thấy phần tử modal với id 'createCategoryModal'"
      );
    }
  }

  createCategory(): void {
    if (this.createCategoryForm.invalid) {
      this.toastr.error("Vui lòng điền đầy đủ thông tin cần thiết!", "Lỗi");
      return;
    }
      this.categoryToEdit.name = this.createCategoryForm.get("name")?.value;
      this.categoryService.createCategory(this.categoryToEdit).subscribe(
        () => {
          this.toastr.success("Thêm mới thành công!", "Thành công");
          // Đóng modal sau khi lưu thành công
          const editModalElement = document.getElementById(
            "createCategoryModal"
          );
          if (editModalElement) {
            const modal = bootstrap.Modal.getInstance(editModalElement);
            if (modal) {
              modal.hide();
            }
          }
          // Tải lại danh sách đơn hàng
          this.getAllCategories(
            this.keyword,
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

  openEditModal(categoryId: number): void {
    this.editCategoryForm.reset();
    this.categoryService.getCategory(categoryId).subscribe(
      (category: Category) => {
        if (category) {
          this.categoryToEdit = { ...category };

          const editModalElement = document.getElementById("editCategoryModal");
          if (editModalElement) {
            this.editCategoryForm.patchValue({
              name: category.name,
            });
            const modal = new bootstrap.Modal(editModalElement);
            modal.show();
          }
        } else {
          console.error("Danh mục không tồn tại");
        }
      },
      (error) => {
        console.error("Lỗi khi lấy chi tiết danh mục:", error);
      }
    );
  }
  updateCategory(): void {
      this.categoryToEdit.name = this.editCategoryForm.get("name")?.value;
      this.categoryService.updateCategory(this.categoryToEdit).subscribe(
        () => {
          this.toastr.success("Cập nhật danh mục sản phẩm thành công!", "Thành công");
          // Đóng modal sau khi lưu thành công
          const editModalElement = document.getElementById("editCategoryModal");
          if (editModalElement) {
            const modal = bootstrap.Modal.getInstance(editModalElement);
            if (modal) {
              modal.hide();
            }
          }
          // Tải lại danh sách đơn hàng
          this.getAllCategories(
            this.keyword,
            this.currentPage,
            this.itemsPerPage,
            this.sortField,
            this.sortDirection
          );
        },
        (error) => {
          this.toastr.error(
            "Cập nhật danh mục sản phẩm thất bại. Vui lòng thử lại!",
            "Lỗi"
          );
          console.error("Lỗi khi cập nhật danh mục sản phẩm:", error);
        }
      );
  }

  deleteCategory(orderId: number): void {
    if (confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
      this.categoryService.deleteCategory(orderId).subscribe(
        (response) => {
          this.toastr.success("Xóa đơn hàng thành công!", "Thành công");
          // Gọi hàm để tải lại danh sách đơn hàng hoặc thực hiện thao tác khác sau khi xóa thành công
          // Tải lại danh sách đơn hàng
          this.getAllCategories(
            this.keyword,
            this.currentPage,
            this.itemsPerPage,
            this.sortField,
            this.sortDirection
          );
        },
        (error) => {
          this.toastr.error("Xóa đơn hàng thất bại. Vui lòng thử lại!", "Lỗi");
          console.error("Lỗi khi xóa đơn hàng:", error);
        }
      );
    }
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllCategories(
      this.keyword,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onKeywordChange(): void {
    this.getAllCategories(
      this.keyword,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onSortChange(sortField: string, sortDirection): void {
    this.sortField = sortField;
    this.sortDirection = sortDirection;
    this.getAllCategories(
      this.keyword,
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
