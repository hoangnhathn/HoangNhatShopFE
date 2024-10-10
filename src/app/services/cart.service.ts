import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject: BehaviorSubject<Map<number, number>> = new BehaviorSubject<Map<number, number>>(new Map());
  private cart: Map<number, number> = new Map(); // key là id sản phẩm, value là số lượng

  constructor( private tokenService: TokenService) {
    this.loadCartFromLocalStorage();
  }

  addToCart(productId: number, quantity: number = 1): void {
    if (this.cart.has(productId)) {
      // Nếu sản phẩm đã có trong giỏ, tăng số lượng
      this.cart.set(productId, this.cart.get(productId)! + quantity);
    } else {
      this.cart.set(productId, quantity);
    }
    this.saveCartToLocalStorage();
    this.cartSubject.next(this.cart); // Cập nhật giá trị mới cho BehaviorSubject
  }

  removeFromCart(productId: number): void {
    if (this.cart.has(productId)) {
      this.cart.delete(productId); // Xóa sản phẩm khỏi giỏ hàng
      this.saveCartToLocalStorage();
      this.cartSubject.next(this.cart); // Cập nhật giá trị mới cho BehaviorSubject
    }
  }

  getCart(): Map<number, number> {
    return this.cart;
  }

  // Lấy giỏ hàng từ localStorage dựa trên userId
  getCartByUserId(userId: number): Observable<Map<number, number>> {
    const storedCart = localStorage.getItem(`cart_${userId}`);
    if (storedCart) {
      this.cart = new Map<number, number>(JSON.parse(storedCart));
    }
    this.cartSubject.next(this.cart); // Cập nhật giá trị mới cho BehaviorSubject
    return this.cartSubject.asObservable(); // Trả về Observable
  }

  private saveCartToLocalStorage(): void {
    // Lưu giỏ hàng vào localStorage với khóa theo userId (hoặc dùng khóa chung nếu không phân biệt người dùng)
    const userId = this.getUserIdFromToken(); // Hàm giả định để lấy userId từ token
    localStorage.setItem(`cart_${userId}`, JSON.stringify(Array.from(this.cart.entries())));
  }

  private loadCartFromLocalStorage(): void {
    const userId = this.getUserIdFromToken(); // Hàm giả định để lấy userId từ token
    const storedCart = localStorage.getItem(`cart_${userId}`);
    if (storedCart) {
      this.cart = new Map<number, number>(JSON.parse(storedCart));
      this.cartSubject.next(this.cart); // Cập nhật giá trị mới cho BehaviorSubject
    }
  }

  clearCart(): void {
    this.cart.clear(); // Xóa toàn bộ dữ liệu
    this.saveCartToLocalStorage(); // Lưu giỏ hàng mới vào local storage (trống)
    this.cartSubject.next(this.cart); // Cập nhật giá trị mới cho BehaviorSubject
  }

  private getUserIdFromToken(): number {
    return this.tokenService.getUserId();
  }
  resetCart(): void {
    this.cart = new Map(); // Tạo lại Map trống
    this.cartSubject.next(this.cart); // Cập nhật giá trị mới cho BehaviorSubject
  }
}
