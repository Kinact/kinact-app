import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// Fechas ISO → español. Nunca lanza: devuelve el input si falla.
export function fmtFecha(iso, fmt = 'MMM yyyy') {
  try { return format(parseISO(iso), fmt, { locale: es }); }
  catch { return iso; }
}

export function fmtFechaCorta(iso) {
  return fmtFecha(iso, 'd MMM');
}

export function fmtFechaLarga(iso) {
  return fmtFecha(iso, "d 'de' MMMM");
}

// Capitaliza solo la primera letra (evita el textTransform:capitalize que
// capitaliza cada palabra, incluyendo "de", "abril", etc.)
export function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// Segundos → mm:ss
export function formatTime(seg) {
  return Math.floor(seg / 60).toString().padStart(2, '0') +
         ':' +
         (seg % 60).toString().padStart(2, '0');
}

// Fecha de hoy en español con primera letra en mayúscula
export function fechaHoyLarga() {
  const s = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  return capitalize(s);
}
