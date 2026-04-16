import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../core/api.service";
import { NotificationService } from "../../core/notification.service";
import { User } from "../../models/user";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-users",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: "./users.html",
  styleUrls: ["./users.css"]
})
export class Users implements OnInit {
  users: User[] = [];
  showForm = false;
  editMode = false;
  editingUserId: number | null = null;
  newUser: User = { username: "", email: "", password: "", active: true };

  constructor(
    private api: ApiService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err: any) => {
        let msg = "No se pudieron cargar los usuarios.";
        let backendMessage: string | undefined;
        let httpStatus: number | undefined;
        const endpoint = "GET /api/users";

        if (err?.status === 0) {
          msg = "No se puede conectar con el servidor.";
          backendMessage = "La URL del backend puede ser incorrecta.";
        } else if (err?.status === 401) {
          msg = "No autorizado para consultar usuarios.";
          backendMessage = "Verifique sus credenciales de acceso.";
          httpStatus = 401;
        } else if (err?.status === 403) {
          msg = "Acceso denegado.";
          backendMessage = "No tiene permisos para ver usuarios.";
          httpStatus = 403;
        } else if (err?.error?.message) {
          msg = "Error del servidor.";
          backendMessage = err.error.message;
          httpStatus = err?.status;
        } else if (err?.status >= 500) {
          msg = "Error en el servidor backend.";
          backendMessage = "El servidor está experimentando problemas.";
          httpStatus = err?.status;
        }

        this.notification.error(msg, 0, {
          httpStatus,
          backendMessage,
          endpoint,
          timestamp: new Date().toLocaleString("es-ES"),
          clientError: err?.message
        });
      }
    });
  }

  deleteUser(id: number): void {
    if (!confirm("¿Está seguro que desea eliminar este usuario?")) {
      return;
    }
    this.api.deleteUser(id).subscribe({
      next: () => {
        this.notification.success("Usuario eliminado correctamente.");
        this.loadUsers();
      },
      error: (err: any) => {
        let msg = "No se pudo eliminar el usuario.";
        let backendMessage: string | undefined;
        let httpStatus: number | undefined;
        const endpoint = `DELETE /api/users/${id}`;

        if (err?.status === 0) {
          msg = "No se puede conectar con el servidor.";
          backendMessage = "Verifique la URL del backend.";
        } else if (err?.status === 404) {
          msg = "Usuario no encontrado.";
          backendMessage = "Es posible que el usuario ya haya sido eliminado.";
          httpStatus = 404;
        } else if (err?.status === 403) {
          msg = "No tiene permiso para eliminar este usuario.";
          backendMessage = err?.error?.message || "Acceso denegado.";
          httpStatus = 403;
        } else if (err?.error?.message) {
          msg = "Error al eliminar.";
          backendMessage = err.error.message;
          httpStatus = err?.status;
        }

        this.notification.error(msg, 0, {
          httpStatus,
          backendMessage,
          endpoint,
          timestamp: new Date().toLocaleString("es-ES"),
          clientError: err?.message
        });
      }
    });
  }

  editUser(u: User): void {
    this.editMode = true;
    this.editingUserId = u.id ?? null;
    this.newUser = {
      username: u.username,
      email: u.email,
      password: "",
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
      this.notification.error("El username es obligatorio.");
      return;
    }
    if (!this.newUser.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      this.notification.error("Ingrese un email válido.");
      return;
    }

    const password = this.newUser.password?.trim() ?? "";
    if (!this.editMode && password.length < 8) {
      this.notification.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (this.editMode && password.length > 0 && password.length < 8) {
      this.notification.error("Si desea actualizar contraseña, debe tener al menos 8 caracteres.");
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
        const action = this.editMode ? "actualizado" : "creado";
        this.notification.success(`Usuario ${action} correctamente.`);
        this.loadUsers();
        this.showForm = false;
        this.resetNewUser();
        this.editMode = false;
        this.editingUserId = null;
      },
      error: (err: any) => {
        let msg = this.editMode ? "No se pudo actualizar el usuario." : "No se pudo crear el usuario.";
        let backendMessage: string | undefined;
        let httpStatus: number | undefined;
        const endpoint = this.editMode ? `PUT /api/users/${this.editingUserId}` : "POST /api/users";

        if (err?.status === 0) {
          msg = "No se puede conectar con el servidor.";
          backendMessage = "Verifique la conexión y la URL del backend.";
        } else if (err?.status === 400) {
          msg = "Datos inválidos.";
          backendMessage = err?.error?.message || "Verifique los campos del formulario.";
          httpStatus = 400;
        } else if (err?.status === 409) {
          msg = "El usuario ya existe.";
          backendMessage = err?.error?.message || "El username o email ya está registrado.";
          httpStatus = 409;
        } else if (err?.status === 403) {
          msg = "No tiene permiso para esta acción.";
          backendMessage = err?.error?.message || "Acceso denegado.";
          httpStatus = 403;
        } else if (err?.status === 401) {
          msg = "No autorizado.";
          backendMessage = "Su sesión ha expirado. Vuelva a iniciar sesión.";
          httpStatus = 401;
        } else if (err?.status >= 500) {
          msg = "Error en el servidor backend.";
          backendMessage = err?.error?.message || "El servidor está experimentando problemas.";
          httpStatus = err?.status;
        } else if (err?.error?.message) {
          msg = "Error al guardar.";
          backendMessage = err.error.message;
          httpStatus = err?.status;
        }

        this.notification.error(msg, 0, {
          httpStatus,
          backendMessage,
          endpoint,
          timestamp: new Date().toLocaleString("es-ES"),
          clientError: err?.message
        });
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
    this.newUser = { username: "", email: "", password: "", active: true };
  }
}
