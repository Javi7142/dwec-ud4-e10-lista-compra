// E10 · Lista de la compra: une los módulos y gestiona la página
import { anadir, alternarComprado, quitar, quitarComprados, ordenar, resumen } from './lista.js';
import { cargar, guardar } from './almacen.js';
import { htmlLista, tituloPestana } from './vista.js';
import { enlaceCompartir, leerCompartidos } from './compartir.js';
import { confirmar, avisar } from './dialogos.js';
import { avisarCambio, escucharCambios } from './sincronizar.js';

const formulario = document.querySelector('#formulario');
const campoNombre = document.querySelector('#nombre');
const campoCantidad = document.querySelector('#cantidad');
const textoResumen = document.querySelector('#resumen');
const lista = document.querySelector('#lista');
const botonTema = document.querySelector('#cambiar-tema');

// El estado de la página: la lista actual (se sustituye por una nueva en cada cambio)
let articulos = cargar();

/**
 * Pinta la lista (con una sola asignación a innerHTML), el resumen y el título de la pestaña.
 */
function pintar() {
  lista.innerHTML = htmlLista(ordenar(articulos), new Date());
  textoResumen.textContent = resumen(articulos);
  document.title = tituloPestana(articulos);
}

/**
 * Cada cambio: se actualiza el estado, se guarda (avisando si no se puede), se avisa a las otras
 * pestañas y se repinta.
 *
 * @param {import('./lista.js').Articulo[]} nuevos
 */
function cambiar(nuevos) {
  articulos = nuevos;
  if (!guardar(articulos)) {
    avisar('⚠️ No se ha podido guardar la lista en este navegador', 5000);
  }
  avisarCambio();
  pintar();
}

// Añadir: preventDefault evita que la página se recargue; los errores se muestran como aviso
formulario.addEventListener('submit', (evento) => {
  evento.preventDefault();
  try {
    cambiar(anadir(articulos, campoNombre.value, Number(campoCantidad.value)));
    campoNombre.value = '';
    campoCantidad.value = '1';
    campoNombre.focus();
  } catch (error) {
    avisar(`❌ ${error.message}`);
  }
});

// Un solo oyente para toda la lista (delegación de eventos): la casilla y el botón de quitar
lista.addEventListener('click', (evento) => {
  const elemento = evento.target.closest('li');
  const id = elemento?.dataset.id;
  if (!id) {
    return;
  }
  if (evento.target.matches('.marcar')) {
    cambiar(alternarComprado(articulos, id));
  } else if (evento.target.matches('.quitar')) {
    const nombre = elemento.querySelector('.nombre').textContent;
    confirmar(`¿Quitar «${nombre}»?`, (acepta) => {
      if (acepta) {
        cambiar(quitar(articulos, id));
      }
    });
  }
});

document.querySelector('#vaciar-comprados').addEventListener('click', () => {
  const comprados = articulos.filter((articulo) => articulo.comprado).length;
  if (comprados === 0) {
    avisar('No hay artículos comprados que quitar');
    return;
  }
  const texto = comprados === 1 ? '1 artículo comprado' : `${comprados} artículos comprados`;
  confirmar(`¿Quitar ${texto}?`, (acepta) => {
    if (acepta) {
      cambiar(quitarComprados(articulos));
    }
  });
});

// Compartir: copia el enlace con el portapapeles (si existe) o lo muestra en un aviso
document.querySelector('#compartir').addEventListener('click', () => {
  if (!articulos.some((articulo) => !articulo.comprado)) {
    avisar('No hay artículos pendientes que compartir');
    return;
  }
  const enlace = enlaceCompartir(location.origin + location.pathname, articulos);
  const mostrar = () => avisar(`🔗 ${enlace}`, 15000);
  if ('clipboard' in navigator) {
    navigator.clipboard
      .writeText(enlace)
      .then(() => avisar('🔗 Enlace copiado al portapapeles'))
      .catch(mostrar);
  } else {
    mostrar();
  }
});

// Otra pestaña ha cambiado la lista: se vuelve a cargar y pintar
escucharCambios(() => {
  articulos = cargar();
  pintar();
});

// Tema: el del sistema, con un botón para cambiarlo (con data-tema, sin estilos en JavaScript)
const sistemaOscuro = matchMedia('(prefers-color-scheme: dark)');
let temaElegido = false;

/**
 * Aplica un tema cambiando `data-tema` de `<html>` y pone en el botón el tema al que cambiará.
 *
 * @param {'claro'|'oscuro'} tema
 */
function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  botonTema.textContent = tema === 'oscuro' ? '☀️ Claro' : '🌙 Oscuro';
}

aplicarTema(sistemaOscuro.matches ? 'oscuro' : 'claro');
sistemaOscuro.addEventListener('change', (evento) => {
  if (!temaElegido) {
    aplicarTema(evento.matches ? 'oscuro' : 'claro');
  }
});
botonTema.addEventListener('click', () => {
  temaElegido = true;
  aplicarTema(document.documentElement.dataset.tema === 'oscuro' ? 'claro' : 'oscuro');
});

// Enlace compartido (?compartir=…): se añaden los artículos y se limpia la URL para que
// recargar la página no los añada otra vez
const compartidos = leerCompartidos(location.search);
if (compartidos.length > 0) {
  const nuevos = compartidos.reduce(
    (resultado, { nombre, cantidad }) => anadir(resultado, nombre, cantidad),
    articulos,
  );
  cambiar(nuevos);
  avisar(
    `📥 Se ${compartidos.length === 1 ? 'ha añadido 1 artículo' : `han añadido ${compartidos.length} artículos`} del enlace`,
  );
  const url = new URL(location.href);
  url.searchParams.delete('compartir');
  history.replaceState(null, '', url);
} else {
  pintar();
}

// Los textos «hace X minutos» se actualizan cada minuto
setInterval(pintar, 60 * 1000);
