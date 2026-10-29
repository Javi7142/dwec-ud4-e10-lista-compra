import { describe, it, expect } from 'vitest';
import { escaparHTML, haceCuanto, htmlLista, tituloPestana } from '../src/vista.js';

const AHORA = new Date('2025-03-15T12:00:00');
const hace = (ms) => new Date(AHORA.getTime() - ms);
const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;
const articulo = (datos) => ({
  id: 'a1',
  nombre: 'Pan',
  cantidad: 2,
  comprado: false,
  creado: hace(5 * MINUTO),
  ...datos,
});

describe('escaparHTML', () => {
  it('escapa los cinco caracteres especiales', () => {
    expect(escaparHTML(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&#39;');
  });

  it('escapa un nombre con etiquetas', () => {
    expect(escaparHTML('<b>Pan</b>')).toBe('&lt;b&gt;Pan&lt;/b&gt;');
  });

  it('escapa primero el & (no escapa dos veces)', () => {
    expect(escaparHTML('&lt;')).toBe('&amp;lt;');
  });

  it('no cambia un texto sin caracteres especiales, con tildes y emoji', () => {
    expect(escaparHTML('Café ñandú 🍞')).toBe('Café ñandú 🍞');
  });

  it('devuelve una cadena vacía con una cadena vacía', () => {
    expect(escaparHTML('')).toBe('');
  });

  it('convierte en texto lo que no lo es', () => {
    expect(escaparHTML(42)).toBe('42');
  });
});

describe('haceCuanto', () => {
  it.each([
    [0, 'ahora'],
    [30 * 1000, 'ahora'],
    [59 * 1000 + 999, 'ahora'],
    [MINUTO, 'hace 1 minuto'],
    [5 * MINUTO, 'hace 5 minutos'],
    [59 * MINUTO, 'hace 59 minutos'],
    [HORA - 1, 'hace 59 minutos'],
    [HORA, 'hace 1 hora'],
    [2 * HORA, 'hace 2 horas'],
    [23 * HORA + 59 * MINUTO, 'hace 23 horas'],
    [DIA, 'ayer'],
    [DIA + 5 * HORA, 'ayer'],
    [2 * DIA, 'anteayer'],
    [3 * DIA, 'hace 3 días'],
    [40 * DIA, 'hace 40 días'],
  ])('con %i ms de diferencia dice «%s»', (diferencia, esperado) => {
    expect(haceCuanto(hace(diferencia), AHORA)).toBe(esperado);
  });

  it('dice «ahora» con una fecha futura', () => {
    expect(haceCuanto(new Date(AHORA.getTime() + HORA), AHORA)).toBe('ahora');
  });

  it('usa la fecha actual por defecto', () => {
    expect(haceCuanto(new Date())).toBe('ahora');
  });
});

describe('htmlLista', () => {
  it('devuelve una cadena vacía con la lista vacía', () => {
    expect(htmlLista([], AHORA)).toBe('');
  });

  it('genera un <li data-id> por artículo, en el orden recibido', () => {
    const html = htmlLista([articulo({ id: 'x' }), articulo({ id: 'y' })], AHORA);
    expect(html.match(/<li /g)).toHaveLength(2);
    expect(html.indexOf('data-id="x"')).toBeLessThan(html.indexOf('data-id="y"'));
  });

  it('incluye la casilla .marcar, el nombre, la cantidad, cuándo se añadió y el botón .quitar', () => {
    const html = htmlLista([articulo({})], AHORA);
    expect(html).toContain('class="marcar"');
    expect(html).toContain('<span class="nombre">Pan</span>');
    expect(html).toContain('× 2');
    expect(html).toContain('hace 5 minutos');
    expect(html).toContain('class="quitar"');
  });

  it('un artículo pendiente no lleva la clase comprado ni la casilla marcada', () => {
    const html = htmlLista([articulo({})], AHORA);
    expect(html).not.toContain('class="comprado"');
    expect(html).not.toContain('checked');
  });

  it('un artículo comprado lleva la clase comprado y la casilla marcada', () => {
    const html = htmlLista([articulo({ comprado: true })], AHORA);
    expect(html).toContain('class="comprado"');
    expect(html).toContain('checked');
  });

  it('escapa un nombre con etiquetas: no se genera ninguna etiqueta nueva', () => {
    const html = htmlLista([articulo({ nombre: '<img src=x onerror=alert(1)>' })], AHORA);
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
  });

  it('escapa las comillas del nombre y del id, que van dentro de atributos', () => {
    const html = htmlLista([articulo({ id: '"><script>', nombre: 'x" onclick="malo' })], AHORA);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('" onclick="');
    expect(html).toContain('data-id="&quot;&gt;&lt;script&gt;"');
  });

  it('usa la fecha actual por defecto para el «hace X»', () => {
    expect(htmlLista([articulo({ creado: new Date() })])).toContain('ahora');
  });
});

describe('tituloPestana', () => {
  it('cuenta los pendientes entre paréntesis', () => {
    const lista = [articulo({}), articulo({ id: 'b' }), articulo({ id: 'c', comprado: true })];
    expect(tituloPestana(lista)).toBe('(2) Lista de la compra');
  });

  it('con un solo pendiente dice (1)', () => {
    expect(tituloPestana([articulo({})])).toBe('(1) Lista de la compra');
  });

  it('con todo comprado muestra la marca de verificación', () => {
    expect(tituloPestana([articulo({ comprado: true })])).toBe('✅ Lista de la compra');
  });

  it('con la lista vacía también muestra la marca de verificación', () => {
    expect(tituloPestana([])).toBe('✅ Lista de la compra');
  });
});
