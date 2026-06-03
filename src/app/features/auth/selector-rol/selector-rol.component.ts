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
    const rolGuardado = localStorage.getItem('rolPreferencia');
    if (rolGuardado === 'egresado' || rolGuardado === 'empleador') {
      this.router.navigate(['/auth/login-dni', rolGuardado]);
    }
  }

  seleccionarRol(rol: 'egresado' | 'empleador'): void {
    localStorage.setItem('rolPreferencia', rol);
    this.router.navigate(['/auth/login-dni', rol]);
  }
}
