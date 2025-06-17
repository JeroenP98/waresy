import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../auth.service';
import {Router} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    NgIf,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  errorMessage: string | null = null;


  onSubmit() {
    this.authService.login(this.email, this.password).subscribe({
      next: result => {
        if (result.success) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage = result.error || 'Login failed';
        }
      },
      error: err => {
        this.errorMessage = 'Login failed. Please try again.';
      }
    });
  }
}
