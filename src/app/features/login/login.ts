import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  @ViewChild('loginNgForm') loginNgForm?: NgForm;

  loginForm = { usernameOrEmail: '', password: '' };
  showLoginPassword = false;
  isLoggingIn = false;
  loginStatusMessage = '';
  loginStatusType: 'success' | 'error' | '' = '';

  constructor(private api: ApiService, private router: Router) {}

  login(): void {
    const usernameOrEmail = this.loginForm.usernameOrEmail.trim();
    const password = this.loginForm.password.trim();

    if (!usernameOrEmail || !password) {
      this.loginStatusType = 'error';
      this.loginStatusMessage = 'Ingrese usuario/correo y contrasena.';
      return;
    }

    this.isLoggingIn = true;
    this.loginStatusMessage = '';
    this.loginStatusType = '';

    this.api.login({ usernameOrEmail, password })
      .pipe(
        timeout(8000),
        finalize(() => {
          this.isLoggingIn = false;
        })
      )
      .subscribe({
        next: () => {
          this.loginStatusType = 'success';
          this.loginStatusMessage = 'Credenciales validas';
          alert(this.loginStatusMessage);
          this.loginNgForm?.resetForm({
            usernameOrEmail: '',
            password: ''
          });
          this.showLoginPassword = false;
          this.router.navigate(['/users']);
        },
        error: (err: any) => {
          const msg = err?.error?.mensaje || err?.error?.message || (err?.name === 'TimeoutError' ? 'Tiempo de espera agotado' : 'Credenciales invalidas');
          this.loginStatusType = 'error';
          this.loginStatusMessage = msg;
          alert(this.loginStatusMessage);
        }
      });
  }
}
