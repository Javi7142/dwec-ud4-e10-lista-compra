/**
 * Compartir la lista por URL: `?compartir=leche*2,pan`.
 * @module compartir
 */

/** @import { Articulo } from './lista.js' */

/**
 * Enlace con los artículos pendientes en el parámetro `compartir`: `nombre*cantidad`, separados
 * por comas. Si no hay pendientes, el enlace no lleva parámetro.
 *
 * @param {string} base URL de la página, sin parámetros.
 * @param {Articulo[]} articulos
 * @returns {string}
 * @example
 * enlaceCompartir('http://localhost:3410/', [{ nombre: 'Café & té', cantidad: 2, comprado: false }]);
 * // 'http://localhost:3410/?compartir=Caf%C3%A9+%26+t%C3%A9*2'
 */
export function enlaceCompartir(base, articulos) {
  const pendientes = articulos
    .filter((articulo) => !articulo.comprado)
    // Una coma o un asterisco en el nombre rompería el formato: se cambian por un espacio
    .map((articulo) => `${articulo.nombre.replace(/[,*]/g, ' ')}*${articulo.cantidad}`);
  const url = new URL(base);
  if (pendientes.length > 0) {
    // searchParams codifica por nosotros las tildes, los espacios y el & del nombre
    url.searchParams.set('compartir', pendientes.join(','));
  }
  return url.href;
}

/**
 * Lee los artículos de un enlace compartido. Los trozos sin nombre o con una cantidad que no es
 * un entero entre 1 y 99 se ignoran; sin cantidad, es 1.
 *
 * @param {string} busqueda Parte `search` de la URL.
 * @returns {Array<{ nombre: string, cantidad: number }>} Vacío si no hay parámetro.
 * @example
 * leerCompartidos('?compartir=pan,leche*3,,agua*0'); // [{ nombre: 'pan', cantidad: 1 }, { nombre: 'leche', cantidad: 3 }]
 */
export function leerCompartidos(busqueda) {
  const valor = new URLSearchParams(busqueda).get('compartir');
  if (valor === null || valor === '') {
    return [];
  }
  return valor
    .split(',')
    .map((trozo) => {
      const posicion = trozo.lastIndexOf('*');
      const nombre = (posicion === -1 ? trozo : trozo.slice(0, posicion)).trim();
      // Number convierte el texto entero: «3x» o «» no son cantidades válidas
      const cantidad = posicion === -1 ? 1 : Number(trozo.slice(posicion + 1));
      return { nombre, cantidad };
    })
    .filter(
      ({ nombre, cantidad }) =>
        nombre !== '' && Number.isInteger(cantidad) && cantidad >= 1 && cantidad <= 99,
    );
}
