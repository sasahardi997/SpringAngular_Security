import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../service/authentication.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthenticationService) {}

  intercept(httpRequest: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    if(httpRequest.url.includes(`${this.authService.host}/user/login`) 
      || httpRequest.url.includes(`${this.authService.host}/user/register`)) {
      return httpHandler.handle(httpRequest); //permit all
    };
    this.authService.loadToken();
    const token = this.authService.getToken();
    const request = httpRequest.clone({setHeaders:  //Clone old request and add token to headed
      {
        Authorization: `Bearer ${token}`
      }
    });
    return httpHandler.handle(request); //Send request with header
  }
}
