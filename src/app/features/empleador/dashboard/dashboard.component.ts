import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import Swal from 'sweetalert2';

import { EncuestaStateService } from '../../../core/services/encuesta-state.service';
import { UsuarioService } from '../../../service/usuario.service';

@Component({
  selector: 'app-dashboard-empleador',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private readonly stateService =
    inject(EncuestaStateService);

  private readonly usuarioService =
    inject(UsuarioService);

  private readonly router =
    inject(Router);

  private readonly http =
    inject(HttpClient);

  empleadorActual = signal<any>(null);

  // =========================
  // REGISTRO EMPRESA
  // =========================

  cargandoRuc = false;
  datosRuc: any = null;

  rucTemporal = '';
  razonSocial = '';
  email = '';

  // =========================
  // BÚSQUEDA DE EGRESADO / FILTRO
  // =========================
  searchTerm: string = '';
  egresadoEncontrado = signal<any>(null);
  cargandoBusqueda = false;
  errorBusqueda = '';
  rolEncuestas = 'empleador';

  buscarEgresado(): void {
    const termino = this.searchTerm.trim();
    if (!/^\d{8}$|^\d{11}$/.test(termino)) {
      this.errorBusqueda = 'Ingrese un DNI de 8 dígitos o un RUC de 11 dígitos.';
      return;
    }

    this.cargandoBusqueda = true;
    this.errorBusqueda = '';
    this.egresadoEncontrado.set(null);

    this.http.get<any>(`/api/egresados/buscar?q=${encodeURIComponent(termino)}`).subscribe({
      next: (data) => {
        const egresado = Array.isArray(data?.data)
          ? data.data[0]
          : data?.data || data;
        if (!egresado) {
          this.errorBusqueda = 'No se encontró información para el DNI/RUC ingresado.';
          this.cargandoBusqueda = false;
          return;
        }

        const perfil = {
          ...egresado,
          dni: egresado.dni || egresado.DNI || (termino.length === 8 ? termino : ''),
          ruc: egresado.ruc || egresado.RUC || (termino.length === 11 ? termino : ''),
          idUsuario: egresado.idUsuario || egresado.IdUsuario,
          name: egresado.name || egresado.Name || egresado.nombres || '',
          paternalSurname: egresado.paternalSurname || egresado.PaternalSurname || '',
          maternalSurname: egresado.maternalSurname || egresado.MaternalSurname || '',
          escuelaProfesional: egresado.escuelaProfesional || egresado['Escuela Profesional'],
          facultad: egresado.facultad || egresado.Facultad,
          fechaEgreso: egresado.fechaEgreso || egresado['Fecha Egreso'] || egresado['Fecha de Egreso']
        };

        this.egresadoEncontrado.set(perfil);
        this.rolEncuestas = 'egresado';
        this.encuestasRespondidas.set([]);
        this.cargarEncuestasRespondidas(perfil.idUsuario);
        this.cargandoBusqueda = false;
      },
      error: (err) => {
        console.error('Error al buscar egresado:', err);
        this.errorBusqueda = 'No se encontró información para el DNI/RUC ingresado.';
        this.cargandoBusqueda = false;
      }
    });
  }

  // =========================
  // ENCUESTAS
  // =========================

  encuestasRespondidas =
    signal<number[]>([]);

  encuestas =
    signal<any[]>([]);

ngOnInit(): void {

  this.empleadorActual.set(
    JSON.parse(
      localStorage.getItem('empleadorActual') || '{}'
    )
  );

  const tieneEmpresaRegistrada =
    !!this.empleadorActual()?.name;

  if (!tieneEmpresaRegistrada) {

    this.rucTemporal =
      this.empleadorActual()?.ruc ||
      this.empleadorActual()?.dni ||
      localStorage.getItem('rucTemporal') ||
      '';

    this.razonSocial =
      this.empleadorActual()?.name || '';

    this.email =
      this.empleadorActual()?.email || '';

    Swal.fire({
      title: 'Verificando empresa',
      text: 'Consultando SUNAT, por favor espere...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => { Swal.showLoading(); }
    });

    this.fetchDatosSunat(this.rucTemporal);

    return;
  }
  this.cargandoRuc = false;
  this.cargarEncuestasRespondidas();
}

  // =========================
  // SUNAT
  // =========================

  fetchDatosSunat(ruc: string): void {
    if (!ruc) {
      this.autoRegistrar();
      return;
    }
    this.cargandoRuc = true;
    const url = `/sunat/Rest/Sunat/DatosPrincipales?numruc=${ruc}`;

    this.http.get(url, { responseType: 'text' }).subscribe({
      next: (xml: string) => {
        this.cargandoRuc = false;
        const datos = this.parseSunatXml(xml);
        if (datos?.nombre) {
          this.datosRuc    = datos;
          this.razonSocial = datos.nombre;
        }
        this.autoRegistrar();
      },
      error: () => {
        this.cargandoRuc = false;
        this.autoRegistrar();
      }
    });
  }

  private parseSunatXml(xml: string): any {
    try {
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const get = (tag: string) =>
        doc.querySelector(tag)?.textContent?.trim() ?? '';

      return {
        ruc:         get('ddp_numruc'),
        nombre:      get('ddp_nombre').trim(),
        estado:      get('desc_estado').trim(),
        esActivo:    get('esActivo')  === 'true',
        esHabido:    get('esHabido')  === 'true',
        tipoEmpresa: get('desc_tpoemp').trim(),
        via:         `${get('desc_tipvia')} ${get('ddp_nomvia')}`.trim(),
        sector:      get('ddp_nomzon').trim(),
        distrito:    get('desc_dist').trim(),
        provincia:   get('desc_prov').trim(),
        depto:       get('desc_dep').trim(),
      };
    } catch {
      return null;
    }
  }

  // =========================
  // CARGAR RESPONDIDAS
  // =========================

  cargarEncuestasRespondidas(idUsuario = this.empleadorActual()?.idUsuario): void {

    if (!idUsuario) {
      this.cargarEncuestas();
      return;
    }

    this.stateService
      .obtenerEncuestasRespondidas(
        idUsuario
      )
      .subscribe({

        next: (ids) => {

          this.encuestasRespondidas
            .set(ids);

          this.cargarEncuestas();
        },

        error: () => {

          this.cargarEncuestas();
        }
      });
  }

  // =========================
  // REGISTRO AUTOMÁTICO
  // =========================

  autoRegistrar(): void {

    const empresa = {
      idUsuario: this.empleadorActual()?.idUsuario,
      dni:       this.rucTemporal,
      ruc:       this.rucTemporal,
      name:      this.razonSocial || this.rucTemporal,
      email:     this.email,
      tipo:      'empresa'
    };

    this.usuarioService
      .guardar(empresa)
      .subscribe({

        next: (usuario: any) => {

          localStorage.setItem(
            'empleadorActual',
            JSON.stringify(usuario)
          );

          localStorage.removeItem('rucTemporal');

          Swal.close();
          window.location.reload();
        },

        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar',
            text: 'No se pudo obtener los datos de la empresa. Intente cerrar sesión y volver a ingresar.'
          });
        }
      });
  }

  // =========================
  // CARGAR ENCUESTAS
  // =========================

  cargarEncuestas(): void {

    const rolUsuario =
      this.rolEncuestas || localStorage.getItem('rolUsuario');

    this.stateService
      .obtenerEncuestas()
      .subscribe({

        next: (data) => {

          const respondidas =
            this.encuestasRespondidas().map(Number);

          const filtradas = data
            .filter((e: any) =>
              e.cargo?.toLowerCase() === rolUsuario?.toLowerCase()
            )
            .map((e: any) => ({
              ...e,
              respondida:
                respondidas.includes(
                  Number(e.idEncuesta)
                )
            }));

          this.encuestas.set(filtradas);

          const total = filtradas.length;
          const totalRespondidas = filtradas.filter((e: any) => e.respondida).length;
          this.porcentajeProgreso.set(
            total > 0 ? Math.round((totalRespondidas / total) * 100) : 0
          );
        },

        error: () => {

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar las encuestas'
          });
        }
      });
  }

porcentajeProgreso = signal(0);
  iniciarEncuesta(
    encuesta: any
  ): void {

    if (encuesta.respondida) {

      Swal.fire({
        icon: 'info',
        title: 'Ya completada',
        text: 'Esta encuesta ya fue respondida'
      });

      return;
    }

    this.router.navigate(
      ['/empleador/encuesta', encuesta.idEncuesta],
      { state: { nombreEncuesta: encuesta.nombre } }
    );
  }

  logout(): void {

    this.stateService.logout();

    localStorage.removeItem(
      'empleadorActual'
    );

    localStorage.removeItem(
      'rolUsuario'
    );

    localStorage.removeItem(
      'rucTemporal'
    );

    this.router.navigate([
      '/auth/selector-rol'
    ]);
  }
}
