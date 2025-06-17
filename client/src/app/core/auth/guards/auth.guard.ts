import {CanActivate, CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {inject, Injectable} from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);
  canActivate(): boolean {
    if (this.authService.getToken()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
