import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { Menu } from './layout/menu/menu';

@Component({
  selector: 'app-root',
   standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('aeropuerto');
}
