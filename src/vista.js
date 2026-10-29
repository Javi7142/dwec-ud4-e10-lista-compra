/**
 * Generación del HTML y los textos de la página. Funciones puras: reciben los datos (y la fecha
 * actual) y devuelven textos.
 * @module vista
 */

/** @import { Articulo } from './lista.js' */

const MS_MINUTO = 60 * 1000;
const MS_HORA = 60 * MS_MINUTO;
const MS_DIA = 24 * MS_HORA;

/** Caracteres especiales del HTML y su versión escapada. */
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Escapa los caracteres especiales del HTML.
 * @param {string} texto
 * @returns {string}
 * @example
 * escaparHTML('<b>Pan</b>'); // '&lt;b&gt;Pan&lt;/b&gt;'
 */
export function escaparHTML(texto) {
  return String(texto).replace(/[&<>"']/g, (caracter) => ESCAPES[caracter]);
}

/**
 * Cuánto hace de una fecha: «hace 5 minutos», «ayer», «ahora».
 * @param {Date} fecha
 * @param {Date} [ahora=new Date()]
 * @returns {string}
 */
export function haceCuanto(fecha, ahora = new Date()) {
  const formateador = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });
  const transcurrido = ahora - fecha;
  if (transcurrido < MS_MINUTO) {
    // Menos de un minuto (o una fecha futura): «ahora»
    return formateador.format(0, 'second');
  }
  if (transcurrido < MS_HORA) {
    return formateador.format(-Math.floor(transcurrido / MS_MINUTO), 'minute');
  }
  if (transcurrido < MS_DIA) {
    return formateador.format(-Math.floor(transcurrido / MS_HORA), 'hour');
  }
  return formateador.format(-Math.floor(transcurrido / MS_DIA), 'day');
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
  return articulos
    .map((articulo) => {
      const nombre = escaparHTML(articulo.nombre);
      const clase = articulo.comprado ? ' class="comprado"' : '';
      const marcada = articulo.comprado ? ' checked' : '';
      return (
        `<li data-id="${escaparHTML(articulo.id)}"${clase}>` +
        `<input type="checkbox" class="marcar" aria-label="Marcar ${nombre} como comprado"${marcada}>` +
        `<span class="nombre">${nombre}</span>` +
        `<span class="cantidad">× ${articulo.cantidad}</span>` +
        `<span class="cuando">${escaparHTML(haceCuanto(articulo.creado, ahora))}</span>` +
        `<button class="quitar" aria-label="Quitar ${nombre}">🗑️</button>` +
        '</li>'
      );
    })
    .join('');
}

/**
 * Título de la pestaña con el número de artículos pendientes.
 * @param {Articulo[]} articulos
 * @returns {string} Por ejemplo, «(2) Lista de la compra», o «✅ Lista de la compra» si no queda nada.
 */
export function tituloPestana(articulos) {
  const pendientes = articulos.filter((articulo) => !articulo.comprado).length;
  return pendientes > 0 ? `(${pendientes}) Lista de la compra` : '✅ Lista de la compra';
}
