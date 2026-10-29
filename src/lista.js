/**
 * Operaciones sobre la lista de la compra. Funciones puras: reciben la lista y devuelven una nueva,
 * sin modificar la recibida.
 * @module lista
 */

/**
 * Artículo de la lista.
 * @typedef {object} Articulo
 * @property {string} id
 * @property {string} nombre
 * @property {number} cantidad Entero mayor que 0.
 * @property {boolean} comprado
 * @property {Date} creado
 */

/**
 * Añade un artículo. Si ya hay uno con el mismo nombre (sin distinguir mayúsculas ni tildes),
 * suma la cantidad y lo marca como pendiente.
 *
 * @param {Articulo[]} articulos
 * @param {string} nombre
 * @param {number} [cantidad=1]
 * @param {Date} [ahora=new Date()]
 * @returns {Articulo[]}
 * @throws {Error} Si el nombre está vacío.
 * @throws {RangeError} Si la cantidad no es un entero entre 1 y 99.
 */
export function anadir(articulos, nombre, cantidad = 1, ahora = new Date()) {
  // TODO
}

/**
 * Marca o desmarca un artículo como comprado.
 * @param {Articulo[]} articulos
 * @param {string} id
 * @returns {Articulo[]}
 */
export function alternarComprado(articulos, id) {
  // TODO
}

/**
 * Quita un artículo.
 * @param {Articulo[]} articulos
 * @param {string} id
 * @returns {Articulo[]}
 */
export function quitar(articulos, id) {
  // TODO
}

/**
 * Quita todos los artículos comprados.
 * @param {Articulo[]} articulos
 * @returns {Articulo[]}
 */
export function quitarComprados(articulos) {
  // TODO
}

/**
 * Ordena: primero los pendientes y, dentro de cada grupo, por nombre según las reglas del español.
 * @param {Articulo[]} articulos
 * @returns {Articulo[]}
 */
export function ordenar(articulos) {
  // TODO
}

/**
 * Resumen de la lista: «3 artículos · 1 comprado», «1 artículo · 0 comprados» o «La lista está vacía».
 * @param {Articulo[]} articulos
 * @returns {string}
 */
export function resumen(articulos) {
  // TODO
}
