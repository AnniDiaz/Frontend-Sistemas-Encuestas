import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { EncuestaStateService } from '../../../core/services/encuesta-state.service';
import { UsuarioService } from '../../../service/usuario.service';
import { EgresadoService } from '../../../service/egresado.service';

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
  private readonly egresadoService = inject(EgresadoService);
  private readonly usuarioService = inject(UsuarioService);

  rol: 'egresado' | 'empleador' = 'egresado';

  dniValue: string = '';
  errorMsg: string | null = null;
  shakeError: boolean = false;

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const rolParam = params.get('rol');

      if (
        rolParam === 'egresado' ||
        rolParam === 'empleador'
      ) {
        this.rol = rolParam;
      }

    });

  }

  // =========================
  // LOGIN
  // =========================
  onSubmit(): void {

    // =========================
    // EMPLEADOR
    // =========================
    if (this.rol === 'empleador') {

      if (this.dniValue.trim().length !== 11) {

        this.triggerShake('RUC inválido');
        return;
      }

      this.usuarioService
        .getByDni(this.dniValue)
        .subscribe({

          next: (empresa: any) => {

            localStorage.setItem(
              'empleadorActual',
              JSON.stringify(empresa)
            );

            localStorage.setItem(
              'rolUsuario',
              'empleador'
            );

            localStorage.removeItem(
              'rucTemporal'
            );

            this.router.navigate([
              '/empleador'
            ]);
          },

          error: () => {

            const nuevoEmpleador = {

              dni: this.dniValue,

              name: '',

              paternalSurname: '',

              maternalSurname: '',

              email: '',

              phoneNumber: ''
            };

            this.usuarioService
              .guardar(nuevoEmpleador)
              .subscribe({

                next: (empresaGuardada: any) => {

                  localStorage.setItem(
                    'empleadorActual',
                    JSON.stringify(empresaGuardada)
                  );

                  localStorage.setItem(
                    'rolUsuario',
                    'empleador'
                  );

                  localStorage.setItem(
                    'rucTemporal',
                    this.dniValue
                  );

                  this.router.navigate([
                    '/empleador'
                  ]);
                },

                error: () => {

                  this.triggerShake(
                    'Error al registrar empresa'
                  );
                }

              });
          }

        });

      return;
    }

    // =========================
    // EGRESADO
    // =========================
    if (this.dniValue.trim().length !== 8) {

      this.triggerShake('DNI inválido');
      return;
    }

    this.egresadoService.buscarPorDni(this.dniValue)
      .subscribe({

        next: (res: any) => {

          const eg = res?.data?.[0];

          if (!eg) {

            this.triggerShake(
              'No se encontró egresado'
            );

            return;
          }

          const usuario = {

            dni: this.dniValue,

            name: eg.Name,

            paternalSurname:
              eg.PaternalSurname,

            maternalSurname:
              eg.MaternalSurname,

            email: eg.Email,

            phoneNumber:
              eg.PhoneNumber,

            escuelaProfesional:
              eg['Escuela Profesional'],

            facultad:
              eg['Facultad'],

            fechaEgreso:
              eg['Fecha de Egreso'],

            semestreEgreso:
              eg['Semestre de egreso']
          };

          this.usuarioService
            .getByDni(this.dniValue)
            .subscribe({

              next: (
                usuarioExistente: any
              ) => {

                this.finalizarLogin(
                  usuarioExistente
                );
              },

              error: () => {

                this.usuarioService
                  .guardar(usuario)
                  .subscribe({

                    next: (
                      usuarioGuardado: any
                    ) => {

                      this.finalizarLogin(
                        usuarioGuardado
                      );
                    },

                    error: () => {

                      this.triggerShake(
                        'Error al crear usuario'
                      );
                    }

                  });
              }

            });

        },

        error: () => {

          this.triggerShake(
            'Error consultando egresado'
          );
        }

      });

  }

  // =========================
  // LOGIN EGRESADO
  // =========================
  finalizarLogin(usuario: any): void {

    this.stateService
      .setEgresadoActual(usuario);

    localStorage.setItem(
      'rolUsuario',
      this.rol
    );

    localStorage.setItem(
      'dni',
      usuario.dni
    );

    localStorage.setItem(
      'egresadoActual',
      JSON.stringify(usuario)
    );

    this.router.navigate([
      '/egresado'
    ]);

  }

  // =========================
  // MENSAJES ERROR
  // =========================
  triggerShake(msg: string): void {

    this.errorMsg = msg;
    this.shakeError = true;

    setTimeout(() => {

      this.shakeError = false;

    }, 500);

  }

  volver(): void {

    this.router.navigate([
      '/auth/selector-rol'
    ]);

  }

}
