/**
 * Compartir la lista por URL: `?compartir=leche*2,pan`.
 * @module compartir
 */

/** @import { Articulo } from './lista.js' */

/**
 * Enlace con los artículos pendientes en el parámetro `compartir`.
 * @param {string} base URL de la página, sin parámetros.
 * @param {Articulo[]} articulos
 * @returns {string}
 */
export function enlaceCompartir(base, articulos) {
  // TODO
}

/**
 * Lee los artículos de un enlace compartido.
 * @param {string} busqueda Parte `search` de la URL.
 * @returns {Array<{ nombre: string, cantidad: number }>} Vacío si no hay parámetro.
 */
export function leerCompartidos(busqueda) {
  // TODO
}
