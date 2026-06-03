import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EncuestaStateService } from '../../../core/services/encuesta-state.service';

@Component({
  selector: 'app-login-dni',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-dni.component.html',
  styleUrl: './login-dni.component.css'
})
export class LoginDniComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stateService = inject(EncuestaStateService);

  rol: 'egresado' | 'empleador' = 'egresado';
  dniValue: string = '';
  errorMsg: string | null = null;
  shakeError: boolean = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const rolParam = params.get('rol');
      if (rolParam === 'egresado' || rolParam === 'empleador') {
        this.rol = rolParam;
      } else {
        this.router.navigate(['/auth/selector-rol']);
      }
    });
  }

  onSubmit(): void {
    if (!this.dniValue || this.dniValue.trim().length !== 8) {
      this.triggerShake('Por favor ingresa tu DNI exacto de 8 dígitos.');
      return;
    }

    const success = this.stateService.login(this.dniValue.trim(), this.rol);
    if (success) {
      this.errorMsg = null;
      if (this.rol === 'egresado') {
        this.router.navigate(['/egresado']);
      } else {
        this.router.navigate(['/empleador']);
      }
    } else {
      this.triggerShake('El número de DNI ingresado no se encuentra registrado en el sistema.');
    }
  }

  triggerShake(msg: string): void {
    this.errorMsg = msg;
    this.shakeError = true;
    setTimeout(() => {
      this.shakeError = false;
    }, 500);
  }

  volver(): void {
    localStorage.removeItem('rolPreferencia');
    this.router.navigate(['/auth/selector-rol']);
  }
}