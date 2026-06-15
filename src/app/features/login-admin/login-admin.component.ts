import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-admin.component.html',
  styleUrl: './login-admin.component.css'
})
export class LoginAdminComponent {

  constructor(private router: Router) {}

  loginData: any = {};
  hide = true;

  formSubmit() {

    if (
      this.loginData.username === 'admin' &&
      this.loginData.password === '123456'
    ) {

      localStorage.setItem('rolUsuario', 'admin');
      localStorage.setItem('adminAuth', 'true');

      this.router.navigate(['/reportes']);

      return;
    }

    Swal.fire({
      icon: 'error',
      title: 'Credenciales incorrectas'
    });
  }
}
