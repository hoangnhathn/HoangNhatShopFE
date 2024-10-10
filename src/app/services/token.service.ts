import { Injectable } from "@angular/core";
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root',
})
export class TokenService{
  private readonly TOKEN_KEY = 'authToken';
  private jwtHelperService = new JwtHelperService();
  constructor(){}
  getToken():string | null{
    return localStorage.getItem(this.TOKEN_KEY)||sessionStorage.getItem('authToken');
  }
  setTokenLocal(token: string):void{
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  setTokenSession(token: string):void{
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }
  getUserId(): number {
    const token = this.getToken();
    if (!token) {
      return 0;
    }

    const userObject = this.jwtHelperService.decodeToken(token);
    if (userObject && 'userId' in userObject) {
      return parseInt(userObject['userId'], 10);
    }

    return 0;
  }
  removeToken():void{
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
  isTokenExpired(): boolean{
    if(this.getToken()==null){
      return false;
    }
    return this.jwtHelperService.isTokenExpired(this.getToken()!);
  }

}
