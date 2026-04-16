import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { NotificationService } from '../../core/notification.service';

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

  constructor(
    private api: ApiService,
    private router: Router,
    private notification: NotificationService
  ) {}

  login(): void {
    const usernameOrEmail = this.loginForm.usernameOrEmail.trim();
    const password = this.loginForm.password.trim();

    if (!usernameOrEmail || !password) {
      this.notification.error('Ingrese usuario/correo y contraseña.');
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
          this.notification.success('Credenciales válidas. Redirigiendo...');
          this.loginNgForm?.resetForm({
            usernameOrEmail: '',
            password: ''
          });
          this.showLoginPassword = false;
          setTimeout(() => this.router.navigate(['/users']), 1000);
        },
        error: (err: any) => {
          let msg: string;
          let backendMessage: string | undefined;
          let httpStatus: number | undefined;
          let endpoint = '/api/users/login';

          if (err?.name === 'TimeoutError') {
            msg = 'Tiempo de espera agotado (8s). El servidor no responde.';
          } else if (err?.status === 401) {
            msg = 'Autenticación fallida.';
            backendMessage = err?.error?.mensaje || err?.error?.message || 'Usuario o contraseña incorrectos.';
            httpStatus = 401;
          } else if (err?.status === 400) {
            msg = 'Solicitud inválida.';
            backendMessage = err?.error?.mensaje || err?.error?.message || 'Verifique los datos enviados.';
            httpStatus = 400;
          } else if (err?.status === 0) {
            msg = 'No se puede conectar con el servidor.';
            backendMessage = 'La URL del backend puede ser incorrecta o no está disponible.';
          } else if (err?.status >= 500) {
            msg = 'Error en el servidor.';
            backendMessage = err?.error?.mensaje || err?.error?.message || 'El backend está experientando problemas.';
            httpStatus = err?.status;
          } else {
            msg = 'Error al iniciar sesión.';
            backendMessage = err?.error?.mensaje || err?.error?.message || err?.statusText || 'Intente nuevamente.';
            httpStatus = err?.status;
          }

          this.notification.error(msg, 0, {
            httpStatus,
            backendMessage,
            endpoint,
            timestamp: new Date().toLocaleString('es-ES'),
            clientError: err?.message || 'Ver consola para detalles'
          });
        }
      });
  }
}
