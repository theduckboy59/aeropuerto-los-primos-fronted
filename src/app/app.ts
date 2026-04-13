import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/api.service';
//import { Menu } from './layout/menu/menu';

@Component({
  selector: 'app-root',
   standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('aeropuerto');

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCountries().subscribe({
      error: err => console.error('Error precargando paises', err)
    });
  }
}
