import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { Slide } from '../models/slide';
import { Review } from '../models/review';
import { ReviewDTO } from '../dtos/review/review.dto';

@Injectable({
  providedIn:'root'
})
export class ReviewService{
  private apiGetReview = `${environment.apiBaseUrl}/reviews`;

  constructor(private http: HttpClient){}
  getReviews(user_id: number, product_id: number):Observable<any>{
    let params = new HttpParams();

    // Nếu user_id không phải là null, thêm nó vào params
    if (user_id !== null && user_id !== undefined) {
      params = params.set('user_id', user_id.toString());
    }

    // Luôn thêm product_id vào params
    params = params.set('product_id', product_id.toString());

    return this.http.get<any[]>(this.apiGetReview, { params });
  }

  createReview(review: ReviewDTO){
    return this.http.post(`${this.apiGetReview}`,review);
  }

  uploadImages(slideId: number, files: File[]): Observable<any> {
    const formData = new FormData();

    files.forEach(file => formData.append('files', file));

    const url = `${this.apiGetReview}/uploads/${slideId}`; // Đảm bảo URL chính xác
    return this.http.post(url, formData, {
      // Không cần thiết lập 'Content-Type' cho multipart/form-data ở đây
    });
  }

  deleteSlide(slideId: number){
    return this.http.delete(`${this.apiGetReview}/${slideId}`)
  }
}
