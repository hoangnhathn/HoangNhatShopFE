
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/app/environments/environment";
import { OrderDetail } from "src/app/models/order.detail";
import { Product } from "src/app/models/product";
import { OrderResponse } from "src/app/responses/order/order.response";
import { OrderService } from "src/app/services/order.service";

@Component({
  selector: "app-order-detail",
  templateUrl: "./order.detail.component.html",
  styleUrls: ["./order.detail.component.css"],
})
export class OrderDetailComponent implements OnInit {
  cartItems: { product: Product, quantity: number }[] = [];
  totalAmount: number = 0;

  orderResponses: OrderResponse ={
    id: 0,
    user_id: 0,
    fullname: '',
    phone_number: '',
    email: '',
    address: '',
    note: '',
    order_date: new Date(),
    status: '',
    total_money: 0,
    payment_method: '',
    shipping_method: '',
    shipping_address: '',
    shipping_date: new Date(),
    order_details: []
  }

  constructor(private orderService: OrderService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = +params.get('id')!;
      this.getOrderDetails(orderId);
    });
  }

  getOrderDetails(orderId: number){
    this.orderService.getOrderDetails(orderId).subscribe({
      next: (response: any)=>{
        this.orderResponses.id=response.id;
        this.orderResponses.user_id=response.user_id;
        this.orderResponses.fullname=response.fullname;
        this.orderResponses.email=response.email;
        this.orderResponses.phone_number=response.phone_number;
        this.orderResponses.address=response.address;
        this.orderResponses.note=response.note;
        this.orderResponses.shipping_address=response.shipping_address;
        this.orderResponses.order_date = new Date(
          response.order_date[0],
          response.order_date[1]-1,
          response.order_date[2]
        );
        this.orderResponses.order_details=response.order_details.map((order_detail: OrderDetail)=>{
          order_detail.thumbnail=`${environment.apiBaseUrl}/products/images/${order_detail.thumbnail}`;
          return order_detail;
        });
        this.orderResponses.payment_method = response.payment_method;
        this.orderResponses.shipping_date = new Date(
          response.order_date[0],
          response.order_date[1]-1,
          response.order_date[2]
        );

        this.orderResponses.shipping_method=response.shipping_method;
        this.orderResponses.status = response.status;
        this.orderResponses.total_money=response.total_money
      },
      complete:()=>{

      },
      error: (error: any)=>{

      }
    })
  }

  calculateTotal(): void{
    this.totalAmount = this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }
}
