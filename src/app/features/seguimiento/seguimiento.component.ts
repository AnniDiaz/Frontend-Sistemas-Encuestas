import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EscuelaService } from '../../service/escuela.service';
import { SeguimientoService } from '../../service/seguimiento.service';
import { EncabezadoSeguimientoComponent } from './encabezado-seguimiento/encabezado-seguimiento.component';
import { PaginaSeguimiento, PersonaSeguimiento, PersonaResumenSeguimiento, ResumenSeguimiento } from '../../shared/models/seguimiento.model';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, EncabezadoSeguimientoComponent],
  templateUrl: './seguimiento.component.html',
  styleUrl: './seguimiento.component.css'
})
export class SeguimientoComponent implements OnInit, OnDestroy {
    private consulta?: Subscription;
    private consultasDetalle = new Subscription();
    private consultasCatalogo = new Subscription();
    seguimiento: PersonaResumenSeguimiento[] = [];
    detallesSeguimiento: Record<number, PersonaSeguimiento> = {};
    detallesCargando = new Set<number>();
    detallesError = new Set<number>();
    personaExpandida: number | null = null;
    resumenSeguimiento: ResumenSeguimiento = {
      registrados: 0, egresados: 0, empleadores: 0, sinClasificar: 0,
      completos: 0, pendientes: 0, sinEnvios: 0, noAplica: 0,
      encuestasAplicables: 0, encuestasRespondidas: 0,
      encuestasPendientes: 0, porcentaje: null
    };
    cargandoSeguimiento = false;
    errorSeguimiento = '';
    errorEscuelas = '';
    errorEncuestas = '';
    cargandoEscuelas = false;
    cargandoEncuestas = false;
    seguimientoPublico = '';
    seguimientoBusqueda = '';
    seguimientoEncuestaId: any = 'ALL';
    encuestasSeguimiento: any[] = [];
    seguimientoPagina = 0;
    seguimientoTamano = 20;
    seguimientoTotalPaginas = 0;
    seguimientoTotalElementos = 0;


  carrera = '';
  escuelas: any[] = [];
  constructor(private escuelaService: EscuelaService, private seguimientoService: SeguimientoService) {}
  ngOnInit(): void {
    this.cargarEscuelas();
    this.cargarEncuestasSeguimiento();
    this.cargarSeguimiento();
  }
    cargarEscuelas(): void {
      if (this.cargandoEscuelas) return;
      this.cargandoEscuelas = true;
      this.errorEscuelas = '';
      this.consultasCatalogo.add(this.escuelaService.obtenerEscuelas().subscribe({
        next: (response: any) => {
          this.escuelas = response.data || [];
          this.cargandoEscuelas = false;
        },
        error: (err: HttpErrorResponse) => {
          this.errorEscuelas = this.mensajeError(err, 'las escuelas');
          this.cargandoEscuelas = false;
        }
      }));
    }

    cargarEncuestasSeguimiento(): void {
      if (this.cargandoEncuestas) return;
      this.cargandoEncuestas = true;
      this.errorEncuestas = '';
      this.consultasCatalogo.add(this.seguimientoService.obtenerEncuestas().subscribe({
        next: data => {
          this.encuestasSeguimiento = data || [];
          this.cargandoEncuestas = false;
        },
        error: (err: HttpErrorResponse) => {
          this.errorEncuestas = this.mensajeError(err, 'las encuestas');
          this.cargandoEncuestas = false;
        }
      }));
    }

    reintentarCatalogos(): void {
      if (this.errorEscuelas) this.cargarEscuelas();
      if (this.errorEncuestas) this.cargarEncuestasSeguimiento();
    }

    private mensajeError(error: HttpErrorResponse, recurso: string): string {
      if (error.status === 0) return `No se pudo conectar para cargar ${recurso}. Revisa la conexión e intenta nuevamente.`;
      if (error.status === 401) return `Tu sesión no está autorizada para consultar ${recurso}. Vuelve a iniciar sesión.`;
      if (error.status === 403) return `No tienes permisos para consultar ${recurso}.`;
      if (error.status >= 500) return `El servidor tuvo un error al cargar ${recurso}. Intenta nuevamente.`;
      return `No se pudo cargar ${recurso} (error ${error.status}). Revisa los filtros e intenta nuevamente.`;
    }

    cargarSeguimiento(page = this.seguimientoPagina): void {
      this.consulta?.unsubscribe();
      this.personaExpandida = null;
      this.cargandoSeguimiento = true;
      this.errorSeguimiento = '';
      const idEncuesta = this.seguimientoEncuestaId !== 'ALL'
        ? Number(this.seguimientoEncuestaId) : undefined;
      const admiteEscuela = this.seguimientoPublico !== 'EMPLEADOR' && !this.esEncuestaSeguimientoEmpleador();

      this.consulta = this.seguimientoService.consultar({
        publico: this.seguimientoPublico || undefined,
        idEncuesta,
        escuelaProfesional: admiteEscuela ? (this.carrera || undefined) : undefined,
        busqueda: this.seguimientoBusqueda || undefined,
        page,
        size: this.seguimientoTamano
      }).subscribe({
        next: (data: PaginaSeguimiento) => {
          this.seguimiento = data.contenido || [];
          this.resumenSeguimiento = data.resumen;
          this.seguimientoPagina = data.page;
          this.seguimientoTotalPaginas = data.totalPaginas;
          this.seguimientoTotalElementos = data.totalElementos;
          this.cargandoSeguimiento = false;
        },
        error: (err: any) => {
          console.error('Error al cargar seguimiento', err);
          this.errorSeguimiento = this.mensajeError(err, 'el seguimiento');
          this.cargandoSeguimiento = false;
        }
      });
    }

    aplicarFiltrosSeguimiento(): void {
      this.reintentarCatalogos();
      this.limpiarDetallesSeguimiento();
      this.cargarSeguimiento(0);
    }

    onPublicoSeguimientoChange(): void {
      if (this.seguimientoPublico === 'EMPLEADOR') this.carrera = '';
      this.aplicarFiltrosSeguimiento();
    }

    onEncuestaSeguimientoChange(): void {
      if (this.esEncuestaSeguimientoEmpleador()) this.carrera = '';
      this.aplicarFiltrosSeguimiento();
    }

    esEncuestaSeguimientoEmpleador(): boolean {
      return this.encuestasSeguimiento.some(e =>
        String(e.idEncuesta) === String(this.seguimientoEncuestaId)
        && e.cargo?.trim().toLowerCase() === 'empleador'
      );
    }

    cambiarPaginaSeguimiento(page: number): void {
      if (page >= 0 && page < this.seguimientoTotalPaginas && page !== this.seguimientoPagina) {
        this.cargarSeguimiento(page);
      }
    }

    claseAvance(porcentaje: number | null): string {
      if (porcentaje == null) return 'avance--sin-datos';
      if (porcentaje >= 100) return 'avance--completo';
      if (porcentaje >= 50) return 'avance--medio';
      if (porcentaje > 0) return 'avance--bajo';
      return 'avance--sin-avance';
    }

    alternarDetalle(persona: PersonaResumenSeguimiento): void {
      if (this.personaExpandida === persona.idUsuario) {
        this.personaExpandida = null;
        return;
      }

      this.personaExpandida = persona.idUsuario;
      if (this.detallesSeguimiento[persona.idUsuario] || this.detallesCargando.has(persona.idUsuario)) return;

      this.detallesCargando.add(persona.idUsuario);
      this.detallesError.delete(persona.idUsuario);
      const idEncuesta = this.seguimientoEncuestaId !== 'ALL'
        ? Number(this.seguimientoEncuestaId) : undefined;

      this.consultasDetalle.add(this.seguimientoService.obtenerDetalle(persona.idUsuario, idEncuesta).subscribe({
        next: detalle => {
          this.detallesSeguimiento[persona.idUsuario] = detalle;
          this.detallesCargando.delete(persona.idUsuario);
        },
        error: err => {
          console.error('Error al cargar detalle de seguimiento', err);
          this.detallesCargando.delete(persona.idUsuario);
          this.detallesError.add(persona.idUsuario);
        }
      }));
    }

    recargarDetalle(persona: PersonaResumenSeguimiento): void {
      this.personaExpandida = null;
      this.alternarDetalle(persona);
    }

    private limpiarDetallesSeguimiento(): void {
      this.consultasDetalle.unsubscribe();
      this.consultasDetalle = new Subscription();
      this.detallesSeguimiento = {};
      this.detallesCargando.clear();
      this.detallesError.clear();
      this.personaExpandida = null;
    }

    ngOnDestroy(): void {
      this.consulta?.unsubscribe();
      this.consultasDetalle.unsubscribe();
      this.consultasCatalogo.unsubscribe();
    }


}
