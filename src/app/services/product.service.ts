import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Product } from '../models/product';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn:'root'
})
export class ProductService{
  private apiGetProducts = `${environment.apiBaseUrl}/products`;

  private categoryIdSource = new BehaviorSubject<number>(0);
  private keywordSource = new BehaviorSubject<string>('');

  currentCategoryId$ = this.categoryIdSource.asObservable();
  currentKeyword$ = this.keywordSource.asObservable();
  constructor(private http: HttpClient){}
  getProducts(keyword:string, categoryId:number,
    page: number, limit: number,  sortField: string, sortDirection: string
  ): Observable<Product[]>{
    const params = new HttpParams()
    .set('keyword', keyword)
    .set('category_id', categoryId.toString())
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('sortField', sortField)
    .set('sortDirection', sortDirection);
    return this.http.get<Product[]>(this.apiGetProducts, {params});
  }
  // Method to update categoryId
  setCategoryId(categoryId: number): void {
    this.categoryIdSource.next(categoryId);
  }

  // Method to update keyword
  setKeyword(keyword: string): void {
    this.keywordSource.next(keyword);
  }

  getDetailProduct(productId: number){
    return this.http.get(`${environment.apiBaseUrl}/products/${productId}`);
  }
  createProduct(product: Product){
    return this.http.post(`${this.apiGetProducts}`,product);
  }

  updateProduct(product: Product){
    return this.http.put(`${this.apiGetProducts}/${product.id}`, product)
  }

  getProductsByIds(productIds: number[]){
    const params = new HttpParams().set('ids', productIds.join(','));
    return this.http.get<Product[]>(`${this.apiGetProducts}/by-ids`,{params});
  }

  updateThumbnail(productId: number, thumbnailUrl: string): Observable<Product> {
    const body = { thumbnail_url: thumbnailUrl };
    return this.http.post<Product>(`${this.apiGetProducts}/${productId}/upload-thumbnail`, body);
  }

  deleteImage(imageId: number){
    return this.http.delete(`${this.apiGetProducts}/images/${imageId}`);
  }

  deleteProduct(productId: number){
    return this.http.delete(`${environment.apiBaseUrl}/products/${productId}`)
  }

  uploadImages(productId: number, files: File[]): Observable<any> {
    const formData = new FormData();

    // Append each file to the FormData object
    files.forEach(file => formData.append('files', file));

    const url = `${this.apiGetProducts}/uploads/${productId}`;
    return this.http.post(url, formData, {
      headers: new HttpHeaders({
        // 'Content-Type': 'multipart/form-data' // This is usually not needed
      })
    });
  }
}
