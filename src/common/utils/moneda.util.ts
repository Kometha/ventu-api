/**
 * Normaliza el codigo de moneda a un solo caracter, que es lo que admite la
 * columna `moneda character(1)` de la tabla contratos.
 *
 * El frontend puede enviar codigos ISO ("HNL", "USD") o el simbolo directo
 * ("L", "$"). Esta funcion los unifica:
 *   HNL / LPS / L  -> 'L'
 *   USD / US  / $  -> '$'
 * Cualquier otro valor toma su primer caracter; si viene vacio, default 'L'.
 */
export function normalizeMoneda(value?: string | null): string {
  const raw = (value ?? '').trim().toUpperCase();
  if (!raw) return 'L';

  switch (raw) {
    case 'HNL':
    case 'LPS':
    case 'L':
      return 'L';
    case 'USD':
    case 'US':
    case '$':
      return '$';
    default:
      return raw.charAt(0);
  }
}
