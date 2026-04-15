import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {

  @ViewChild('loginNgForm') loginNgForm?: NgForm;
  users: User[] = [];
  loginForm = { usernameOrEmail: '', password: '' };
  showLoginPassword = false;
  isLoggingIn = false;
  loginStatusMessage = '';
  loginStatusType: 'success' | 'error' | '' = '';
  showForm = false;
  editMode = false;
  editingUserId: number | null = null;
  newUser: User = { username: '', email: '', password: '', active: true };

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: data => {
        this.users = data;
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  deleteUser(id: number): void {
    this.api.deleteUser(id).subscribe(() => this.loadUsers());
  }

  login(): void {
    if (this.isLoggingIn) {
      return;
    }

    const usernameOrEmail = this.loginForm.usernameOrEmail.trim();
    const password = this.loginForm.password.trim();

    if (!usernameOrEmail || !password) {
      this.loginStatusType = 'error';
      this.loginStatusMessage = 'Ingrese usuario/correo y contraseña.';
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
        next: (_response: any) => {
          this.isLoggingIn = false;
          this.loginStatusType = 'success';
          this.loginStatusMessage = 'Credenciales validas';
          alert(this.loginStatusMessage);
          this.loginNgForm?.resetForm({
            usernameOrEmail: '',
            password: '',
            showLoginPassword: false
          });
        },
        error: (err: any) => {
          this.isLoggingIn = false;
          this.loginStatusType = 'error';
          const msg = err?.error?.mensaje || err?.error?.message || (err?.name === 'TimeoutError' ? 'Tiempo de espera agotado' : 'Credenciales invalidas');
          this.loginStatusMessage = msg;
          this.cdr.detectChanges();
          alert(this.loginStatusMessage);
          this.cdr.detectChanges();
          console.error('Error en login', err);
        }
      });
  }

  editUser(u: User): void {
    this.editMode = true;
    this.editingUserId = u.id ?? null;
    this.newUser = {
      username: u.username,
      email: u.email,
      password: '',
      active: u.active
    };
    this.showForm = true;
  }

  addNew(): void {
    this.editMode = false;
    this.editingUserId = null;
    this.resetNewUser();
    this.showForm = true;
  }

  saveNewUser(): void {
    if (!this.newUser.username.trim()) {
      alert('El username es obligatorio.');
      return;
    }
    if (!this.newUser.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      alert('Ingrese un email válido.');
      return;
    }

    const password = this.newUser.password?.trim() ?? '';
    if (!this.editMode && password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (this.editMode && password.length > 0 && password.length < 8) {
      alert('Si desea actualizar contraseña, debe tener al menos 8 caracteres.');
      return;
    }

    const payload: User = {
      username: this.newUser.username.trim(),
      email: this.newUser.email.trim(),
      active: this.newUser.active
    };

    if (password.length > 0) {
      payload.password = password;
    }

    const call = this.editMode && this.editingUserId !== null
      ? this.api.updateUser(this.editingUserId, payload)
      : this.api.createUser(payload);

    call.subscribe({
      next: () => {
        this.loadUsers();
        this.showForm = false;
        this.resetNewUser();
        this.editMode = false;
        this.editingUserId = null;
      },
      error: err => {
        console.error(this.editMode ? 'Error actualizando usuario' : 'Error creando usuario', err);
        const errorMsg = err.error?.message || 'Error al guardar el usuario. Verifique los datos.';
        alert(errorMsg);
      }
    });
  }

  cancelAdd(): void {
    this.showForm = false;
    this.resetNewUser();
    this.editMode = false;
    this.editingUserId = null;
  }

  private resetNewUser(): void {
    this.newUser = { username: '', email: '', password: '', active: true };
  }
}