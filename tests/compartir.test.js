import { describe, it, expect } from 'vitest';
import { enlaceCompartir, leerCompartidos } from '../src/compartir.js';

const BASE = 'http://localhost:3410/';
const articulo = (datos) => ({ id: 'x', nombre: 'Pan', cantidad: 1, comprado: false, ...datos });

describe('enlaceCompartir', () => {
  it('pone los pendientes en el parámetro compartir como nombre*cantidad, separados por comas (que searchParams codifica como %2C)', () => {
    const lista = [articulo({ nombre: 'Leche', cantidad: 3 }), articulo({ nombre: 'Pan' })];
    expect(enlaceCompartir(BASE, lista)).toBe('http://localhost:3410/?compartir=Leche*3%2CPan*1');
  });

  it('codifica las tildes, los espacios y el & del nombre', () => {
    const lista = [articulo({ nombre: 'Café & té', cantidad: 2 })];
    expect(enlaceCompartir(BASE, lista)).toBe(
      'http://localhost:3410/?compartir=Caf%C3%A9+%26+t%C3%A9*2',
    );
  });

  it('deja fuera los artículos comprados', () => {
    const lista = [articulo({ nombre: 'Pan', comprado: true }), articulo({ nombre: 'Leche' })];
    expect(enlaceCompartir(BASE, lista)).toBe('http://localhost:3410/?compartir=Leche*1');
  });

  it('con la lista vacía o sin pendientes devuelve la base sin parámetro', () => {
    expect(enlaceCompartir(BASE, [])).toBe(BASE);
    expect(enlaceCompartir(BASE, [articulo({ comprado: true })])).toBe(BASE);
  });

  it('cambia por un espacio las comas y los asteriscos del nombre, que romperían el formato', () => {
    const enlace = enlaceCompartir(BASE, [articulo({ nombre: 'sal, gruesa*fina', cantidad: 2 })]);
    expect(leerCompartidos(new URL(enlace).search)).toEqual([
      { nombre: 'sal  gruesa fina', cantidad: 2 },
    ]);
  });

  it('respeta otros parámetros de la base cambiando solo compartir', () => {
    const enlace = enlaceCompartir(`${BASE}?tema=oscuro`, [articulo({ nombre: 'Pan' })]);
    expect(enlace).toBe('http://localhost:3410/?tema=oscuro&compartir=Pan*1');
  });

  it('lanza un error si la base no es una URL válida', () => {
    expect(() => enlaceCompartir('esto no es una url', [articulo({})])).toThrow(TypeError);
  });
});

describe('leerCompartidos', () => {
  it('lee nombre*cantidad separados por comas', () => {
    expect(leerCompartidos('?compartir=leche*3,pan*2')).toEqual([
      { nombre: 'leche', cantidad: 3 },
      { nombre: 'pan', cantidad: 2 },
    ]);
  });

  it('sin cantidad, es 1', () => {
    expect(leerCompartidos('?compartir=pan')).toEqual([{ nombre: 'pan', cantidad: 1 }]);
  });

  it('ignora los trozos vacíos y las cantidades que no son válidas', () => {
    expect(leerCompartidos('?compartir=pan,leche*3,,agua*0')).toEqual([
      { nombre: 'pan', cantidad: 1 },
      { nombre: 'leche', cantidad: 3 },
    ]);
  });

  it.each([['*0'], ['*100'], ['*-2'], ['*1.5'], ['*abc'], ['*'], ['*3x']])(
    'descarta una cantidad no válida como «pan%s»',
    (sufijo) => {
      expect(leerCompartidos(`?compartir=pan${sufijo}`)).toEqual([]);
    },
  );

  it('acepta las cantidades límite 1 y 99', () => {
    expect(leerCompartidos('?compartir=a*1,b*99')).toHaveLength(2);
  });

  it('ignora un trozo sin nombre, como «*3»', () => {
    expect(leerCompartidos('?compartir=*3')).toEqual([]);
  });

  it('devuelve [] si no hay parámetro compartir o está vacío', () => {
    expect(leerCompartidos('')).toEqual([]);
    expect(leerCompartidos('?otro=1')).toEqual([]);
    expect(leerCompartidos('?compartir=')).toEqual([]);
  });

  it('decodifica las tildes, el + y el %26 de un enlace generado', () => {
    expect(leerCompartidos('?compartir=Caf%C3%A9+%26+t%C3%A9*2')).toEqual([
      { nombre: 'Café & té', cantidad: 2 },
    ]);
  });

  it('quita los espacios de los extremos de cada nombre', () => {
    expect(leerCompartidos('?compartir=%20pan%20*2')).toEqual([{ nombre: 'pan', cantidad: 2 }]);
  });

  it('es la inversa de enlaceCompartir para los artículos pendientes', () => {
    const lista = [
      articulo({ nombre: 'Café & té', cantidad: 2 }),
      articulo({ nombre: 'Ñoquis', cantidad: 99 }),
      articulo({ nombre: 'Pan', comprado: true }),
    ];
    const enlace = enlaceCompartir(BASE, lista);
    expect(leerCompartidos(new URL(enlace).search)).toEqual([
      { nombre: 'Café & té', cantidad: 2 },
      { nombre: 'Ñoquis', cantidad: 99 },
    ]);
  });
});
