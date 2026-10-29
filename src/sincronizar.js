/**
 * Mantiene sincronizadas las pestañas abiertas con la lista.
 *
 * Usa un `BroadcastChannel` llamado `lista-compra`: una pestaña avisa y las demás reciben el
 * mensaje (la que avisa no lo recibe). Si el navegador no tiene `BroadcastChannel`, se usa el
 * evento `storage`, que el navegador lanza en las **otras** pestañas cuando una cambia la clave
 * `lista-compra` de `localStorage`. No guarda nada por sí mismo.
 *
 * @module sincronizar
 */
import { CLAVE } from './almacen.js';

// Detección de capacidades: ¿existe BroadcastChannel en este navegador?
const canal = 'BroadcastChannel' in globalThis ? new BroadcastChannel('lista-compra') : null;

/**
 * Avisa a las otras pestañas de que la lista ha cambiado.
 * Sin `BroadcastChannel` no hace falta hacer nada: guardar en `localStorage` ya dispara `storage`.
 *
 * @returns {void}
 */
export function avisarCambio() {
  canal?.postMessage('cambio');
}

/**
 * Llama a `alCambiar` cada vez que otra pestaña cambia la lista.
 *
 * @param {() => void} alCambiar
 * @returns {void}
 */
export function escucharCambios(alCambiar) {
  if (canal !== null) {
    canal.addEventListener('message', () => alCambiar());
  } else {
    addEventListener('storage', (evento) => {
      if (evento.key === CLAVE) {
        alCambiar();
      }
    });
  }
}
