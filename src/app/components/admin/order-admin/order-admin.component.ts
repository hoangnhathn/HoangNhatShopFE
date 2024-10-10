import { Component, OnInit } from "@angular/core";
import { environment } from "src/app/environments/environment";
import { OrderResponse } from "src/app/responses/order/order.response";
import { OrderService } from "src/app/services/order.service";
import { ToastrService } from "ngx-toastr"; // Thêm import nàyimport { ToastrService } from 'ngx-toastr'; // Thêm import này
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { shippingDateValidator } from "src/app/validator/validator";

declare const bootstrap: any;

@Component({
  selector: "app-order-admin",
  templateUrl: "./order-admin.component.html",
  styleUrls: ["./order-admin.component.css"],
})
export class OrderAdminComponent implements OnInit {
  editOrderForm: FormGroup;
  orders: OrderResponse[];

  selectedOrder?: OrderResponse;
  currentPage: number = 0;
  itemsPerPage: number = 10;
  pages: number[] = [];
  totalPages: number = 0;
  keyword: string = "";
  sortField: string = "id";
  sortDirection: string = "asc";
  visiblePages: number[] = [];
  orderToEdit: OrderResponse = {
    id: 0,
    user_id: 0,
    fullname: "",
    phone_number: "",
    email: "",
    address: "",
    note: "",
    order_date: new Date(),
    status: "",
    total_money: 0,
    payment_method: "",
    shipping_method: "",
    shipping_address: "",
    shipping_date: new Date(),
    active: true,
    order_details: [],
  };
  formattedShippingDate: string = "";
  formattedOrderDate: string = "";

  constructor(

    private orderService: OrderService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.editOrderForm = this.fb.group(
      {
        fullname: ["", Validators.required],
        phone_number: [
          "",
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(10),
            Validators.pattern(/^0\d{9}$/), // Yêu cầu số bắt đầu bằng 0 và dài 10 chữ số
          ],
        ],
        email: ["", [Validators.email]],
        shipping_address: ["", [Validators.required, Validators.minLength(5)]],
        shipping_method: ["", Validators.required],
        payment_method: ["", Validators.required],
        status: ["", Validators.required],
        active: ["", Validators.required],
        note: [""],
        total_money: [
          0,
          [
            // Giá trị mặc định hợp lệ là số
            Validators.required,
            Validators.min(0), // Validator đồng bộ
            Validators.pattern(/^\d+$/), // Validator đồng bộ
          ],
        ],
        shipping_date: ["", Validators.required],
        order_date: ["", Validators.required],
      },
      {
        validator: shippingDateValidator("order_date", "shipping_date"),
      }
    );
  }

  ngOnInit(): void {
    this.getAllOrders(
      this.keyword,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );

  }
  openModal(orderId: number): void {
    this.orderService
      .getOrderDetails(orderId)
      .subscribe((order: OrderResponse) => {
        // Cập nhật đường dẫn hình ảnh cho mỗi chi tiết đơn hàng
        order.order_details.forEach((detail) => {
          detail.thumbnail = detail.thumbnail
            ? `${environment.apiBaseUrl}/products/images/${detail.thumbnail}`
            : null;
        });
        this.selectedOrder = order;
        const modalElement = document.getElementById("orderModal");
        if (modalElement) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        }
      });
  }
  openEditModal(orderId: number): void {
    this.editOrderForm.reset();
    this.orderService.getOrderDetails(orderId).subscribe(
      (order: OrderResponse) => {
        if (order) {
          const formattedOrderDate = this.formatDateOrArray(order.order_date);
          const formattedShippingDate = this.formatDateOrArray(order.shipping_date);
          order.order_details.forEach((detail) => {
            detail.thumbnail = detail.thumbnail
              ? `${environment.apiBaseUrl}/products/images/${detail.thumbnail}`
              : null;
          });
          this.orderToEdit = { ...order };

          const editModalElement = document.getElementById("editOrderModal");
          if (editModalElement) {
            this.editOrderForm.patchValue({
              fullname: order.fullname,
              email: order.email,
              phone_number: order.phone_number,
              shipping_address: order.shipping_address,
              order_date: formattedOrderDate,
              shipping_date: formattedShippingDate,
              payment_method: order.payment_method,
              status: order.status,
              active: order.active,
              note: order.note,
              total_money: order.total_money,
            });
            const modal = new bootstrap.Modal(editModalElement);
            modal.show();
          }
        } else {
          console.error("Đơn hàng không tồn tại");
        }
      },
      (error) => {
        console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
      }
    );
  }

  updateOrder(): void {
    this.orderToEdit.fullname = this.editOrderForm.get("fullname")?.value;
    this.orderToEdit.email = this.editOrderForm.get("email")?.value;
    this.orderToEdit.phone_number =
      this.editOrderForm.get("phone_number")?.value;
    this.orderToEdit.shipping_address =
      this.editOrderForm.get("shipping_address")?.value;
    this.orderToEdit.shipping_date = new Date(
      this.editOrderForm.get("shipping_date")?.value
    );
    this.orderToEdit.payment_method =
      this.editOrderForm.get("payment_method")?.value;
    this.orderToEdit.status = this.editOrderForm.get("status")?.value;
    this.orderToEdit.active = this.editOrderForm.get("active")?.value;
    this.orderToEdit.note = this.editOrderForm.get("note")?.value;
    this.orderToEdit.total_money = this.editOrderForm.get("total_money")?.value;
    this.orderService.updateOrder(this.orderToEdit).subscribe(
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
        // Tải lại danh sách đơn hàng
        this.getAllOrders(
          this.keyword,
          this.currentPage,
          this.itemsPerPage,
          this.sortField,
          this.sortDirection
        );
      },
      (error) => {
        this.toastr.error(
          "Cập nhật đơn hàng thất bại. Vui lòng thử lại!",
          "Lỗi"
        );
        console.error("Lỗi khi cập nhật đơn hàng:", error);
      }
    );
  }

  deleteOrder(orderId: number): void {
    if (confirm("Bạn có chắc muốn xóa đơn hàng này không?")) {
      this.orderService.deleteOrder(orderId).subscribe(
        (response) => {
          this.toastr.success("Xóa đơn hàng thành công!", "Thành công");
          this.getAllOrders(
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


  onShippingDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.orderToEdit.shipping_date = new Date(input.value);
  }
  getAllOrders(
    keyword: string,
    page: number,
    limit: number,
    sortField: string,
    sortDirection: string
  ) {
    this.orderService
      .getAllOrders(keyword, page, limit, sortField, sortDirection)
      .subscribe({
        next: (response: any) => {
          this.orders = response.orders;
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
    this.getAllOrders(
      this.keyword,
      this.currentPage,
      this.itemsPerPage,
      this.sortField,
      this.sortDirection
    );
  }

  onKeywordChange(): void {
    console.log("onKeywordChange called with keyword:", this.keyword);
    this.getAllOrders(
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
    this.getAllOrders(
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
