import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { NotificationType } from '../enum/notification-type.enum';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthenticationService,
               private router: Router,
               private notificationService: NotificationService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    return this.isUserLoggedIn();
  }

  isUserLoggedIn(): boolean {
    if(this.authService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    //TODO Send notification to user
    this.notificationService.notify(NotificationType.ERROR, 'You need to login to acces this page.');
    return false;
  }
  
}
