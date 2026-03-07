import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../core/api.service';
import { User } from '../../models/user';
import { Router } from '@angular/router';
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
  newUser: User = { firstName: '', lastName: '', age: 0, email: '' };

  constructor(
    private api: ApiService, 
    private router: Router, 
    private cd: ChangeDetectorRef
  ){}

  ngOnInit(): void {
    this.loadUsers(); // carga automática al iniciar
  }

  loadUsers(): void {
    this.api.getUsers().subscribe({
      next: data => {
        this.users = data; // asigna datos
        this.cd.detectChanges(); // fuerza actualización de la tabla
      },
      error: err => console.error('Error cargando usuarios', err)
    });
  }

  deleteUser(id: number): void {
    this.api.deleteUser(id).subscribe(() => this.loadUsers());
  }

  editUser(u: User): void {
    this.router.navigate(['/users/edit', u.id]); // redirige al formulario de edición
  }

  addNew(): void {
    this.showForm = true;
  }

  saveNewUser(): void {
    this.api.createUser(this.newUser).subscribe({
      next: () => {
        this.loadUsers();
        this.showForm = false;
        this.resetNewUser();
      },
      error: err => console.error('Error creando usuario', err)
    });
  }

  cancelAdd(): void {
    this.showForm = false;
    this.resetNewUser();
  }

  private resetNewUser(): void {
    this.newUser = { firstName: '', lastName: '', age: 0, email: '' };
  }
}