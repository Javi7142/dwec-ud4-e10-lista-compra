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
 * Carga la lista guardada.
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {Articulo[]} La lista, o `[]` si no hay nada, el JSON está roto o es de otra versión.
 *   Los artículos con datos incorrectos se descartan.
 */
export function cargar(almacen = globalThis.localStorage) {
  // TODO
}

/**
 * Guarda la lista.
 * @param {Articulo[]} articulos
 * @param {Storage} [almacen=globalThis.localStorage]
 * @returns {boolean} `false` si no se ha podido guardar.
 */
export function guardar(articulos, almacen = globalThis.localStorage) {
  // TODO
}
