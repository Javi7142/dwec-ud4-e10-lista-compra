import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  anadir,
  alternarComprado,
  quitar,
  quitarComprados,
  ordenar,
  resumen,
} from '../src/lista.js';

const AHORA = new Date('2025-03-15T12:00:00');
const articulo = (datos) => ({
  id: 'x',
  nombre: 'Pan',
  cantidad: 1,
  comprado: false,
  creado: AHORA,
  ...datos,
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('anadir', () => {
  it('añade un artículo nuevo, pendiente, con la cantidad y la fecha indicadas', () => {
    const lista = anadir([], 'Leche', 3, AHORA);
    expect(lista).toHaveLength(1);
    expect(lista[0]).toMatchObject({
      nombre: 'Leche',
      cantidad: 3,
      comprado: false,
      creado: AHORA,
    });
    expect(typeof lista[0].id).toBe('string');
    expect(lista[0].id).not.toBe('');
  });

  it('quita los espacios de los extremos del nombre', () => {
    expect(anadir([], '   Pan  ', 1, AHORA)[0].nombre).toBe('Pan');
  });

  it('usa cantidad 1 por defecto', () => {
    expect(anadir([], 'Pan', undefined, AHORA)[0].cantidad).toBe(1);
  });

  it('usa la fecha actual por defecto (con el reloj fijado)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T09:00:00Z'));
    expect(anadir([], 'Pan')[0].creado).toEqual(new Date('2030-01-01T09:00:00Z'));
  });

  it('genera un id distinto para cada artículo', () => {
    const lista = anadir(anadir([], 'Pan', 1, AHORA), 'Leche', 1, AHORA);
    expect(lista[0].id).not.toBe(lista[1].id);
  });

  it('usa crypto.randomUUID para el id (espía comprobado con vi.fn)', () => {
    const espia = vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('id-fijo');
    expect(anadir([], 'Pan', 1, AHORA)[0].id).toBe('id-fijo');
    expect(espia).toHaveBeenCalledTimes(1);
  });

  it('no modifica la lista recibida', () => {
    const original = [articulo({ id: 'a' })];
    const copia = structuredClone(original);
    anadir(original, 'Leche', 1, AHORA);
    anadir(original, 'pan', 2, AHORA);
    expect(original).toEqual(copia);
  });

  it.each([
    ['Café', 'CAFE'],
    ['café', 'Cafe'],
    ['CAFÉ', 'cafe'],
    ['Pan', 'pAN'],
  ])('«%s» y «%s» son el mismo artículo: se suman', (primero, segundo) => {
    const lista = anadir(anadir([], primero, 2, AHORA), segundo, 3, AHORA);
    expect(lista).toHaveLength(1);
    expect(lista[0].cantidad).toBe(5);
    expect(lista[0].nombre).toBe(primero);
  });

  it('distingue artículos que solo se parecen (ñ no es n)', () => {
    expect(anadir(anadir([], 'Año', 1, AHORA), 'Ano', 1, AHORA)).toHaveLength(2);
  });

  it('al sumar a uno ya comprado, lo deja pendiente', () => {
    const lista = anadir([articulo({ comprado: true })], 'pan', 1, AHORA);
    expect(lista[0].comprado).toBe(false);
  });

  it('la cantidad se queda en el máximo de 99', () => {
    const lista = anadir([articulo({ cantidad: 98 })], 'Pan', 5, AHORA);
    expect(lista[0].cantidad).toBe(99);
  });

  it('acepta justo la cantidad máxima, 99, y la mínima, 1', () => {
    expect(anadir([], 'A', 99, AHORA)[0].cantidad).toBe(99);
    expect(anadir([], 'B', 1, AHORA)[0].cantidad).toBe(1);
  });

  it('rechaza un nombre vacío o solo con espacios', () => {
    expect(() => anadir([], '', 1, AHORA)).toThrow('El nombre no puede estar vacío');
    expect(() => anadir([], '   ', 1, AHORA)).toThrow(Error);
  });

  it.each([0, -1, 100, 1.5, NaN, '2', null])(
    'rechaza la cantidad no válida %s con un RangeError',
    (cantidad) => {
      expect(() => anadir([], 'Pan', cantidad, AHORA)).toThrow(RangeError);
      expect(() => anadir([], 'Pan', cantidad, AHORA)).toThrow(`Cantidad no válida: ${cantidad}`);
    },
  );
});

describe('alternarComprado', () => {
  it('marca un artículo pendiente como comprado y al revés', () => {
    const lista = [articulo({ id: 'a' })];
    const marcada = alternarComprado(lista, 'a');
    expect(marcada[0].comprado).toBe(true);
    expect(alternarComprado(marcada, 'a')[0].comprado).toBe(false);
  });

  it('solo cambia el artículo con ese id', () => {
    const lista = [articulo({ id: 'a' }), articulo({ id: 'b' })];
    expect(alternarComprado(lista, 'b').map((x) => x.comprado)).toEqual([false, true]);
  });

  it('con un id que no existe devuelve una lista igual', () => {
    const lista = [articulo({ id: 'a' })];
    expect(alternarComprado(lista, 'no-existe')).toEqual(lista);
  });

  it('no modifica la lista ni el artículo recibidos', () => {
    const lista = [articulo({ id: 'a' })];
    const copia = structuredClone(lista);
    const nueva = alternarComprado(lista, 'a');
    expect(lista).toEqual(copia);
    expect(nueva).not.toBe(lista);
    expect(nueva[0]).not.toBe(lista[0]);
  });
});

describe('quitar y quitarComprados', () => {
  it('quita el artículo con ese id', () => {
    const lista = [articulo({ id: 'a' }), articulo({ id: 'b' })];
    expect(quitar(lista, 'a').map((x) => x.id)).toEqual(['b']);
  });

  it('con un id que no existe no quita nada, pero devuelve una lista nueva', () => {
    const lista = [articulo({ id: 'a' })];
    const resultado = quitar(lista, 'z');
    expect(resultado).toEqual(lista);
    expect(resultado).not.toBe(lista);
  });

  it('quita todos los comprados y deja los pendientes', () => {
    const lista = [
      articulo({ id: 'a', comprado: true }),
      articulo({ id: 'b' }),
      articulo({ id: 'c', comprado: true }),
    ];
    expect(quitarComprados(lista).map((x) => x.id)).toEqual(['b']);
  });

  it('quitarComprados con la lista vacía o sin comprados no cambia nada', () => {
    expect(quitarComprados([])).toEqual([]);
    const lista = [articulo({ id: 'a' })];
    expect(quitarComprados(lista)).toEqual(lista);
  });

  it('no modifican la lista recibida', () => {
    const lista = [articulo({ id: 'a', comprado: true }), articulo({ id: 'b' })];
    const copia = structuredClone(lista);
    quitar(lista, 'a');
    quitarComprados(lista);
    expect(lista).toEqual(copia);
  });
});

describe('ordenar', () => {
  it('pone primero los pendientes y después los comprados', () => {
    const lista = [
      articulo({ id: 'a', nombre: 'Agua', comprado: true }),
      articulo({ id: 'b', nombre: 'Zumo' }),
    ];
    expect(ordenar(lista).map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('ordena por nombre según el español: «Árbol» va con la A y «Ñu» después de la N', () => {
    const lista = ['Zanahoria', 'Ñu', 'Árbol', 'Naranja', 'Banana'].map((nombre, i) =>
      articulo({ id: String(i), nombre }),
    );
    expect(ordenar(lista).map((x) => x.nombre)).toEqual([
      'Árbol',
      'Banana',
      'Naranja',
      'Ñu',
      'Zanahoria',
    ]);
  });

  it('no distingue mayúsculas al ordenar', () => {
    const lista = ['b', 'A', 'c'].map((nombre, i) => articulo({ id: String(i), nombre }));
    expect(ordenar(lista).map((x) => x.nombre)).toEqual(['A', 'b', 'c']);
  });

  it('con la lista vacía devuelve una lista vacía', () => {
    expect(ordenar([])).toEqual([]);
  });

  it('no modifica la lista recibida (devuelve una copia)', () => {
    const lista = [articulo({ id: 'b', nombre: 'Zumo' }), articulo({ id: 'a', nombre: 'Agua' })];
    const orden = lista.map((x) => x.id);
    const resultado = ordenar(lista);
    expect(lista.map((x) => x.id)).toEqual(orden);
    expect(resultado).not.toBe(lista);
  });
});

describe('resumen', () => {
  it('avisa de que la lista está vacía', () => {
    expect(resumen([])).toBe('La lista está vacía');
  });

  it('usa el singular con un artículo y ningún comprado', () => {
    expect(resumen([articulo({})])).toBe('1 artículo · 0 comprados');
  });

  it('usa el plural de artículos y el singular de comprado', () => {
    expect(resumen([articulo({ comprado: true }), articulo({})])).toBe('2 artículos · 1 comprado');
  });

  it('usa el plural en los dos con varios comprados', () => {
    const lista = [articulo({ comprado: true }), articulo({ comprado: true }), articulo({})];
    expect(resumen(lista)).toBe('3 artículos · 2 comprados');
  });

  it('cuenta artículos, no unidades (una línea con cantidad 5 es un artículo)', () => {
    expect(resumen([articulo({ cantidad: 5 })])).toBe('1 artículo · 0 comprados');
  });
});
