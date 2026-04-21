import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin, timeout } from 'rxjs';
import { ApiService, CatalogItem } from '../../core/api.service';
import { NotificationService } from '../../core/notification.service';
import { PassengerRegistrationRequest } from '../../models/passenger-registration';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  @ViewChild('registerNgForm') registerNgForm?: NgForm;

  documentTypes: CatalogItem[] = [];
  nationalities: CatalogItem[] = [];
  isLoadingCatalogs = true;
  catalogLoadError = '';

  registerForm: PassengerRegistrationRequest = {
    username: '',
    email: '',
    password: '',
    tipoDocumentoId: 0,
    numeroDocumento: '',
    nombreCompleto: '',
    fechaNacimiento: '',
    nacionalidadId: 0,
    codigoArea: '',
    telefono: '',
    telefonoEmergencia: '',
    direccion: ''
  };

  showPassword = false;
  isSubmitting = false;
  inlineMessage = '';
  inlineMessageType: 'success' | 'error' | 'warning' | '' = '';

  constructor(
    private api: ApiService,
    private notification: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCatalogs();
  }

  hasCatalogData(): boolean {
    return this.documentTypes.length > 0 && this.nationalities.length > 0;
  }

  private loadCatalogs(): void {
    this.isLoadingCatalogs = true;
    this.catalogLoadError = '';

    forkJoin({
      documentTypes: this.api.getDocumentTypeCatalog(),
      nationalities: this.api.getNationalityCatalog(),
      statuses: this.api.getStatusCatalog()
    })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isLoadingCatalogs = false;
        })
      )
      .subscribe({
        next: ({ documentTypes, nationalities, statuses }) => {
          this.documentTypes = documentTypes;
          this.nationalities = nationalities;

          const hasActivo = statuses.some((item) => item.code?.toUpperCase() === 'ACTIVO');
          if (!hasActivo) {
            this.catalogLoadError = 'El backend respondio catalogos, pero no existe un estado ACTIVO en status_catalog.';
            this.notification.error(this.catalogLoadError, 0, {
              endpoint: '/api/catalogs/status',
              backendMessage: 'Debe existir code = ACTIVO para que el registro use el estado por defecto.',
              timestamp: new Date().toLocaleString('es-ES')
            });
            return;
          }

          this.registerForm.tipoDocumentoId = this.documentTypes[0]?.id ?? 0;
          this.registerForm.nacionalidadId = this.nationalities[0]?.id ?? 0;
          this.applyNationalityAreaCode();
        },
        error: (err: any) => {
          const details = {
            httpStatus: err?.status,
            backendMessage: err?.error?.mensaje || err?.error?.message,
            endpoint: '/api/catalogs/*',
            timestamp: new Date().toLocaleString('es-ES'),
            clientError: err?.message || 'Ver consola para mas detalles'
          };

          if (err?.status === 404) {
            this.catalogLoadError = 'El frontend ya intenta leer catalogos desde backend, pero las rutas /api/catalogs/* todavia no existen. Debes publicarlas en Spring para traer los datos desde DB.';
          } else if (err?.status === 0) {
            this.catalogLoadError = 'No se pudo conectar con el backend para cargar catalogos.';
          } else if (err?.name === 'TimeoutError') {
            this.catalogLoadError = 'Tiempo de espera agotado al cargar catalogos.';
          } else {
            this.catalogLoadError = 'No fue posible cargar catalogos desde backend.';
          }

          this.notification.error(this.catalogLoadError, 0, details);
        }
      });
  }

  register(): void {
    this.inlineMessage = '';
    this.inlineMessageType = '';

    const validationError = this.validateForm();
    if (validationError) {
      this.setInlineMessage(`Error: ${validationError}`, 'error');
      this.notification.error(validationError);
      return;
    }

    const payload: PassengerRegistrationRequest = {
      username: this.registerForm.username.trim(),
      email: this.registerForm.email.trim().toLowerCase(),
      password: this.registerForm.password.trim(),
      tipoDocumentoId: Number(this.registerForm.tipoDocumentoId),
      numeroDocumento: this.registerForm.numeroDocumento.trim(),
      nombreCompleto: this.registerForm.nombreCompleto.trim(),
      fechaNacimiento: this.registerForm.fechaNacimiento,
      nacionalidadId: Number(this.registerForm.nacionalidadId),
      codigoArea: this.registerForm.codigoArea?.trim() || undefined,
      telefono: this.registerForm.telefono.trim(),
      telefonoEmergencia: this.registerForm.telefonoEmergencia?.trim() || undefined,
      direccion: this.registerForm.direccion.trim()
    };

    this.isSubmitting = true;

    this.api.registerPassenger(payload)
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          const successMessage = response?.message || 'Usuario registrado con exito.';
          this.setInlineMessage(successMessage, 'success');
          this.notification.success(successMessage);
          this.registerNgForm?.resetForm({
            username: '',
            email: '',
            password: '',
            tipoDocumentoId: this.documentTypes[0]?.id ?? 0,
            numeroDocumento: '',
            nombreCompleto: '',
            fechaNacimiento: '',
            nacionalidadId: this.nationalities[0]?.id ?? 0,
            codigoArea: this.getAreaCodeForNationality(this.nationalities[0]?.id),
            telefono: '',
            telefonoEmergencia: '',
            direccion: ''
          });
          this.showPassword = false;
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: (err: any) => {
          const resolved = this.resolveRegisterError(err);
          this.setInlineMessage(resolved.message, 'error');
          this.notification.error(resolved.message, 0, resolved.details);
        }
      });
  }

  private validateForm(): string | null {
    if (!this.hasCatalogData()) {
      return this.catalogLoadError || 'Faltan catalogos cargados desde backend para completar el registro.';
    }

    if (!this.registerForm.username.trim()) {
      return 'Ingresa un nombre de usuario.';
    }

    if (!this.registerForm.nombreCompleto.trim()) {
      return 'Ingresa el nombre completo del pasajero.';
    }

    if (!this.registerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerForm.email)) {
      return 'Ingresa un correo electronico valido.';
    }

    if (this.registerForm.password.trim().length < 8) {
      return 'La contrasena debe tener al menos 8 caracteres.';
    }

    if (!this.registerForm.tipoDocumentoId) {
      return 'Selecciona un tipo de documento.';
    }

    if (!this.registerForm.numeroDocumento.trim()) {
      return 'Ingresa el numero de documento.';
    }

    if (!this.registerForm.fechaNacimiento) {
      return 'Selecciona la fecha de nacimiento.';
    }

    if (!this.registerForm.nacionalidadId) {
      return 'Selecciona una nacionalidad.';
    }

    if (!this.registerForm.telefono.trim()) {
      return 'Ingresa el telefono principal.';
    }

    if (!this.registerForm.direccion.trim()) {
      return 'Ingresa la direccion.';
    }

    return null;
  }

  private setInlineMessage(message: string, type: 'success' | 'error' | 'warning'): void {
    this.inlineMessage = message;
    this.inlineMessageType = type;
  }

  onNationalityChange(): void {
    this.applyNationalityAreaCode();
  }

  private applyNationalityAreaCode(): void {
    this.registerForm.codigoArea = this.getAreaCodeForNationality(this.registerForm.nacionalidadId);
  }

  private getAreaCodeForNationality(nationalityId?: number): string {
    return this.nationalities.find((item) => item.id === nationalityId)?.areaCode || '';
  }

  private resolveRegisterError(err: any): { message: string; details: any } {
    const backendMessage = err?.error?.mensaje || err?.error?.message || err?.error?.error;
    const validationErrors = err?.error?.errors as Record<string, string> | undefined;
    const validationMessage = validationErrors
      ? Object.entries(validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(' | ')
      : undefined;
    const details = {
      httpStatus: err?.status,
      backendMessage: validationMessage || backendMessage,
      endpoint: '/api/users/register',
      timestamp: new Date().toLocaleString('es-ES'),
      clientError: err?.message || 'Ver consola para mas detalles'
    };

    if (err?.name === 'TimeoutError') {
      return {
        message: 'Error: tiempo de espera agotado. El backend no respondio al registro.',
        details
      };
    }

    if (err?.status === 0) {
      return {
        message: 'Error: no se puede conectar con el backend. Verifica la URL configurada o que el servidor este arriba.',
        details: {
          ...details,
          backendMessage: 'La API puede no estar disponible, la URL puede ser incorrecta o el navegador bloqueo la conexion.'
        }
      };
    }

    if (err?.status === 400) {
      return {
        message: `Error: ${validationMessage || backendMessage || 'el backend rechazo el registro. Revisa campos, formatos o IDs de catalogo.'}`,
        details
      };
    }

    if (err?.status === 409) {
      return {
        message: `Error: ${backendMessage || 'el usuario o el correo ya existen.'}`,
        details
      };
    }

    if (err?.status >= 500) {
      return {
        message: 'Error: el servidor fallo al procesar el registro. Puede haber un problema con los catalogos, validaciones internas o la transaccion en base de datos.',
        details
      };
    }

    return {
      message: `Error: ${backendMessage || 'no fue posible completar el registro.'}`,
      details
    };
  }

  trackByCatalogId(_: number, option: CatalogItem): number {
    return option.id;
  }
}
