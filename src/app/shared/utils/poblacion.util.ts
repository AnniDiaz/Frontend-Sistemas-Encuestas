export function obtenerPoblacionEncuesta(encuesta: any): string {
  const nombre = (encuesta?.nombre || '').toLowerCase();
  const id = Number(encuesta?.idEncuesta);
  const cargo = (encuesta?.cargo || '').toLowerCase();

  // Empleador / Empresa (ID29)
  if (
    cargo === 'empleador' ||
    cargo === 'empresa' ||
    nombre.includes('empleador') ||
    nombre.includes('empresa') ||
    id === 29
  ) {
    return 'Representantes de organizaciones (públicas o privadas) donde laboran egresados del programa.';
  }

  // ID20: Calidad y Empleabilidad
  if (
    nombre.includes('id20') ||
    nombre.includes('id 20') ||
    id === 20 ||
    (nombre.includes('calidad') && nombre.includes('empleabilidad'))
  ) {
    return 'Egresados del programa con al menos un año de egreso.';
  }

  // ID21: Servicios Administrativos
  if (
    nombre.includes('id21') ||
    nombre.includes('id 21') ||
    id === 21 ||
    nombre.includes('servicio') ||
    nombre.includes('trámite') ||
    nombre.includes('tramite')
  ) {
    return 'Egresados y bachilleres que han iniciado o culminado trámites administrativos en el último año.';
  }

  // ID22: Calidad de Enseñanza Retrospectiva
  if (
    nombre.includes('id22') ||
    nombre.includes('id 22') ||
    id === 22 ||
    nombre.includes('enseñanza') ||
    nombre.includes('ensenanza')
  ) {
    return 'Egresados y graduados de los últimos 5 años.';
  }

  // ID23: Bienestar Retrospectivo
  if (
    nombre.includes('id23') ||
    nombre.includes('id 23') ||
    id === 23 ||
    nombre.includes('bienestar')
  ) {
    return 'Egresados del programa de estudios de los últimos 5 años.';
  }

  // ID24: Apoyo Estudiantil
  if (
    nombre.includes('id24') ||
    nombre.includes('id 24') ||
    id === 24 ||
    nombre.includes('apoyo') ||
    nombre.includes('tutor')
  ) {
    return 'Egresados y graduados de los últimos 5 años.';
  }

  // ID26: Empleabilidad Temprana / Trayectoria Laboral
  if (
    nombre.includes('id26') ||
    nombre.includes('id 26') ||
    id === 26 ||
    nombre.includes('temprana') ||
    nombre.includes('trayectoria')
  ) {
    return 'Egresados de los últimos 2 a 3 años.';
  }

  // ID27: Pertinencia Laboral
  if (
    nombre.includes('id27') ||
    nombre.includes('id 27') ||
    id === 27 ||
    nombre.includes('pertinencia')
  ) {
    return 'Egresados y graduados de los últimos 2 a 5 años.';
  }

  // ID28: Eficiencia Terminal de Titulación
  if (
    nombre.includes('id28') ||
    nombre.includes('id 28') ||
    id === 28 ||
    nombre.includes('titulaci')
  ) {
    return 'Cohortes que tengan al menos 2 años de haber egresado.';
  }

  return 'Egresados del programa de estudios.';
}
