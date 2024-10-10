import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { OrderDTO } from '../dtos/order/order.dto';
import { OrderResponse } from '../responses/order/order.response';

@Injectable({
  providedIn: 'root',
})
export class OrderService{
  private apiUrl = `${environment.apiBaseUrl}/orders`;
  private apiGetAllOrrders = `${environment.apiBaseUrl}/orders/get-orders-by-keyword`;

  constructor(private http: HttpClient){

  }
  placeOrder(orderData: OrderDTO): Observable<any>{
    return this.http.post(this.apiUrl,orderData);
  }
  getOrderDetails(orderId: number){
    return this.http.get(`${environment.apiBaseUrl}/orders/${orderId}`);
  }
  updateOrder(order: OrderResponse): Observable<any> {
    return this.http.put(`${environment.apiBaseUrl}/orders/${order.id}`, order);
  }

  deleteOrder(orderId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${orderId}`);
  }


  getAllOrders(keyword:string, page: number, limit: number, sortField: string, sortDirection: string): Observable<OrderResponse[]>{
    const params = new HttpParams()
    .set('keyword', keyword)
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('sortField', sortField)
    .set('sortDirection', sortDirection);
    return this.http.get<any>(this.apiGetAllOrrders,{params});
  }
}
