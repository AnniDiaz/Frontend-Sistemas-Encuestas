# Documento de Requisitos

## Introducción

Esta funcionalidad actualiza la pantalla de reportes de la aplicación Angular (Sistema de Encuestas UNSM) para consumir el nuevo endpoint `GET /api/dashboard`. El dashboard muestra métricas de satisfacción de egresados encuestados, con filtros por encuesta y por facultad/carrera, presentando KPIs, gráficos comparativos y un ranking de calidad por preguntas.

## Glosario

- **Dashboard**: Pantalla principal de analítica que agrega indicadores clave del proceso de encuestas.
- **ReporteService**: Servicio Angular responsable de consumir los endpoints del backend de reportes.
- **ReportesComponent**: Componente Angular standalone que renderiza el dashboard de reportes.
- **KPI**: Indicador Clave de Rendimiento (Key Performance Indicator) — valor numérico o textual que resume el desempeño del sistema de encuestas.
- **Encuesta**: Instrumento de evaluación identificado por un `idEncuesta` numérico.
- **Escuela_Profesional**: Unidad académica cuyos egresados participan en las encuestas.
- **Estado_Pregunta**: Clasificación cualitativa de una pregunta según su promedio: `Bueno`, `Regular` o `Crítico`.
- **Chart**: Gráfico visual generado con Chart.js dentro del componente.
- **DashboardResponse**: Modelo TypeScript que representa la respuesta JSON del endpoint `/api/dashboard`.

---

## Requisitos

### Requisito 1: Método de consumo del endpoint de dashboard

**Historia de usuario:** Como desarrollador frontend, quiero un método dedicado en `ReporteService` que llame a `GET /api/dashboard`, para que el componente pueda obtener los datos del nuevo endpoint sin modificar la lógica de los métodos existentes.

#### Criterios de Aceptación

1. THE `ReporteService` SHALL exponer un método `obtenerDashboard(idEncuesta?: number, facultad?: string)` que realice una petición `GET` a `http://localhost:8080/api/dashboard`.
2. WHEN el parámetro `idEncuesta` es provisto, THE `ReporteService` SHALL incluirlo como query param `idEncuesta` en la URL de la petición.
3. WHEN el parámetro `facultad` es provisto y no está vacío, THE `ReporteService` SHALL incluirlo como query param `facultad` en la URL de la petición.
4. WHEN ningún parámetro opcional es provisto, THE `ReporteService` SHALL realizar la petición sin query params adicionales.
5. THE `ReporteService` SHALL retornar un `Observable<DashboardResponse>` tipado con los modelos del archivo `dashboard.model.ts`.
6. THE `ReporteService` SHALL mantener los métodos `obtenerReporteCompleto` y `obtenerReporteGlobal` sin modificaciones funcionales.

---

### Requisito 2: Modelos TypeScript del dashboard

**Historia de usuario:** Como desarrollador frontend, quiero modelos TypeScript que representen exactamente la estructura JSON del endpoint `/api/dashboard`, para que el compilador detecte inconsistencias de tipos en tiempo de desarrollo.

#### Criterios de Aceptación

1. THE `DashboardResponse` SHALL contener las propiedades `kpis`, `comparativoPorEscuela`, `distribucionSentimiento` y `rankingCalidadPreguntas`.
2. THE `DashboardKpis` SHALL contener las propiedades `totalRespuestas: number`, `egresadosEncuestados: number`, `promedioSatisfaccion: number`, `mejorEscuela: string`, `peorEscuela: string` y `tasaParticipacion: number`.
3. THE `ComparativoPorEscuela` SHALL contener las propiedades `escuelaProfesional: string`, `promedioSatisfaccion: number` y `totalRespuestas: number`.
4. THE `DistribucionSentimiento` SHALL contener las propiedades `categoria: string` y `porcentaje: number`.
5. THE `RankingCalidadPregunta` SHALL contener las propiedades `codigo: string`, `descripcion: string`, `promedio: number` y `estado: 'Bueno' | 'Regular' | 'Crítico'`.
6. THE `dashboard.model.ts` SHALL ser exportado desde `src/app/shared/models/` para ser reutilizable en cualquier componente.

---

### Requisito 3: Visualización de KPIs en tarjetas

**Historia de usuario:** Como usuario del dashboard, quiero ver los 6 KPIs del objeto `kpis` en tarjetas visuales destacadas, para identificar rápidamente el estado general de las encuestas.

#### Criterios de Aceptación

1. WHEN el `ReportesComponent` recibe la respuesta del dashboard, THE `ReportesComponent` SHALL mostrar una tarjeta para cada uno de los 6 KPIs: `totalRespuestas`, `egresadosEncuestados`, `promedioSatisfaccion`, `mejorEscuela`, `peorEscuela` y `tasaParticipacion`.
2. THE `ReportesComponent` SHALL mostrar `promedioSatisfaccion` formateado con 2 decimales como mínimo.
3. THE `ReportesComponent` SHALL mostrar `tasaParticipacion` formateado con 1 decimal seguido del símbolo `%`.
4. WHEN los campos `mejorEscuela` o `peorEscuela` estén vacíos o sean nulos, THE `ReportesComponent` SHALL mostrar el carácter `-` en su lugar.
5. THE `ReportesComponent` SHALL aplicar estilos visuales diferenciados (íconos y colores de fondo) a cada tarjeta KPI para distinguirlas visualmente.

---

### Requisito 4: Gráfico de barras comparativo por escuela

**Historia de usuario:** Como usuario del dashboard, quiero ver un gráfico de barras que compare el promedio de satisfacción y el total de respuestas por escuela profesional, para identificar diferencias entre escuelas.

#### Criterios de Aceptación

1. WHEN el array `comparativoPorEscuela` contiene al menos un elemento, THE `ReportesComponent` SHALL renderizar un gráfico de barras con `Chart.js` usando el canvas con `id="comparativoChart"`.
2. THE `ReportesComponent` SHALL usar `escuelaProfesional` como etiquetas del eje X del gráfico comparativo.
3. THE `ReportesComponent` SHALL representar `promedioSatisfaccion` y `totalRespuestas` como dos datasets distintos en el mismo gráfico.
4. WHEN el array `comparativoPorEscuela` está vacío, THE `ReportesComponent` SHALL mostrar un mensaje de estado vacío en lugar del canvas.
5. WHEN se aplica un nuevo filtro y se vuelve a cargar el dashboard, THE `ReportesComponent` SHALL destruir el gráfico anterior antes de renderizar el nuevo, para evitar instancias duplicadas de Chart.js.

---

### Requisito 5: Gráfico de dona de distribución de sentimiento

**Historia de usuario:** Como usuario del dashboard, quiero ver un gráfico de dona que muestre la distribución porcentual de categorías de satisfacción, para entender la distribución emocional de los egresados encuestados.

#### Criterios de Aceptación

1. WHEN el array `distribucionSentimiento` contiene al menos un elemento, THE `ReportesComponent` SHALL renderizar un gráfico de tipo `doughnut` con `Chart.js` usando el canvas con `id="sentimientoChart"`.
2. THE `ReportesComponent` SHALL usar `categoria` como etiquetas y `porcentaje` como valores del gráfico de sentimiento.
3. THE `ReportesComponent` SHALL mostrar tooltips formateados como `<categoria>: <porcentaje>%` al posicionar el cursor sobre cada segmento.
4. THE `ReportesComponent` SHALL asignar colores diferenciados a cada categoría: verde para "Muy Satisfecho", verde claro para "Satisfecho", amarillo para "Neutral", rojo para "Insatisfecho" y rojo oscuro para "Muy Insatisfecho".
5. WHEN el array `distribucionSentimiento` está vacío, THE `ReportesComponent` SHALL mostrar un mensaje de estado vacío en lugar del canvas.

---

### Requisito 6: Tabla de ranking de calidad por preguntas

**Historia de usuario:** Como usuario del dashboard, quiero ver una tabla con el ranking de calidad de las preguntas, con filas coloreadas según el estado, para identificar de forma rápida las preguntas con bajo desempeño.

#### Criterios de Aceptación

1. WHEN el array `rankingCalidadPreguntas` contiene al menos un elemento, THE `ReportesComponent` SHALL renderizar una tabla HTML con columnas `Código`, `Descripción`, `Promedio` y `Estado`.
2. THE `ReportesComponent` SHALL aplicar la clase CSS `estado-bueno` (fondo verde) a las filas cuyo `estado` sea `'Bueno'`.
3. THE `ReportesComponent` SHALL aplicar la clase CSS `estado-regular` (fondo amarillo) a las filas cuyo `estado` sea `'Regular'`.
4. THE `ReportesComponent` SHALL aplicar la clase CSS `estado-critico` (fondo rojo) a las filas cuyo `estado` sea `'Crítico'`.
5. THE `ReportesComponent` SHALL mostrar `promedio` formateado con 2 decimales en la columna correspondiente.
6. WHEN el array `rankingCalidadPreguntas` está vacío, THE `ReportesComponent` SHALL mostrar una fila con el mensaje "Sin datos disponibles" en lugar de filas de datos.

---

### Requisito 7: Filtros de encuesta y facultad

**Historia de usuario:** Como usuario del dashboard, quiero filtrar los datos por encuesta y por facultad/carrera, para analizar segmentos específicos de la población encuestada.

#### Criterios de Aceptación

1. THE `ReportesComponent` SHALL mantener un selector de encuesta que incluya la opción "TODAS" con valor `'ALL'` y una opción por cada encuesta disponible.
2. THE `ReportesComponent` SHALL mantener un selector de carrera/facultad que incluya la opción "Todas las escuelas" con valor vacío y una opción por cada escuela disponible.
3. WHEN el usuario cambia la encuesta seleccionada, THE `ReportesComponent` SHALL invocar automáticamente `cargarDashboard()` con el nuevo `idEncuesta`.
4. WHEN el usuario cambia la carrera seleccionada, THE `ReportesComponent` SHALL invocar automáticamente `cargarDashboard()` con el nuevo valor de `facultad`.
5. WHEN el usuario pulsa el botón "APLICAR", THE `ReportesComponent` SHALL invocar `cargarDashboard()` con los valores actuales de los filtros.
6. WHEN el filtro de encuesta es `'ALL'`, THE `ReportesComponent` SHALL omitir el parámetro `idEncuesta` en la llamada al servicio.
7. WHEN el filtro de carrera es una cadena vacía, THE `ReportesComponent` SHALL omitir el parámetro `facultad` en la llamada al servicio.

---

### Requisito 8: Indicador de carga

**Historia de usuario:** Como usuario del dashboard, quiero ver un indicador de carga mientras se obtienen los datos del backend, para saber que la aplicación está procesando mi solicitud.

#### Criterios de Aceptación

1. WHEN `ReportesComponent` inicia una llamada a `cargarDashboard()`, THE `ReportesComponent` SHALL establecer `cargando = true` y mostrar el indicador de carga.
2. WHEN la llamada al servicio se completa con éxito, THE `ReportesComponent` SHALL establecer `cargando = false` y ocultar el indicador de carga.
3. IF la llamada al servicio retorna un error, THEN THE `ReportesComponent` SHALL establecer `cargando = false`, ocultar el indicador de carga y registrar el error en consola.

---

### Requisito 9: Exportación a Excel del dashboard

**Historia de usuario:** Como usuario del dashboard, quiero descargar un archivo Excel con los datos actuales del dashboard, para compartir o archivar los resultados de las encuestas.

#### Criterios de Aceptación

1. WHEN el usuario pulsa el botón "REPORTE EXCEL", THE `ReportesComponent` SHALL generar un archivo `.xlsx` con cuatro hojas: `KPIs`, `Comparativo Escuelas`, `Sentimiento` y `Ranking Preguntas`.
2. THE `ReportesComponent` SHALL nombrar el archivo como `dashboard_reporte_<encuestaId>.xlsx`, donde `<encuestaId>` es el identificador actual o `todas` si no hay filtro.
3. IF no hay datos disponibles en `rankingCalidadPreguntas` ni en `comparativoPorEscuela`, THEN THE `ReportesComponent` SHALL mostrar una alerta indicando que no hay datos cargados y no generará el archivo.
