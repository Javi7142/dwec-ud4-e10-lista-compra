/**
 * Generación del HTML y los textos de la página. Funciones puras: reciben los datos (y la fecha
 * actual) y devuelven textos.
 * @module vista
 */

/** @import { Articulo } from './lista.js' */

/**
 * Escapa los caracteres especiales del HTML.
 * @param {string} texto
 * @returns {string}
 */
export function escaparHTML(texto) {
  // TODO
}

/**
 * Cuánto hace de una fecha: «hace 5 minutos», «ayer», «ahora».
 * @param {Date} fecha
 * @param {Date} [ahora=new Date()]
 * @returns {string}
 */
export function haceCuanto(fecha, ahora = new Date()) {
  // TODO
}

/**
 * HTML de la lista: un `<li>` por artículo con su casilla, su nombre escapado, la cantidad,
 * cuándo se añadió y un botón para quitarlo.
 *
 * @param {Articulo[]} articulos Ya ordenados.
 * @param {Date} [ahora=new Date()]
 * @returns {string}
 */
export function htmlLista(articulos, ahora = new Date()) {
  // TODO
}

/**
 * Título de la pestaña con el número de artículos pendientes.
 * @param {Articulo[]} articulos
 * @returns {string} Por ejemplo, «(2) Lista de la compra», o «✅ Lista de la compra» si no queda nada.
 */
export function tituloPestana(articulos) {
  // TODO
}
