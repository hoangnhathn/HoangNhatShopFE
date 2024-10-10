import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Category } from '../models/category';

@Injectable({
  providedIn:'root'
})
export class CategoryService{
  private apiGetCategories = `${environment.apiBaseUrl}/categories`;
  constructor(private http: HttpClient){}
  getCategories(keyword:string, page: number, limit: number, sortField: string, sortDirection: string
  ): Observable<Category[]>{
    const params = new HttpParams()
    .set('keyword', keyword)
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('sortField', sortField)
    .set('sortDirection', sortDirection);
    return this.http.get<Category[]>(this.apiGetCategories, {params});
  }
  getCategory(categoryId: number){
    return this.http.get<Category>((`${this.apiGetCategories}/${categoryId}`));
  }
  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiGetCategories}/${categoryId}`);
  }

  updateCategory(category: Category){
    return this.http.put(`${this.apiGetCategories}/${category.id}`, category)
  }

  createCategory(category: Category): Observable<any> {
    return this.http.post(`${this.apiGetCategories}`,category);
  }
}
