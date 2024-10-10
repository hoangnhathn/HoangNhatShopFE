import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderDTO } from 'src/app/dtos/order/order.dto';
import { environment } from 'src/app/environments/environment';
import { Product } from 'src/app/models/product';
import { CartService } from 'src/app/services/cart.service';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { TokenService } from 'src/app/services/token.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orderForm: FormGroup;
  cartItems: { product: Product, quantity: number }[] = [];
  couponCode: string = '';
  totalAmount: number = 0;
  orderData: OrderDTO={
    user_id: 3,
    fullname: 'hcn',
    email: '',
    phone_number: '0968069958',
    note: 'khong',
    total_money: 0,
    payment_method: 'cod',
    shipping_method: 'express',
    shipping_address: 'hanoi',
    coupon_code: '',
    cart_items: []
  };
  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.email]],
      phone_number: [0, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      note: [''],
      shipping_method: [''],
      shipping_address: ['',[Validators.required, Validators.minLength(5)]],
      payment_method: ['']
    });
   }

  ngOnInit(): void {
    this.orderData.user_id = this.tokenService.getUserId();
    this.loadCart();
  }

  loadCart(): void {
    const userId = this.orderData.user_id;
    if (userId <= 0) {
      console.error('Invalid user ID');
      return;
    }

    this.cartService.getCartByUserId(userId).subscribe({
      next: (cart) => {
        const productIds = Array.from(cart.keys());
        if (productIds.length === 0) {
          return;
        }
        this.productService.getProductsByIds(productIds).subscribe({
          next: (products) => {
            this.cartItems = productIds.map((productId) => {
              const product = products.find((p) => p.id === productId);
              if (product) {
                product.thumbnail = `${environment.apiBaseUrl}/products/images/${product.thumbnail}`;
              }
              return {
                product: product!,
                quantity: cart.get(productId)!
              };
            });
          },
          complete: () => {
            this.calculateTotal();
          },
          error: (error: any) => {
            console.error('Error fetching products: ', error);
          }
        });
      },
      error: (error: any) => {
        console.error('Error fetching cart: ', error);
      }
    });
  }

  increaseQuantity(item: any) {
    item.quantity++;
    this.calculateTotal();
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.calculateTotal();
    }
  }

  removeItem(item: any) {
    this.cartItems = this.cartItems.filter(i => i !== item);
    this.cartService.removeFromCart(item.product.id);  // Cập nhật service sau khi xóa
    this.calculateTotal();
  }

  placeOrder(){
    if(this.cartItems.length === 0){
      alert('Giỏ hàng của bạn trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
      return;
    }
    if(this.orderForm.valid){
      this.orderData = {
        ...this.orderData,
        ...this.orderForm.value
      };
      this.orderData.cart_items = this.cartItems.map(cartItem => ({
        product_id: cartItem.product.id,
        quantity: cartItem.quantity
      }));
      this.orderData.total_money = this.totalAmount;
      this.orderService.placeOrder(this.orderData).subscribe({
        next: (response) =>{
          alert('Đặt hàng thành công');
          this.cartService.clearCart();
          this.router.navigate(['/orders/', response.id])
        },
        complete: ()=>{
          this.calculateTotal();
        },
        error: (error: any)=>{
          alert(`Lỗi: ${error}`);
        }
      })
    }
  }

  calculateTotal(): void{
    this.totalAmount = this.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  }
}
