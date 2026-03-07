import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { User, Country, City } from '../../models/user';
// router is no longer required
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {

  users: User[] = [];
  showForm: boolean = false;
  editMode: boolean = false;           // indicates whether we're editing
  newUser: User = { firstName: '', lastName: '', age: 0, email: '', cui: '' };

  countries: Country[] = [];
  cities: City[] = [];

  constructor(
    private api: ApiService, 
    private cd: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.loadUsers(); // carga automática al iniciar
  }

  private loadCountries(): void {
    this.api.getCountries().subscribe({
      next: data => this.countries = data,
      error: err => console.error('Error cargando países', err)
    });
  }

  private loadCities(countryId: number): void {
    this.api.getCities(countryId).subscribe({
      next: data => this.cities = data,
      error: err => console.error('Error cargando ciudades', err)
    });
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: data => {
        this.users = data; // asigna datos
        console.log('Usuarios cargados:', this.users); // depuración: verificar si cui viene del backend
        this.cd.detectChanges(); // fuerza actualización de la tabla
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }


  deleteUser(id: number): void {
    this.api.deleteUser(id).subscribe(() => this.loadUsers());
  }

  editUser(u: User): void {
    // populate form for editing
    this.editMode = true;
    this.newUser = { ...u, cui: u.cui || '' }; // asegurar que cui sea string vacío si no existe
    this.showForm = true;
    this.loadCountries();
    if (u.country && u.country.id) {
      this.loadCities(u.country.id);
    }
  }


  addNew(): void {
    this.editMode = false;
    this.resetNewUser();
    this.showForm = true;
    this.loadCountries();
    this.cities = [];
  }

  saveNewUser(): void {
    // Validaciones locales antes de enviar
    if (!this.newUser.firstName.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (!this.newUser.lastName.trim()) {
      alert('El apellido es obligatorio.');
      return;
    }
    if (!this.newUser.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      alert('Ingrese un email válido.');
      return;
    }
    if (this.newUser.age <= 0) {
      alert('La edad debe ser mayor a 0.');
      return;
    }
    if (!/^\d{13}$/.test(this.newUser.cui)) {
      alert('El CUI debe tener exactamente 13 dígitos.');
      return;
    }
    if (!this.newUser.country || !this.newUser.country.id) {
      alert('Seleccione un país.');
      return;
    }
    if (!this.newUser.city || !this.newUser.city.id) {
      alert('Seleccione una ciudad.');
      return;
    }

    const call = this.editMode
      ? this.api.updateUser(this.newUser)
      : this.api.createUser(this.newUser);

    call.subscribe({
      next: () => {
        this.loadUsers();
        this.showForm = false;
        this.resetNewUser();
        this.editMode = false;
      },
      error: err => {
        console.error(this.editMode ? 'Error actualizando usuario' : 'Error creando usuario', err);
        // Mostrar mensaje de error del backend si está disponible
        const errorMsg = err.error?.message || 'Error al guardar el usuario. Verifique los datos.';
        alert(errorMsg);
      }
    });
  }



  cancelAdd(): void {
    this.showForm = false;
    this.resetNewUser();
    this.editMode = false;
  }

  countryChanged(): void {
    if (this.newUser.country && this.newUser.country.id) {
      this.loadCities(this.newUser.country.id);
      // clear previously selected city
      this.newUser.city = undefined;
    } else {
      this.cities = [];
      this.newUser.city = undefined;
    }
  }

  private resetNewUser(): void {
    this.newUser = { firstName: '', lastName: '', age: 0, email: '', cui: '' };
    this.cities = [];
  }
}