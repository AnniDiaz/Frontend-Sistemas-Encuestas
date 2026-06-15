import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-selector-rol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-rol.component.html',
  styleUrl: './selector-rol.component.css'
})
export class SelectorRolComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    // Limpiar rolPreferencia que pueda haber quedado de intentos anteriores
    localStorage.removeItem('rolPreferencia');
  }

  seleccionarRol(rol: 'egresado' | 'empleador'): void {
    // Solo navega sin guardar en localStorage
    // Se guardará después del login exitoso
    this.router.navigate(['/auth/login', rol]);
  }
}
