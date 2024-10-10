import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { Slide } from '../models/slide';

@Injectable({
  providedIn:'root'
})
export class SlideService{
  private apiGetSlides = `${environment.apiBaseUrl}/slides`;

  constructor(private http: HttpClient){}
  getSlides(page: number, limit: number):Observable<any>{
    const params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString())
    return this.http.get<any[]>(this.apiGetSlides, {params});
  }

  createSlide(slide: Slide){
    return this.http.post(`${this.apiGetSlides}`,slide);
  }

  uploadImages(slideId: number, files: File[]): Observable<any> {
    const formData = new FormData();

    files.forEach(file => formData.append('files', file));

    const url = `${this.apiGetSlides}/uploads/${slideId}`; // Đảm bảo URL chính xác
    return this.http.post(url, formData, {
      // Không cần thiết lập 'Content-Type' cho multipart/form-data ở đây
    });
  }

  deleteSlide(slideId: number){
    return this.http.delete(`${this.apiGetSlides}/${slideId}`)
  }
}
