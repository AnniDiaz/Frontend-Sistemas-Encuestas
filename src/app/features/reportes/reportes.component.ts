  import { Component, OnInit } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { FormsModule } from '@angular/forms';
  import { EscuelaService } from '../../service/escuela.service';
  import { ReporteService } from '../../service/reportes.service';
  import {
    DashboardResponse,
    DashboardKpis,
    ComparativoPorEscuela,
    DistribucionSentimiento,
    RankingCalidadPregunta
  } from '../../shared/models/dashboard.model';
  import * as XLSX from 'xlsx-js-style';
  import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';
  import {
    Chart,
    BarElement,
    BarController,
    DoughnutController,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
  } from 'chart.js';
  import { Router } from '@angular/router';
  const COLORS = {
    primary: '16A34A',
    dark: '0F172A',
    gray: 'F8FAFC',
    border: 'CBD5E1',
    white: 'FFFFFF'
  };

  const titleStyle = {
    font: {
      bold: true,
      sz: 18,
      color: { rgb: COLORS.white }
    },
    fill: {
      fgColor: { rgb: COLORS.primary }
    },
    alignment: {
      horizontal: 'center',
      vertical: 'center'
    }
  };
  const subtitleStyle = {
    font: {
      italic: true,
      sz: 10,
      color: { rgb: COLORS.white }
    },
    fill: {
      fgColor: { rgb: COLORS.dark }
    },
    alignment: {
      horizontal: 'center'
    }
  };

  const headerStyle = {
    font: {
      bold: true,
      color: { rgb: COLORS.white }
    },
    fill: {
      fgColor: { rgb: COLORS.dark }
    },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' }
    },
    alignment: {
      horizontal: 'center'
    }
  };
  Chart.register(
    BarElement,
    BarController,
    DoughnutController,
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend
  );

  @Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reportes.component.html',
    styleUrls: ['./reportes.component.css']
  })

  export class ReportesComponent implements OnInit {

    // Filtros
    encuestaId: any = 'ALL';
    encuestas: any[] = [];
    carrera: string = '';
    escuelas: any[] = [];

    // Dashboard data
    kpis: DashboardKpis = {
      totalRespuestas: 0,
      egresadosEncuestados: 0,
      promedioSatisfaccion: 0,
      mejorEscuela: '-',
      peorEscuela: '-',
      tasaParticipacion: 0
    };
    comparativoPorEscuela: ComparativoPorEscuela[] = [];
    distribucionSentimiento: DistribucionSentimiento[] = [];
    rankingCalidadPreguntas: RankingCalidadPregunta[] = [];

    // Charts
    comparativoChart: any;
    sentimientoChart: any;

    cargando = false;
    generandoPDF = false;

    // Fecha actual dinámica
    fechaActual = new Date().toLocaleDateString('es-PE', {
      day: '2-digit', month: 'long', year: 'numeric'
    });

    constructor(
      private escuelaService: EscuelaService,
      private reporteService: ReporteService,
      private router: Router
    ) {}

    ngOnInit(): void {
      this.cargarEscuelas();
      this.cargarEncuestas();
      this.cargarDashboard();
    }

    cargarEncuestas(): void {
      this.escuelaService.obtenerInstrumentos().subscribe({
        next: (data: any) => {
          this.encuestas = data;
        },
        error: (err) => console.error(err)
      });
    }


    cargarEscuelas(): void {
      this.escuelaService.obtenerEscuelas().subscribe({
        next: (response: any) => {
          this.escuelas = response.data || [];
        }
      });
    }

    cargarDashboard(): void {
      this.cargando = true;

      const idEncuesta = this.encuestaId !== 'ALL' ? Number(this.encuestaId) : undefined;
      const facultad = this.carrera?.trim() || undefined;

      this.reporteService.obtenerDashboard(idEncuesta, facultad).subscribe({
        next: (data: DashboardResponse) => {
          this.kpis = data.kpis;
          this.comparativoPorEscuela = data.comparativoPorEscuela || [];
          this.distribucionSentimiento = data.distribucionSentimiento || [];
          this.rankingCalidadPreguntas = data.rankingCalidadPreguntas || [];
          this.cargando = false;
          setTimeout(() => this.renderGraficos(), 300);
        },
        error: (err: any) => {
          console.error('Error al cargar dashboard', err);
          this.cargando = false;
        }
      });
    }

    onEncuestaChange(): void {
      this.cargarDashboard();
    }

    onAplicarFiltro(): void {
      this.cargarDashboard();
    }

    onCarreraChange(event: any): void {
      this.carrera = event.target.value?.trim() || '';
      this.cargarDashboard();
    }

    renderGraficos(): void {
      this.renderComparativoChart();
      this.renderSentimientoChart();
    }

    renderComparativoChart(): void {
      if (this.comparativoChart) {
        this.comparativoChart.destroy();
      }

      const canvas = document.getElementById('comparativoChart') as HTMLCanvasElement;
      if (!canvas || !this.comparativoPorEscuela.length) return;

      this.comparativoChart = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: this.comparativoPorEscuela.map(x => x.escuelaProfesional),
          datasets: [
            {
              label: 'Promedio de Satisfacción',
              data: this.comparativoPorEscuela.map(x => x.promedioSatisfaccion),
              backgroundColor: this.comparativoPorEscuela.map((_, i) =>
                i % 2 === 0 ? '#16a34a' : '#22c55e'
              ),
              borderRadius: 8,
              borderSkipped: false
            },
            {
              label: 'Total Respuestas',
              data: this.comparativoPorEscuela.map(x => x.totalRespuestas),
              backgroundColor: this.comparativoPorEscuela.map((_, i) =>
                i % 2 === 0 ? '#0f172a' : '#334155'
              ),
              borderRadius: 8,
              borderSkipped: false
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    renderSentimientoChart(): void {
      if (this.sentimientoChart) {
        this.sentimientoChart.destroy();
        this.sentimientoChart = null;
      }

      const canvas = document.getElementById('sentimientoChart') as HTMLCanvasElement;
      if (!canvas) return;

      const datos = this.distribucionSentimiento.filter(x => x.porcentaje > 0);
      if (!datos.length) return;

      this.sentimientoChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: datos.map(x => x.categoria),
          datasets: [{
            data: datos.map(x => x.porcentaje),
            backgroundColor: [
              '#16a34a',
              '#22c55e',
              '#f59e0b',
              '#ef4444',
              '#b91c1c'
            ],
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'right' },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
              }
            }
          }
        }
      });
    }

    tieneDatosSentimiento(): boolean {
      return this.distribucionSentimiento.some(x => x.porcentaje > 0);
    }

    getEstadoClass(estado: string): string {
      switch (estado) {
        case 'Bueno':    return 'estado-bueno';
        case 'Regular':  return 'estado-regular';
        case 'Crítico':  return 'estado-critico';
        default:         return '';
      }
    }

    descargarExcel(): void {
      if (!this.rankingCalidadPreguntas.length && !this.comparativoPorEscuela.length) {
        alert('No hay datos cargados aún');
        return;
      }

      const workbook = XLSX.utils.book_new();
      const encuestaLabel = this.encuestaId === 'ALL' ? 'TODAS' : this.encuestaId;
      const fecha = new Date().toLocaleDateString('es-PE');
      /* =====================================================
PORTADA EJECUTIVA
===================================================== */

const wsResumen = XLSX.utils.aoa_to_sheet([
['UNIVERSIDAD NACIONAL DE SAN MARTÍN'],
['REPORTE EJECUTIVO DE ANALÍTICA'],
[],
['Información General', 'Valor'],
['Fecha de Generación', fecha],
['Encuesta', encuestaLabel],
['Facultad / Escuela', this.carrera || 'Todas'],
['Total Respuestas', this.kpis.totalRespuestas],
['Promedio Satisfacción', this.kpis.promedioSatisfaccion],
['Participación (%)', this.kpis.tasaParticipacion]
]);

wsResumen['!cols'] = [
{ wch: 35 },
{ wch: 40 }
];

wsResumen['!merges'] = [
{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
{ s: { r: 1, c: 0 }, e: { r: 1, c: 1 } }
];

['A1', 'B1'].forEach(c => {
if (wsResumen[c]) wsResumen[c].s = titleStyle;
});

['A2', 'B2'].forEach(c => {
if (wsResumen[c]) wsResumen[c].s = subtitleStyle;
});

['A4', 'B4'].forEach(c => {
if (wsResumen[c]) wsResumen[c].s = headerStyle;
});

for (let row = 5; row <= 10; row++) {

['A', 'B'].forEach(col => {


const cell = wsResumen[`${col}${row}`];

if (cell) {

  cell.s = {
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    },
    fill: {
      fgColor: {
        rgb: row % 2 === 0
          ? 'FFFFFF'
          : 'F8FAFC'
      }
    }
  };

}


});

}

XLSX.utils.book_append_sheet(
workbook,
wsResumen,
'Resumen Ejecutivo'
);


      // ── Hoja 1: KPIs ──────────────────────────────────────────────
      const wsKpis = XLSX.utils.aoa_to_sheet([
        ['DASHBOARD DE ENCUESTAS - UNSM'],
        [`Encuesta: ${encuestaLabel}   |   Facultad: ${this.carrera || 'Todas'}   |   Fecha: ${fecha}`],
        [],
        ['INDICADORES CLAVE DE DESEMPEÑO (KPIs)'],
        ['Indicador', 'Valor'],
        ['Total Respuestas',        this.kpis.totalRespuestas],
        ['Egresados Encuestados',   this.kpis.egresadosEncuestados],
        ['Promedio Satisfacción',   this.kpis.promedioSatisfaccion],
        ['Mejor Escuela',           this.kpis.mejorEscuela],
        ['Peor Escuela',            this.kpis.peorEscuela],
        ['Tasa Participación (%)',  this.kpis.tasaParticipacion],
      ]);
      wsKpis['!cols'] = [{ wch: 30 }, { wch: 40 }];
      wsKpis['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
      ];
      XLSX.utils.book_append_sheet(workbook, wsKpis, 'KPIs');

      // ── Hoja 2: Comparativo por Escuela ───────────────────────────
      if (this.comparativoPorEscuela.length) {
        const wsComp = XLSX.utils.aoa_to_sheet([
          ['COMPARATIVO POR ESCUELA PROFESIONAL'],
          [`Fecha: ${fecha}`],
          [],
          ['Escuela Profesional', 'Promedio Satisfacción', 'Total Respuestas'],
          ...this.comparativoPorEscuela.map(e => [
            e.escuelaProfesional,
            e.promedioSatisfaccion,
            e.totalRespuestas
          ])
        ]);
        wsComp['!cols'] = [{ wch: 45 }, { wch: 25 }, { wch: 20 }];
        wsComp['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        ];
        XLSX.utils.book_append_sheet(workbook, wsComp, 'Comparativo Escuelas');
      }

      // ── Hoja 3: Distribución de Sentimiento ───────────────────────
      if (this.distribucionSentimiento.length) {
        const wsSent = XLSX.utils.aoa_to_sheet([
          ['DISTRIBUCIÓN DE SENTIMIENTO'],
          [`Fecha: ${fecha}`],
          [],
          ['Categoría', 'Porcentaje (%)'],
          ...this.distribucionSentimiento.map(s => [s.categoria, s.porcentaje])
        ]);
        wsSent['!cols'] = [{ wch: 25 }, { wch: 20 }];
        wsSent['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        ];
        XLSX.utils.book_append_sheet(workbook, wsSent, 'Sentimiento');
      }

      // ── Hoja 4: Ranking de Calidad ────────────────────────────────
      if (this.rankingCalidadPreguntas.length) {
        const rankRows: any[][] = [
          ['RANKING DE CALIDAD POR PREGUNTAS'],
          [`Encuesta: ${encuestaLabel}   |   Fecha: ${fecha}`],
          [],
          ['N°', 'Descripción', 'Promedio', 'Estado'],
          ...this.rankingCalidadPreguntas.map((p, i) => [
            i + 1,
            p.descripcion,
            p.promedio,
            p.estado
          ])
        ];
        const wsRank = XLSX.utils.aoa_to_sheet(rankRows);
        wsRank['!cols'] = [{ wch: 6 }, { wch: 75 }, { wch: 12 }, { wch: 12 }];
        wsRank['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
        ];

        // Estilos de cabecera y título
        const headerStyle = { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11 }, fill: { fgColor: { rgb: '0F172A' } }, alignment: { horizontal: 'center' } };
        const titleStyle  = { font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14 }, fill: { fgColor: { rgb: '16A34A' } }, alignment: { horizontal: 'center' } };
        const subStyle    = { font: { italic: true, color: { rgb: 'FFFFFF' }, sz: 9  }, fill: { fgColor: { rgb: '334155' } }, alignment: { horizontal: 'center' } };

        // fila 0: título
        ['A1','B1','C1','D1'].forEach(c => { if (wsRank[c]) wsRank[c].s = titleStyle; });
        // fila 1: subtítulo
        ['A2','B2','C2','D2'].forEach(c => { if (wsRank[c]) wsRank[c].s = subStyle; });
        // fila 3: cabeceras
        ['A4','B4','C4','D4'].forEach(c => { if (wsRank[c]) wsRank[c].s = headerStyle; });

        // filas de datos: color por estado
        this.rankingCalidadPreguntas.forEach((p, i) => {
          const row = i + 5; // fila Excel (1-indexed, +4 por las filas de cabecera)
          const estadoColors: Record<string, string> = { 'Bueno': 'DCFCE7', 'Regular': 'FEF9C3', 'Crítico': 'FEE2E2' };
          const estadoFg:     Record<string, string> = { 'Bueno': '15803D', 'Regular': 'A16207', 'Crítico': 'B91C1C' };
          const bg = i % 2 === 0 ? 'FFFFFF' : 'F8FAFC';
          const dataCellStyle = { fill: { fgColor: { rgb: bg } }, font: { sz: 9 } };
          const estadoCellStyle = {
            fill: { fgColor: { rgb: estadoColors[p.estado] || 'F1F5F9' } },
            font: { bold: true, color: { rgb: estadoFg[p.estado] || '334155' }, sz: 9 },
            alignment: { horizontal: 'center' }
          };
          [`A${row}`,`B${row}`,`C${row}`].forEach(c => { if (wsRank[c]) wsRank[c].s = dataCellStyle; });
          if (wsRank[`D${row}`]) wsRank[`D${row}`].s = estadoCellStyle;
        });

        XLSX.utils.book_append_sheet(workbook, wsRank, 'Ranking Preguntas');
      }

      XLSX.writeFile(workbook, `dashboard_reporte_${encuestaLabel}_${fecha.replace(/\//g, '-')}.xlsx`);
    }

    async descargarPDF(): Promise<void> {
      if (this.generandoPDF) return;
      this.generandoPDF = true;

      try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const ml = 14;           // margen izquierdo
        const mr = 14;           // margen derecho
        const cw = pageW - ml - mr; // ancho contenido
        const fecha = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
        const encLabel = this.encuestaId === 'ALL' ? 'Todas las encuestas' : `Encuesta #${this.encuestaId}`;
        let y = 0;

        // ─── helper: nueva página si no hay espacio ───────────────────
        const checkPage = (needed: number) => {
          if (y + needed > pageH - 16) { pdf.addPage(); y = 16; }
        };

        // ─── helper: título de sección ────────────────────────────────
        const sectionTitle = (title: string) => {
          checkPage(12);
          pdf.setFillColor(22, 163, 74);
          pdf.rect(ml, y, cw, 8, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'bold');
          pdf.text(title, ml + 4, y + 5.5);
          y += 10;
        };

        // ─── helper: pie de página en todas las hojas ─────────────────
        const addFooters = () => {
          const total = (pdf as any).internal.getNumberOfPages();
          for (let i = 1; i <= total; i++) {
            pdf.setPage(i);
            pdf.setFillColor(241, 245, 249);
            pdf.rect(0, pageH - 8, pageW, 8, 'F');
            pdf.setFontSize(7);
            pdf.setTextColor(148, 163, 184);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Universidad Nacional de San Martín — Sistema de Encuestas', ml, pageH - 3);
            pdf.text(`Página ${i} / ${total}`, pageW - mr - 16, pageH - 3);
          }
        };

        // ══════════════════════════════════════════════════════════════
        // PÁGINA 1 — PORTADA
        // ══════════════════════════════════════════════════════════════
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageW, pageH, 'F');

        // Banda verde
        pdf.setFillColor(22, 163, 74);
        pdf.rect(0, pageH / 2 - 35, pageW, 60, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');
        pdf.text('REPORTE', pageW / 2, pageH / 2 - 18, { align: 'center' });
        pdf.setFontSize(14);
        pdf.text('ANALÍTICA AVANZADA', pageW / 2, pageH / 2 - 8, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(encLabel, pageW / 2, pageH / 2 + 6, { align: 'center' });
        pdf.text(this.carrera || 'Todas las facultades', pageW / 2, pageH / 2 + 13, { align: 'center' });

        pdf.setFontSize(9);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Generado el ${fecha}`, pageW / 2, pageH - 25, { align: 'center' });
        pdf.text('Universidad Nacional de San Martín', pageW / 2, pageH - 18, { align: 'center' });

        // ══════════════════════════════════════════════════════════════
        // PÁGINA 2 — KPIs + COMPARATIVO
        // ══════════════════════════════════════════════════════════════
        pdf.addPage();
        y = 16;

        // Encabezado de página
        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageW, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DASHBOARD ANALÍTICA — UNSM', ml, 7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(fecha, pageW - mr - 20, 7);

        // ── KPIs ──────────────────────────────────────────────────────
        sectionTitle('INDICADORES CLAVE DE DESEMPEÑO (KPIs)');

        const kpiData = [
          { label: 'Total Respuestas',      value: String(this.kpis.totalRespuestas),             color: [22, 163, 74]  as [number,number,number] },
          { label: 'Egresados Encuestados', value: String(this.kpis.egresadosEncuestados),        color: [37, 99, 235]  as [number,number,number] },
          { label: 'Promedio Satisfacción', value: this.kpis.promedioSatisfaccion.toFixed(2),     color: [202, 138, 4]  as [number,number,number] },
          { label: 'Tasa Participación',    value: `${this.kpis.tasaParticipacion.toFixed(1)}%`,  color: [13, 148, 136] as [number,number,number] },
        ];

        const kpiW = (cw - 6) / 4;
        kpiData.forEach((k, i) => {
          const kx = ml + i * (kpiW + 2);
          pdf.setFillColor(248, 250, 252);
          pdf.roundedRect(kx, y, kpiW, 22, 3, 3, 'F');
          pdf.setFillColor(k.color[0], k.color[1], k.color[2]);
          pdf.roundedRect(kx, y, kpiW, 4, 2, 2, 'F');
          pdf.setTextColor(100, 116, 139);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.text(k.label.toUpperCase(), kx + kpiW / 2, y + 10, { align: 'center' });
          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(k.value, kx + kpiW / 2, y + 18, { align: 'center' });
        });
        y += 28;

        // KPIs de texto (mejor/peor escuela)
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(ml, y, (cw - 4) / 2, 14, 3, 3, 'F');
        pdf.setFillColor(22, 163, 74);
        pdf.roundedRect(ml, y, 3, 14, 1, 1, 'F');
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('MEJOR ESCUELA', ml + 6, y + 5);
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        const mejorText = (this.kpis.mejorEscuela || '-').substring(0, 35);
        pdf.text(mejorText, ml + 6, y + 11);

        const mx2 = ml + (cw - 4) / 2 + 4;
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(mx2, y, (cw - 4) / 2, 14, 3, 3, 'F');
        pdf.setFillColor(220, 38, 38);
        pdf.roundedRect(mx2, y, 3, 14, 1, 1, 'F');
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('PEOR ESCUELA', mx2 + 6, y + 5);
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        const peorText = (this.kpis.peorEscuela || '-').substring(0, 35);
        pdf.text(peorText, mx2 + 6, y + 11);
        y += 20;

        // ── Gráfico comparativo (directo del canvas) ──────────────────
        sectionTitle('COMPARATIVO POR ESCUELA PROFESIONAL');
        const canvasComp = document.getElementById('comparativoChart') as HTMLCanvasElement;
        if (canvasComp) {
          const imgData = canvasComp.toDataURL('image/png', 1.0);
          const ratio = canvasComp.height / canvasComp.width;
          const imgH = cw * ratio;
          checkPage(imgH + 4);
          pdf.addImage(imgData, 'PNG', ml, y, cw, imgH);
          y += imgH + 6;
        } else {
          // fallback tabla si no hay canvas
          this.pdfTablaComparativo(pdf, ml, cw, y);
          y += this.comparativoPorEscuela.length * 8 + 16;
        }

        // ── Tabla comparativo por escuela ─────────────────────────────
        sectionTitle('DETALLE COMPARATIVO POR ESCUELA');
        this.pdfTablaComparativo(pdf, ml, cw, y);
        y += this.comparativoPorEscuela.length * 8 + 14;

        // ══════════════════════════════════════════════════════════════
        // PÁGINA 3 — SENTIMIENTO + RANKING
        // ══════════════════════════════════════════════════════════════
        pdf.addPage();
        y = 16;

        pdf.setFillColor(15, 23, 42);
        pdf.rect(0, 0, pageW, 10, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DASHBOARD ANALÍTICA — UNSM', ml, 7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(fecha, pageW - mr - 20, 7);

        // ── Gráfico sentimiento ───────────────────────────────────────
        sectionTitle('DISTRIBUCIÓN DE SENTIMIENTO');
        const canvasSent = document.getElementById('sentimientoChart') as HTMLCanvasElement;
        if (canvasSent && this.tieneDatosSentimiento()) {
          const imgSent = canvasSent.toDataURL('image/png', 1.0);
          const ratioS = canvasSent.height / canvasSent.width;
          const chartW = cw * 0.5;
          const chartH = chartW * ratioS;
          const cx = ml + (cw - chartW) / 2;
          pdf.addImage(imgSent, 'PNG', cx, y, chartW, chartH);
          y += chartH + 4;
        }

        // Tabla de sentimiento
        const colCat = cw * 0.6;
        const colPct = cw * 0.4;
        pdf.setFillColor(15, 23, 42);
        pdf.rect(ml, y, cw, 7, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Categoría', ml + 4, y + 5);
        pdf.text('Porcentaje', ml + colCat + 4, y + 5);
        y += 7;

        const sentColores: Record<string, number[]> = {
          'Muy Satisfecho':   [22, 163, 74],
          'Satisfecho':       [34, 197, 94],
          'Neutral':          [245, 158, 11],
          'Insatisfecho':     [239, 68, 68],
          'Muy Insatisfecho': [185, 28, 28],
        };

        this.distribucionSentimiento.forEach((s, i) => {
          const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
          pdf.setFillColor(bg[0], bg[1], bg[2]);
          pdf.rect(ml, y, cw, 7, 'F');
          const col = sentColores[s.categoria] || [100, 116, 139];
          pdf.setFillColor(col[0], col[1], col[2]);
          pdf.rect(ml, y, 3, 7, 'F');
          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(s.categoria, ml + 6, y + 5);
          pdf.setFont('helvetica', 'bold');
          // barra de porcentaje
          const barW = (colPct - 20) * (s.porcentaje / 100);
          pdf.setFillColor(col[0], col[1], col[2]);
          pdf.roundedRect(ml + colCat + 4, y + 2, barW, 3, 1, 1, 'F');
          pdf.setFillColor(229, 231, 235);
          if (barW < colPct - 20) {
            pdf.roundedRect(ml + colCat + 4 + barW, y + 2, (colPct - 20) - barW, 3, 1, 1, 'F');
          }
          pdf.setTextColor(15, 23, 42);
          pdf.text(`${s.porcentaje.toFixed(1)}%`, ml + colCat + colPct - 2, y + 5, { align: 'right' });
          y += 7;
        });
        y += 8;

        // ── Ranking de calidad ────────────────────────────────────────
        checkPage(20);
        sectionTitle('RANKING DE CALIDAD POR PREGUNTAS');

        const colCod  = 12;
        const colDesc = cw - colCod - 22 - 20;
        const colProm = 22;
        const colEst  = 20;

        pdf.setFillColor(15, 23, 42);
        pdf.rect(ml, y, cw, 7, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Num', ml + 2, y + 5);
        pdf.text('DESCRIPCIÓN', ml + colCod + 2, y + 5);
        pdf.text('PROM.', ml + colCod + colDesc + 2, y + 5);
        pdf.text('ESTADO', ml + colCod + colDesc + colProm + 2, y + 5);
        y += 7;

        const rankColors: Record<string, number[]> = {
          'Bueno':   [22, 163, 74],
          'Regular': [202, 138, 4],
          'Crítico': [220, 38, 38],
        };

        this.rankingCalidadPreguntas.forEach((item, i) => {
          checkPage(7);
          const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
          pdf.setFillColor(bg[0], bg[1], bg[2]);
          pdf.rect(ml, y, cw, 6.5, 'F');

          const col = rankColors[item.estado] || [100, 116, 139];
          pdf.setFillColor(col[0], col[1], col[2]);
          pdf.rect(ml, y, 2.5, 6.5, 'F');

          pdf.setTextColor(15, 23, 42);
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'bold');
          pdf.text(String(item.numero ?? (this.rankingCalidadPreguntas.indexOf(item) + 1)), ml + 3, y + 4.5);

          pdf.setFont('helvetica', 'normal');
          const desc = item.descripcion.length > 68
            ? item.descripcion.substring(0, 68) + '…'
            : item.descripcion;
          pdf.text(desc, ml + colCod + 2, y + 4.5);

          pdf.setFont('helvetica', 'bold');
          pdf.text(item.promedio.toFixed(2), ml + colCod + colDesc + 2, y + 4.5);

          // badge estado
          pdf.setFillColor(col[0], col[1], col[2]);
          pdf.roundedRect(ml + colCod + colDesc + colProm + 1, y + 1, colEst - 2, 4.5, 1.5, 1.5, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(6.5);
          pdf.setFont('helvetica', 'bold');
          pdf.text(item.estado, ml + colCod + colDesc + colProm + colEst / 2, y + 4, { align: 'center' });
          y += 6.5;
        });

        addFooters();

        const label = this.encuestaId === 'ALL' ? 'todas' : this.encuestaId;
        pdf.save(`reporte_dashboard_${label}.pdf`);

      } catch (err) {
        console.error('Error al generar PDF', err);
        alert('Error al generar el PDF. Revisa la consola.');
      } finally {
        this.generandoPDF = false;
      }
    }

    // ── Helper privado: tabla comparativo ──────────────────────────────
    private pdfTablaComparativo(pdf: jsPDF, ml: number, cw: number, y: number): void {
      const colEsc  = cw * 0.55;
      const colProm = cw * 0.25;
      const colResp = cw * 0.20;

      pdf.setFillColor(30, 41, 59);
      pdf.rect(ml, y, cw, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Escuela Profesional', ml + 3, y + 5);
      pdf.text('Prom. Satisfacción', ml + colEsc + 3, y + 5);
      pdf.text('Total Resp.', ml + colEsc + colProm + 3, y + 5);
      y += 7;

      this.comparativoPorEscuela.forEach((e, i) => {
        const bg = i % 2 === 0 ? [255, 255, 255] : [248, 250, 252];
        pdf.setFillColor(bg[0], bg[1], bg[2]);
        pdf.rect(ml, y, cw, 7, 'F');

        // barra visual de promedio
        const barMax = 5;
        const barW = (colProm - 28) * (e.promedioSatisfaccion / barMax);
        pdf.setFillColor(22, 163, 74);
        pdf.roundedRect(ml + colEsc + 3, y + 2.5, barW, 2.5, 1, 1, 'F');
        pdf.setFillColor(229, 231, 235);
        if (barW < colProm - 28) {
          pdf.roundedRect(ml + colEsc + 3 + barW, y + 2.5, (colProm - 28) - barW, 2.5, 1, 1, 'F');
        }

        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        const escName = e.escuelaProfesional.length > 38 ? e.escuelaProfesional.substring(0, 38) + '…' : e.escuelaProfesional;
        pdf.text(escName, ml + 3, y + 5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(e.promedioSatisfaccion.toFixed(2), ml + colEsc + colProm - 8, y + 5);
        pdf.text(String(e.totalRespuestas), ml + colEsc + colProm + 3, y + 5);
        y += 7;
      });
    }

    logout(): void {
      localStorage.clear();
      this.router.navigate(['/auth/selector-rol']);
    }
  }
