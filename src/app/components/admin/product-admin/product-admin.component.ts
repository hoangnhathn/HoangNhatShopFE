import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { environment } from "src/app/environments/environment";
import { Product } from "src/app/models/product";
import { ProductImage } from "src/app/models/product.image";
import { CategoryService } from "src/app/services/category.service";
import { ProductService } from "src/app/services/product.service";

declare const bootstrap: any;
const MAX_IMAGES = 5;

@Component({
  selector: "app-product-admin",
  templateUrl: "./product-admin.component.html",
  styleUrls: ["./product-admin.component.css"],
})
export class ProductAdminComponent implements OnInit {
  editProductForm: FormGroup;
  createProductForm: FormGroup;
  products: Product[];
  categories: any[] = [];
  selectedProduct?: Product;
  selectedCategory: string = 'Chọn danh mục';  // Biến lưu trữ danh mục đã chọn
  categoryId: number = 0;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  pages: number[] = [];
  totalPages: number = 0;
  keyword: string = "";
  sortField: string = "id";
  sortDirection: string = "asc";
  visiblePages: number[] = [];
  ProductToEdit: Product = {
    id: 0,
    product_name: "",
    price: 0,
    rating: 0,
    thumbnail: "",
    description: "",
    category_id: 0,
    category_name: "",
    product_images: [],
  };

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.editProductForm = this.fb.group({
      product_name: ["", Validators.required],
      price: [
        0,
        [
          // Giá trị mặc định hợp lệ là số
          Validators.required,
          Validators.min(0), // Validator đồng bộ
          Validators.pattern(/^\d+$/), // Validator đồng bộ
        ],
      ],
      description: [""],
      category_id: ["", Validators.required],
      category_name: ["", Validators.required],
    });
    this.createProductForm = this.fb.group({
      product_name: ["", Validators.required],
      price: [
        0,
        [
          // Giá trị mặc định hợp lệ là số
          Validators.required,
          Validators.min(0), // Validator đồng bộ
          Validators.pattern(/^\d+$/), // Validator đồng bộ
        ],
      ],
      description: [""],
      category_id: ["", Validators.required],
      category_name: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllProducts(
      this.keyword,
      this.categoryId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
    // Lấy danh sách danh mục
    this.categoryService
      .getCategories("", 0, 100, "id", "asc")
      .subscribe((data: any) => {
        this.categories = data.categories;
      });
  }

  getAllProducts(
    keyword: string,
    categoryId: number,
    page: number,
    limit: number,
    sortField: string,
    sortDirection: string
  ) {
    this.productService
      .getProducts(keyword, categoryId, page, limit, sortField, sortDirection)
      .subscribe({
        next: (response: any) => {
          response.products.forEach((product: Product) => {
            product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
          });
          this.products = response.products;
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

  openCreateModal(): void {
    this.createProductForm.reset();
    this.ProductToEdit = {
      id: 0,
      product_name: "",
      price: 0,
      rating: 0,
      thumbnail: "",
      description: "",
      category_id: 0,
      category_name: "",
      product_images: [],
    };
    const createModalElement = document.getElementById("createProductModal");
    if (createModalElement) {
      const modal = new bootstrap.Modal(createModalElement);
      modal.show();
    } else {
      console.error("Không tìm thấy phần tử modal với id 'createProductModal'");
    }
  }

  createCategory(): void {
    if (this.createProductForm.invalid) {
      this.toastr.error("Vui lòng điền đầy đủ thông tin cần thiết!", "Lỗi");
      return;
    }
    this.ProductToEdit.product_name = this.createProductForm.get("product_name")?.value;
    this.ProductToEdit.price = this.createProductForm.get("price")?.value;
    this.ProductToEdit.description = this.createProductForm.get("description")?.value;
    this.ProductToEdit.category_id = this.createProductForm.get("category_id")?.value;
      this.productService.createProduct(this.ProductToEdit).subscribe(
        () => {
          this.toastr.success("Thêm mới thành công!", "Thành công");
          // Đóng modal sau khi lưu thành công
          const editModalElement = document.getElementById(
            "createProductModal"
          );
          if (editModalElement) {
            const modal = bootstrap.Modal.getInstance(editModalElement);
            if (modal) {
              modal.hide();
            }
          }
          // Tải lại danh sách sản phẩm
          this.getAllProducts(
            this.keyword,
            this.categoryId,
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

  openModal(productId: number): void {
    this.productService
      .getDetailProduct(productId)
      .subscribe((product: Product) => {
        product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
        this.selectedProduct = product;
        const modalElement = document.getElementById("productModal");
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      });
  }

  openEditModal(productId: number): void {
    this.editProductForm.reset();
    this.productService.getDetailProduct(productId).subscribe(
      (product: Product) => {
        if (product) {
          this.ProductToEdit = { ...product };

          const editModalElement = document.getElementById("editProductModal");
          if (editModalElement) {
            this.editProductForm.patchValue({
              product_name: product.product_name,
              price: product.price,
              description: product.description,
              category_id: product.category_id,
            });
            const modal = new bootstrap.Modal(editModalElement);
            modal.show();
          }
        } else {
          console.error("Sản phẩm không tồn tại");
        }
      },
      (error) => {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      }
    );
  }
  updateProduct(): void {
    this.ProductToEdit.product_name =
      this.editProductForm.get("product_name")?.value;
    this.ProductToEdit.price = this.editProductForm.get("price")?.value;
    this.ProductToEdit.description =
      this.editProductForm.get("description")?.value;
    this.ProductToEdit.category_id =
      this.editProductForm.get("category_id")?.value;
    this.ProductToEdit.category_name =
      this.editProductForm.get("category_name")?.value;
    this.productService.updateProduct(this.ProductToEdit).subscribe(
      () => {
        this.toastr.success("Cập nhật sản phẩm thành công!", "Thành công");
        // Đóng modal sau khi lưu thành công
        const editModalElement = document.getElementById("editProductModal");
        if (editModalElement) {
          const modal = bootstrap.Modal.getInstance(editModalElement);
          if (modal) {
            modal.hide();
          }
        }
        // Tải lại danh sách sản phẩm
        this.getAllProducts(
          this.keyword,
          this.categoryId,
          this.currentPage,
          this.itemsPerPage,
          this.sortField,
          this.sortDirection
        );
      },
      (error) => {
        this.toastr.error(
          "Cập nhật sản phẩm thất bại. Vui lòng thử lại!",
          "Lỗi"
        );
        console.error("Lỗi khi cập nhật sản phẩm:", error);
      }
    );
  }

  deleteProduct(productId: number): void {
    if (confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
      this.productService.deleteProduct(productId).subscribe(
        (response) => {
          this.toastr.success("Xóa đơn hàng thành công!", "Thành công");
          // Gọi hàm để tải lại danh sách sản phẩm hoặc thực hiện thao tác khác sau khi xóa thành công
          // Tải lại danh sách sản phẩm
        this.getAllProducts(
          this.keyword,
          this.categoryId,
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
  openImageModal(productId: number): void {
    this.productService
      .getDetailProduct(productId)
      .subscribe((product: Product) => {
        product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
        // Cập nhật đường dẫn cho từng ảnh
        product.product_images = product.product_images.map((productImage) => ({
          ...productImage,
          image_url: `${environment.apiBaseUrl}/products/images/${productImage.image_url}`,
        }));

        this.selectedProduct = product;

        const imageModalElement = document.getElementById("imageModal");
        if (imageModalElement) {
          const modal = new bootstrap.Modal(imageModalElement);
          modal.show();
        }
      });
  }

  removeImage(image: ProductImage): void {
    if (this.selectedProduct) {
      this.productService.deleteImage(image.id).subscribe({
        next: () => {
          this.selectedProduct.product_images =
            this.selectedProduct.product_images.filter(
              (img) => img.id !== image.id
            );
        },
        error: (error) => {
          console.error("Error deleting image: ", error);
        },
      });
    }
  }

  selectThumbnail(imageUrl: string): void {
    const imageName = this.extractImageName(imageUrl);
    if (this.selectedProduct) {
      this.productService
        .updateThumbnail(this.selectedProduct.id, imageName)
        .subscribe({
          next: (updatedProduct) => {
            this.selectedProduct.thumbnail = imageUrl;
            this.getAllProducts(
              this.keyword,
              this.categoryId,
              this.currentPage,
              this.itemsPerPage,
              this.sortField,
              this.sortDirection
            );
          },
          error: (error) => {
            console.error("Error updating thumbnail: ", error);
          },
        });
    }
  }

  // Phương thức để trích xuất tên ảnh từ URL
  extractImageName(imageUrl: string): string {
    return imageUrl.split("/").pop() || "";
  }

  onFileSelect(event: any): void {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      const fileArray = Array.from(files);
      // Tổng số ảnh hiện có + ảnh mới tải lên
      const totalImages =
        fileArray.length + this.selectedProduct.product_images.length;

      if (totalImages > MAX_IMAGES) {
        alert(
          `Chỉ có thể tải tối đa ${MAX_IMAGES} ảnh cho mỗi sản phẩm. Hiện tại sản phẩm đã có ${this.selectedProduct.product_images.length} ảnh.`
        );
        return; // Kết thúc hàm nếu số lượng ảnh vượt quá giới hạn
      }
      this.productService
        .uploadImages(this.selectedProduct.id, fileArray)
        .subscribe({
          next: (response) => {
            console.log("Images uploaded successfully", response);
            this.loadProductDetails(this.selectedProduct.id); // Tải lại dữ liệu sản phẩm
            event.target.value = ""; // Xoá input file sau khi upload
            // Handle success response
          },
          error: (error) => {
            console.error("Error uploading images", error);
            alert(error.toString());
            this.loadProductDetails(this.selectedProduct.id); // Tải lại dữ liệu sản phẩm
            event.target.value = ""; // Xoá input file sau khi upload
            // Handle error response
          },
        });
    }
  }
  loadProductDetails(productId: number): void {
    this.productService.getDetailProduct(productId).subscribe({
      next: (response: any) => {
        response.product_images = response.product_images.map(
          (productImage) => ({
            ...productImage,
            image_url: `${environment.apiBaseUrl}/products/images/${productImage.image_url}`,
          })
        );
        response.thumbnail = `${environment.apiBaseUrl}/products/images/${response.thumbnail}`;
        this.selectedProduct = response;
      },
      error: (error) => {
        console.error("Error fetching product details", error);
      },
    });
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.getAllProducts(
      this.keyword,
      this.categoryId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onKeywordChange(): void {
    this.getAllProducts(
      this.keyword,
      this.categoryId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onSortChange(sortField: string, sortDirection): void {
    this.sortField = sortField;
    this.sortDirection = sortDirection;
    this.getAllProducts(
      this.keyword,
      this.categoryId,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }
  onCategoryChange(categoryId: number): void {
    const selected = this.categories.find(category => category.id === categoryId);
    this.selectedCategory = selected ? selected.name : 'Chọn danh mục';
    this.categoryId = categoryId;
    this.getAllProducts(
      this.keyword,
      this.categoryId,
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
  truncateText(text: string, maxLength: number): string {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    } else {
      return text;
    }
  }
}
