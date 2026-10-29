/**
 * Guardar y cargar la lista en el navegador.
 *
 * Usa la clave `lista-compra` del almacenamiento (por defecto, `localStorage`) con el JSON
 * `{ version: 1, articulos: [...] }`. Las fechas se guardan como texto ISO y se convierten
 * de nuevo en `Date` al cargar.
 *
 * @module almacen
 */

/** @import { Articulo } from './lista.js' */

export const CLAVE = 'lista-compra';
export const VERSION = 1;

/**
 * Convierte un objeto leído del JSON en un artículo, o devuelve `null` si sus datos no son válidos.
 *
 * @param {unknown} dato
 * @returns {Articulo|null}
 */
function aArticulo(dato) {
  if (dato === null || typeof dato !== 'object') {
    return null;
  }
  const { id, nombre, cantidad, comprado, creado } = /** @type {Record<string, unknown>} */ (dato);
  const fecha = new Date(/** @type {string} */ (creado));
  const valido =
    typeof id === 'string' &&
    id !== '' &&
    typeof nombre === 'string' &&
    nombre.trim() !== '' &&
    Number.isInteger(cantidad) &&
    cantidad >= 1 &&
    cantidad <= 99 &&
    typeof comprado === 'boolean' &&
    typeof creado === 'string' &&
    !Number.isNaN(fecha.getTime());
  return valido ? { id, nombre, cantidad, comprado, creado: fecha } : null;
}

/**
 * Carga la lista guardada.
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {Articulo[]} La lista, o `[]` si no hay nada, el JSON está roto o es de otra versión.
 *   Los artículos con datos incorrectos se descartan.
 */
export function cargar(almacen = globalThis.localStorage) {
  try {
    const texto = almacen.getItem(CLAVE);
    if (texto === null) {
      return [];
    }
    const datos = JSON.parse(texto);
    if (datos?.version !== VERSION || !Array.isArray(datos.articulos)) {
      return [];
    }
    return datos.articulos.map(aArticulo).filter((articulo) => articulo !== null);
  } catch {
    // JSON roto o almacenamiento que lanza un error (bloqueado, modo privado…)
    return [];
  }
}

/**
 * Guarda la lista.
 * @param {Articulo[]} articulos
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {boolean} `false` si no se ha podido guardar.
 */
export function guardar(articulos, almacen = globalThis.localStorage) {
  try {
    // JSON.stringify convierte cada Date en su texto ISO
    almacen.setItem(CLAVE, JSON.stringify({ version: VERSION, articulos }));
    return true;
  } catch {
    // Almacenamiento lleno o no disponible
    return false;
  }
}
