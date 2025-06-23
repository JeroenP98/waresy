import {CanActivate, CanActivateFn, Router} from '@angular/router';
import {inject, Injectable} from '@angular/core';
import {AuthService} from '../auth.service';
import {ToastService} from '../../services/toast-service.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  canActivate(): boolean {
    if (this.authService.getUser()?.role === 'Admin') {
        return true;
    } else {
        this.router.navigate(['/']);
        this.toastService.show("You don't have permission to access this page.", "error");
        return false;
    }
  }
}
