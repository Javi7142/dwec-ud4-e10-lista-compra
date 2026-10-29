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

/** Cantidad máxima de un artículo. */
const MAXIMO = 99;

/**
 * Comparador de textos en español que no distingue mayúsculas ni tildes (`Café` = `CAFE`).
 * `sensitivity: 'base'` solo distingue las letras base, y se usa tanto para comparar como para ordenar.
 */
const comparador = new Intl.Collator('es', { sensitivity: 'base' });

/** Reglas de plural del español, para «artículo(s)» y «comprado(s)». */
const plurales = new Intl.PluralRules('es');

/**
 * Identificador nuevo para un artículo.
 *
 * @returns {string}
 */
function nuevoId() {
  return globalThis.crypto.randomUUID();
}

/**
 * Añade un artículo. Si ya hay uno con el mismo nombre (sin distinguir mayúsculas ni tildes),
 * suma la cantidad (hasta 99) y lo marca como pendiente.
 *
 * @param {Articulo[]} articulos
 * @param {string} nombre
 * @param {number} [cantidad=1]
 * @param {Date} [ahora=new Date()]
 * @returns {Articulo[]}
 * @throws {Error} Si el nombre está vacío.
 * @throws {RangeError} Si la cantidad no es un entero entre 1 y 99.
 * @example
 * anadir([], '  Café ', 2); // [{ id: '…', nombre: 'Café', cantidad: 2, comprado: false, creado: Date }]
 */
export function anadir(articulos, nombre, cantidad = 1, ahora = new Date()) {
  const limpio = nombre.trim();
  if (limpio === '') {
    throw new Error('El nombre no puede estar vacío');
  }
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAXIMO) {
    throw new RangeError(`Cantidad no válida: ${cantidad}`);
  }

  const existente = articulos.find((articulo) => comparador.compare(articulo.nombre, limpio) === 0);
  if (existente === undefined) {
    return [
      ...articulos,
      { id: nuevoId(), nombre: limpio, cantidad, comprado: false, creado: ahora },
    ];
  }
  // Ya estaba: se suma (con tope) y vuelve a estar pendiente, en un objeto nuevo
  return articulos.map((articulo) =>
    articulo === existente
      ? { ...articulo, cantidad: Math.min(MAXIMO, articulo.cantidad + cantidad), comprado: false }
      : articulo,
  );
}

/**
 * Marca o desmarca un artículo como comprado.
 * @param {Articulo[]} articulos
 * @param {string} id
 * @returns {Articulo[]}
 */
export function alternarComprado(articulos, id) {
  return articulos.map((articulo) =>
    articulo.id === id ? { ...articulo, comprado: !articulo.comprado } : articulo,
  );
}

/**
 * Quita un artículo.
 * @param {Articulo[]} articulos
 * @param {string} id
 * @returns {Articulo[]}
 */
export function quitar(articulos, id) {
  return articulos.filter((articulo) => articulo.id !== id);
}

/**
 * Quita todos los artículos comprados.
 * @param {Articulo[]} articulos
 * @returns {Articulo[]}
 */
export function quitarComprados(articulos) {
  return articulos.filter((articulo) => !articulo.comprado);
}

/**
 * Ordena: primero los pendientes y, dentro de cada grupo, por nombre según las reglas del español.
 * @param {Articulo[]} articulos
 * @returns {Articulo[]}
 */
export function ordenar(articulos) {
  // toSorted ordena una copia: la lista recibida no cambia
  return articulos.toSorted(
    (a, b) => Number(a.comprado) - Number(b.comprado) || comparador.compare(a.nombre, b.nombre),
  );
}

/**
 * Resumen de la lista: «3 artículos · 1 comprado», «1 artículo · 0 comprados» o «La lista está vacía».
 * @param {Articulo[]} articulos
 * @returns {string}
 */
export function resumen(articulos) {
  if (articulos.length === 0) {
    return 'La lista está vacía';
  }
  const comprados = articulos.filter((articulo) => articulo.comprado).length;
  const palabraArticulos = plurales.select(articulos.length) === 'one' ? 'artículo' : 'artículos';
  const palabraComprados = plurales.select(comprados) === 'one' ? 'comprado' : 'comprados';
  return `${articulos.length} ${palabraArticulos} · ${comprados} ${palabraComprados}`;
}
