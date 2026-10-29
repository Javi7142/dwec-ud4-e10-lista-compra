/**
 * Confirmaciones con <dialog> y avisos que no interrumpen. Solo usa el DOM de la página:
 * `#confirmar` (con su `.pregunta`) y `#avisos`. No guarda nada.
 * @module dialogos
 */

const dialogo = document.querySelector('#confirmar');
const textoPregunta = dialogo.querySelector('.pregunta');
const zonaAvisos = document.querySelector('#avisos');

let temporizadorAviso = null;
// Oyente de cierre de la última vez: se quita antes de poner otro, para que nunca se acumulen
let alCerrar = null;

/**
 * Pide confirmación con un diálogo modal.
 *
 * @param {string} pregunta Texto de la pregunta (se escribe con `textContent`: lleva texto del usuario).
 * @param {(acepta: boolean) => void} alResponder Se llama con `true` si se pulsa Aceptar y con
 *   `false` si se pulsa Cancelar o `Esc`.
 * @returns {void}
 * @example
 * confirmar('¿Quitar «Pan»?', (acepta) => { if (acepta) quitarPan(); });
 */
export function confirmar(pregunta, alResponder) {
  textoPregunta.textContent = pregunta;
  // returnValue conserva el valor de la última vez: se borra para que Esc no cuente como Aceptar
  dialogo.returnValue = '';
  dialogo.removeEventListener('close', alCerrar);
  alCerrar = () => alResponder(dialogo.returnValue === 'si');
  dialogo.addEventListener('close', alCerrar, { once: true });
  dialogo.showModal();
}

/**
 * Muestra un aviso en la zona de avisos (`role="status"`, que los lectores de pantalla anuncian
 * sin interrumpir) y lo borra pasado un tiempo.
 *
 * @param {string} texto Texto del aviso (se escribe con `textContent`).
 * @param {number} [duracion=3000] Milisegundos que se muestra.
 * @returns {void}
 */
export function avisar(texto, duracion = 3000) {
  zonaAvisos.textContent = texto;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => {
    zonaAvisos.textContent = '';
  }, duracion);
}
