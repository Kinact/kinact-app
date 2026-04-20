// Paleta unificada de tableros. Usar en lugar de redefinir TABLERO_COLORS en cada vista.

// Versión suave (fondos y texto con contraste bajo) — para tarjetas claras
export const TABLERO_COLORS = {
  casa:  { bg: '#dbeafe', text: '#1d4ed8', border: '#2563eb' },
  barco: { bg: '#dcfce7', text: '#166534', border: '#16a34a' },
  flor:  { bg: '#fef3c7', text: '#92400e', border: '#d97706' },
  cafe:  { bg: '#fee2e2', text: '#991b1b', border: '#dc2626' }
};

// Versión invertida (fondo oscuro, texto claro) — para contextos sobre #1a1a1a
export const TABLERO_COLORS_DARK = {
  casa:  { bg: '#1e40af', text: '#bfdbfe' },
  barco: { bg: '#166534', text: '#86efac' },
  flor:  { bg: '#92400e', text: '#fcd34d' },
  cafe:  { bg: '#7f1d1d', text: '#fca5a5' }
};
