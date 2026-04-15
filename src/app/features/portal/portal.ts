import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-portal',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './portal.html',
  styleUrl: './portal.css'
})
export class Portal {}
