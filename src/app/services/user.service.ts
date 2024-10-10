import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { BehaviorSubject, Observable } from 'rxjs';
import { RegisterDTO } from '../dtos/user/register.dto';
import { LoginDTO } from '../dtos/user/login.dto';
import { environment } from '../environments/environment';
import { UserResponse } from '../responses/user/user.response';
import { User } from '../models/user';
import { UpdateUserDTO } from '../dtos/user/update.user.dto';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiRegister = `${environment.apiBaseUrl}/users/register`;
  private apiLogin = `${environment.apiBaseUrl}/users/login`;
  private apiUserDetail = `${environment.apiBaseUrl}/users/details`;
  private apiUser = `${environment.apiBaseUrl}/users`;
  private userResponseSubject = new BehaviorSubject<UserResponse | null>(null);
  userResponse$ = this.userResponseSubject.asObservable();

  constructor(private http: HttpClient,) { }
  register(registerDTO: RegisterDTO):Observable<any>{
    return this.http.post(this.apiRegister, registerDTO)
  }
  login(loginDTO: LoginDTO): Observable<any>{
    return this.http.post(this.apiLogin, loginDTO)
  }
  getUserDetail(token: string){
    return this.http.post(this.apiUserDetail, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    })
  }
  getUserDetailById(userId: number){
    return this.http.get(`${this.apiUser}/${userId}`);
  }

  saveUserResponseToLocalStorage(userResponse?: UserResponse){
    try{
      if(userResponse === null||!userResponse){return;}
      const userResponseJSON = JSON.stringify(userResponse);

      localStorage.setItem('user', userResponseJSON);
      console.log('User response saved to local storage.');
    } catch(error){
      console.error('Error: ',error);
    }
  }
  saveUserResponseToSessionStorage(userResponse: UserResponse): void {
    try{
      if(userResponse === null||!userResponse){return;}
      const userResponseJSON = JSON.stringify(userResponse);

      sessionStorage.setItem('user', userResponseJSON);
      console.log('User response saved to local storage.');
    } catch(error){
      console.error('Error: ',error);
    }
  }
  getUserResponseFromLocalStorage(): UserResponse| null{
    try{
      const userResponseJSONS = sessionStorage.getItem('user');
      if(userResponseJSONS ==null || userResponseJSONS==undefined){
        const userResponseJSONL = localStorage.getItem('user');
        if(userResponseJSONL ==null || userResponseJSONL==undefined){
          return null;
        }
        const userResponse = JSON.parse(userResponseJSONL!);
        return userResponse;
      }
      const userResponse = JSON.parse(userResponseJSONS!);
      return userResponse;
    } catch(error){
      console.log('Error: ',error)
      return null;
    }
  }
  removeUserFromLocalStorage(): void{
    try{
      localStorage.removeItem('user');
      sessionStorage.removeItem('user')
    } catch(error){
      console.error('Error moving user form local storage: ',error);
    }
  }
  getAllUsers(keyword:string, roleId:number,
    page: number, limit: number,  sortField: string, sortDirection: string
  ): Observable<User[]>{
    const params = new HttpParams()
    .set('keyword', keyword)
    .set('role_id', roleId.toString())
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('sortField', sortField)
    .set('sortDirection', sortDirection);
    return this.http.get<User[]>(`${environment.apiBaseUrl}/users`, {params});
  }

  updateUser(updateUserDTO: UpdateUserDTO){
    return this.http.put(`${this.apiUser}/${updateUserDTO.id}`, updateUserDTO);
  }

  createUser(registerDTO: RegisterDTO){
    return this.http.post(this.apiRegister, registerDTO);
  }

  updateUserDetail(userId: number, updateUserDetail: UpdateUserDTO){
    return this.http.put(`${this.apiUserDetail}/${userId}`, updateUserDetail);
  }

  deleteUser(userId: number){
    return this.http.delete(`${this.apiUser}/${userId}`);
  }

  // Phát giá trị mới khi có thay đổi người dùng
  setUserResponse(updatedUser: UserResponse): void {
    this.userResponseSubject.next(updatedUser);
  }
}
