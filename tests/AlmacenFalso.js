/** Almacenamiento en memoria con la misma interfaz que localStorage, para los tests. */
export class AlmacenFalso {
  #datos = new Map();

  getItem(clave) {
    return this.#datos.has(clave) ? this.#datos.get(clave) : null;
  }

  setItem(clave, valor) {
    this.#datos.set(clave, String(valor));
  }

  removeItem(clave) {
    this.#datos.delete(clave);
  }

  clear() {
    this.#datos.clear();
  }
}
