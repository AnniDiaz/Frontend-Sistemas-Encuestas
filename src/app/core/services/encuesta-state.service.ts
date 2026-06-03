import { Injectable, signal, computed } from '@angular/core';
import { Instrumento, Egresado, RespuestaPregunta } from '../../shared/models/encuesta.model';

@Injectable({
  providedIn: 'root'
})
export class EncuestaStateService {
  // Lista de instrumentos/encuestas de la UNSM v2026
  private readonly instrumentos: Instrumento[] = [
    {
      idInstrumento: 'ID20',
      nombre: 'Calidad del Egresado y Empleabilidad',
      descripcion: 'Evaluación general de la formación profesional y las facilidades de inserción en el mercado laboral que otorga la UNSM.',
      dimensiones: ['Formación recibida', 'Oportunidades de empleo', 'Uso de bolsa de trabajo'],
      preguntas: [
        { idPregunta: 1, numero: 1, texto: '¿Cómo evalúa la formación académica integral proporcionada por la UNSM?', criterio: 'CRITERIO DE EVALUACIÓN 1' },
        { idPregunta: 2, numero: 2, texto: 'La formación recibida facilitó mi inserción en el mercado laboral.', criterio: 'CRITERIO DE EVALUACIÓN 2' },
        { idPregunta: 3, numero: 3, texto: 'El perfil de egreso del programa es competitivo frente a otros graduados.', criterio: 'CRITERIO DE EVALUACIÓN 3' },
        { idPregunta: 4, numero: 4, texto: 'Los conocimientos adquiridos son aplicables a las funciones que desempeño hoy.', criterio: 'CRITERIO DE EVALUACIÓN 4' },
        { idPregunta: 5, numero: 5, texto: 'El prestigio de la institución ha influido positivamente en mi empleabilidad.', criterio: 'CRITERIO DE EVALUACIÓN 5' }
      ]
    },
    {
      idInstrumento: 'ID21',
      nombre: 'Calidad de Gestión Administrativa',
      descripcion: 'Evaluación de tiempos de respuesta, digitalización y atención brindada en trámites académicos de graduación.',
      dimensiones: ['Tiempos de trámite', 'Atención al usuario', 'Canales digitales'],
      preguntas: [
        { idPregunta: 6, numero: 1, texto: 'El tiempo de respuesta de los trámites de titulación fue adecuado y ágil.', criterio: 'CRITERIO DE EVALUACIÓN 1' },
        { idPregunta: 7, numero: 2, texto: 'La atención brindada por el personal de secretaría fue cordial y eficiente.', criterio: 'CRITERIO DE EVALUACIÓN 2' },
        { idPregunta: 8, numero: 3, texto: 'Los canales virtuales (Intranet, Mesa de Partes) respondieron satisfactoriamente.', criterio: 'CRITERIO DE EVALUACIÓN 3' },
        { idPregunta: 9, numero: 4, texto: 'Los procesos de pagos de tasas académicas fueron sencillos y centralizados.', criterio: 'CRITERIO DE EVALUACIÓN 4' },
        { idPregunta: 10, numero: 5, texto: 'Recomiendo los servicios de atención del portal de egresados de la UNSM.', criterio: 'CRITERIO DE EVALUACIÓN 5' }
      ]
    },
    {
      idInstrumento: 'ID22',
      nombre: 'Calidad de Enseñanza y Docencia',
      descripcion: 'Orientada a evaluar el desempeño, metodología y actualización tecnológica de los docentes.',
      dimensiones: ['Metodología docente', 'Dominio de asignaturas', 'Relación docente-alumno'],
      preguntas: [
        { idPregunta: 11, numero: 1, texto: 'Los docentes del programa demostraron amplio dominio de las asignaturas.', criterio: 'CRITERIO DE EVALUACIÓN 1' },
        { idPregunta: 12, numero: 2, texto: 'Las metodologías de enseñanza aplicadas fomentaron mi autoaprendizaje.', criterio: 'CRITERIO DE EVALUACIÓN 2' },
        { idPregunta: 13, numero: 3, texto: 'Se cumplieron rigurosamente los sílabos académicos propuestos en clases.', criterio: 'CRITERIO DE EVALUACIÓN 3' },
        { idPregunta: 14, numero: 4, texto: 'La relación y comunicación con los docentes fue respetuosa y cercana.', criterio: 'CRITERIO DE EVALUACIÓN 4' },
        { idPregunta: 15, numero: 5, texto: 'Las evaluaciones reflejaron adecuadamente el contenido impartido.', criterio: 'CRITERIO DE EVALUACIÓN 5' }
      ]
    },
    {
      idInstrumento: 'ID23',
      nombre: 'Servicios de Bienestar Universitario',
      descripcion: 'Evaluación de las unidades de asistencia médica, comedor universitario, actividades deportivas y culturales.',
      dimensiones: ['Servicio médico', 'Servicio de comedor', 'Actividades culturales y deportivas'],
      preguntas: [
        { idPregunta: 16, numero: 1, texto: 'El servicio médico y psicopedagógico respondió oportunamente a mis consultas.', criterio: 'CRITERIO DE EVALUACIÓN 1' },
        { idPregunta: 17, numero: 2, texto: 'Las instalaciones de comedor universitario ofrecieron un servicio de calidad e higiene.', criterio: 'CRITERIO DE EVALUACIÓN 2' },
        { idPregunta: 18, numero: 3, texto: 'Las actividades deportivas y artísticas promovieron mi formación integral.', criterio: 'CRITERIO DE EVALUACIÓN 3' },
        { idPregunta: 19, numero: 4, texto: 'Se brindaron facilidades de becas y apoyo socioeconómico a los estudiantes.', criterio: 'CRITERIO DE EVALUACIÓN 4' },
        { idPregunta: 20, numero: 5, texto: 'Siento que el área de Bienestar cumplió un rol clave en mi vida universitaria.', criterio: 'CRITERIO DE EVALUACIÓN 5' }
      ]
    },
    {
      idInstrumento: 'ID24',
      nombre: 'Infraestructura y Equipamiento',
      descripcion: 'Evaluación física de las aulas de estudio, laboratorios técnicos especializados y conectividad del campus.',
      dimensiones: ['Laboratorios especializados', 'Aulas y conectividad', 'Biblioteca institucional'],
      preguntas: [
        { idPregunta: 21, numero: 1, texto: 'Los laboratorios y talleres contaron con equipos actualizados y suficientes.', criterio: 'CRITERIO DE EVALUACIÓN 1' },
        { idPregunta: 22, numero: 2, texto: 'Las aulas de clase presentaron iluminación, acústica y ventilación adecuadas.', criterio: 'CRITERIO DE EVALUACIÓN 2' },
        { idPregunta: 23, numero: 3, texto: 'La biblioteca ofreció bibliografía actualizada tanto física como virtual.', criterio: 'CRITERIO DE EVALUACIÓN 3' },
        { idPregunta: 24, numero: 4, texto: 'Las áreas comunes y deportivas se mantuvieron limpias y en buen estado.', criterio: 'CRITERIO DE EVALUACIÓN 4' },
        { idPregunta: 25, numero: 5, texto: 'La conectividad de red y wifi en el campus fue estable y veloz.', criterio: 'CRITERIO DE EVALUACIÓN 5' }
      ]
    },
    {
      idInstrumento: 'ID26',
      nombre: 'Trayectoria Profesional',
      descripcion: 'Seguimiento de cargos, salarios y ascensos laborales conseguidos tras egresar de la institución.',
      dimensiones: ['Nivel salarial', 'Crecimiento laboral', 'Capacitación continua'],
      preguntas: [
        { idPregunta: 26, numero: 1, texto: 'Conseguí empleo afín a mi carrera en los primeros 6 meses tras el egreso.', criterio: 'CRITERIO DE EVALUACIÓN 1' },
        { idPregunta: 27, numero: 2, texto: 'Mi salario actual se corresponde con las expectativas del mercado laboral.', criterio: 'CRITERIO DE EVALUACIÓN 2' },
        { idPregunta: 28, numero: 3, texto: 'He logrado ascensos o mejoras contractuales en mi puesto laboral.', criterio: 'CRITERIO DE EVALUACIÓN 3' },
        { idPregunta: 29, numero: 4, texto: 'Participo constantemente en capacitaciones o posgrados de especialización.', criterio: 'CRITERIO DE EVALUACIÓN 4' },
        { idPregunta: 30, numero: 5, texto: 'Mi carrera profesional se encuentra en continuo crecimiento.', criterio: 'CRITERIO DE EVALUACIÓN 5' }
      ]
    },
    {
      idInstrumento: 'ID27',
      nombre: 'Pertinencia del Plan de Estudios',
      descripcion: 'Evaluación del currículo de la carrera frente a las demandas contemporáneas del mercado laboral de la Amazonía.',
      dimensiones: ['Actualización curricular', 'Habilidades prácticas', 'Metodología científica'],
      preguntas: [
        { idPregunta: 31, numero: 1, texto: 'Los cursos del plan de estudios cubrieron las tendencias de mi profesión.', criterio: 'CRITERIO DE EVALUACIÓN 1' },
        { idPregunta: 32, numero: 2, texto: 'Se incluyó formación práctica indispensable para el mercado local.', criterio: 'CRITERIO DE EVALUACIÓN 2' },
        { idPregunta: 33, numero: 3, texto: 'La formación en investigación científica aportó valor a mi carrera.', criterio: 'CRITERIO DE EVALUACIÓN 3' },
        { idPregunta: 34, numero: 4, texto: 'El plan de estudios integró temas éticos y de responsabilidad social.', criterio: 'CRITERIO DE EVALUACIÓN 4' },
        { idPregunta: 35, numero: 5, texto: 'Los talleres complementarios cubrieron habilidades blandas necesarias.', criterio: 'CRITERIO DE EVALUACIÓN 5' }
      ]
    }
  ];

  // Listado de egresados de prueba exactos del mockup
  private readonly egresadosMock = signal<Egresado[]>([
    {
      dni: '12345678',
      nombre: 'Ana María Vásquez Torres',
      carrera: 'Ingeniería de Sistemas e Informática',
      facultad: 'Ingeniería de Sistemas y Civil',
      email: 'am.vasquezt@unsm.edu.pe',
      celular: '942856321',
      anioGraduacion: '2025',
      perfilTipo: 'reciente', // Últimos 5 años (ID20-ID24, ID26, ID27)
      encuestasCompletadas: [],
      respuestas: {
        'ID22': [
          { idPregunta: 11, valor: 5 }, { idPregunta: 12, valor: 5 }, { idPregunta: 13, valor: 5 }, { idPregunta: 14, valor: 5 }, { idPregunta: 15, valor: 5 }
        ] // ID22 simulado como "En Progreso (100%)"
      }
    },
    {
      dni: '87654321',
      nombre: 'Carlos Enrique',
      carrera: 'Ingeniería de Sistemas e Informática',
      facultad: 'Ingeniería de Sistemas y Civil',
      email: 'carlos.enrique@unsm.edu.pe',
      celular: '987654321',
      anioGraduacion: '2024',
      perfilTipo: 'tramites', // Con trámite reciente (Adds ID21)
      encuestasCompletadas: [],
      respuestas: {}
    },
    {
      dni: '11223344',
      nombre: 'Luz Marina',
      carrera: 'Ingeniería de Sistemas e Informática',
      facultad: 'Ingeniería de Sistemas y Civil',
      email: 'luz.marina@unsm.edu.pe',
      celular: '955667788',
      anioGraduacion: '2023',
      perfilTipo: 'estandar', // Estándar (ID20, ID26, ID27)
      encuestasCompletadas: [],
      respuestas: {}
    }
  ]);

  // Sesión activa
  readonly currentUserDni = signal<string | null>(null);
  readonly currentUserRol = signal<'egresado' | 'empleador' | null>(null);

  // Instrumento activo que se está respondiendo
  readonly activeInstrumentoId = signal<string | null>(null);

  // Respuestas en caliente cargadas para el instrumento activo
  readonly tempAnswers = signal<RespuestaPregunta[]>([]);

  // Computed: Egresado logueado
  readonly egresadoActual = computed(() => {
    const dni = this.currentUserDni();
    if (!dni || this.currentUserRol() !== 'egresado') return null;
    return this.egresadosMock().find(e => e.dni === dni) || null;
  });

  readonly isAuthenticated = computed(() => this.currentUserDni() !== null);

  // Obtiene los instrumentos que le corresponden al egresado según su perfilTipo
  getInstrumentosDeEgresado(perfil: 'estandar' | 'tramites' | 'reciente'): Instrumento[] {
    const ids: string[] = [];
    if (perfil === 'estandar') {
      ids.push('ID20', 'ID26', 'ID27');
    } else if (perfil === 'tramites') {
      ids.push('ID20', 'ID21', 'ID26', 'ID27');
    } else if (perfil === 'reciente') {
      ids.push('ID20', 'ID22', 'ID23', 'ID24', 'ID26', 'ID27'); // 6 encuestas
    }
    return this.instrumentos.filter(i => ids.includes(i.idInstrumento));
  }

  // Permite al revisor de UX togglear dinámicamente el perfil del egresado
  cambiarPerfilTipoEgresadoActual(nuevoPerfil: 'estandar' | 'tramites' | 'reciente'): void {
    const dni = this.currentUserDni();
    if (!dni) return;

    this.egresadosMock.update(egresados => {
      return egresados.map(e => {
        if (e.dni === dni) {
          return { ...e, perfilTipo: nuevoPerfil };
        }
        return e;
      });
    });
  }

  getInstrumentoPorId(id: string): Instrumento | null {
    return this.instrumentos.find(i => i.idInstrumento === id) || null;
  }

  getEgresadosList(): Egresado[] {
    return this.egresadosMock();
  }

  login(dni: string, rol: 'egresado' | 'empleador'): boolean {
    if (rol === 'egresado') {
      const egresado = this.egresadosMock().find(e => e.dni === dni);
      if (egresado) {
        this.currentUserDni.set(dni);
        this.currentUserRol.set(rol);
        return true;
      }
      return false;
    } else {
      // Login de Empleador: DNI simulador 44556677 (Alejandro Salazar) u otro de 8 cifras
      if (dni === '44556677' || dni.length >= 8) {
        this.currentUserDni.set(dni);
        this.currentUserRol.set(rol);
        return true;
      }
      return false;
    }
  }

  logout(): void {
    this.currentUserDni.set(null);
    this.currentUserRol.set(null);
    this.activeInstrumentoId.set(null);
    this.tempAnswers.set([]);
  }

  seleccionarInstrumento(id: string): void {
    this.activeInstrumentoId.set(id);
    const egresado = this.egresadoActual();
    if (egresado) {
      // Cargar respuestas guardadas de este instrumento si existen
      this.tempAnswers.set(egresado.respuestas[id] || []);
    }
  }

  guardarRespuestaEnCaliente(idPregunta: number, valor: number): void {
    const actuales = this.tempAnswers();
    const index = actuales.findIndex(r => r.idPregunta === idPregunta);
    let nuevas = [...actuales];

    if (index > -1) {
      nuevas[index] = { idPregunta, valor };
    } else {
      nuevas.push({ idPregunta, valor });
    }

    this.tempAnswers.set(nuevas);

    // Guardar inmediatamente en caliente en el egresado
    const dni = this.currentUserDni();
    const instId = this.activeInstrumentoId();
    if (dni && instId) {
      this.egresadosMock.update(egresados => {
        return egresados.map(e => {
          if (e.dni === dni) {
            const nuevasRespuestas = { ...e.respuestas, [instId]: nuevas };
            // Si el egresado completó el 100% de las preguntas pero aún no ha enviado,
            // podemos mantenerlo en progreso, pero si lo marca en progreso se puede calcular dinámicamente.
            return {
              ...e,
              respuestas: nuevasRespuestas
            };
          }
          return e;
        });
      });
    }
  }

  finalizarInstrumentoActivo(): boolean {
    const dni = this.currentUserDni();
    const instId = this.activeInstrumentoId();
    if (!dni || !instId) return false;

    this.egresadosMock.update(egresados => {
      return egresados.map(e => {
        if (e.dni === dni) {
          const completados = e.encuestasCompletadas.includes(instId)
            ? e.encuestasCompletadas
            : [...e.encuestasCompletadas, instId];

          return {
            ...e,
            encuestasCompletadas: completados
          };
        }
        return e;
      });
    });

    this.activeInstrumentoId.set(null);
    this.tempAnswers.set([]);
    return true;
  }

  cancelarLlenado(): void {
    this.activeInstrumentoId.set(null);
    this.tempAnswers.set([]);
  }
}
