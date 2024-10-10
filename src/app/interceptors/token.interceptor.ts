import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../services/token.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();

    const isFormData = req.body instanceof FormData;
    const headersConfig: { [key: string]: string } = {
      'Accept-Language': 'vi',
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      headersConfig['Content-Type'] = 'application/json';
    }

    const clonedReq = req.clone({
      setHeaders: headersConfig
    });
    return next.handle(clonedReq);
  }
}
