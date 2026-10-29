import { describe, it, expect, beforeEach, vi } from 'vitest';
import { cargar, guardar, CLAVE, VERSION } from '../src/almacen.js';
import { AlmacenFalso } from './AlmacenFalso.js';

const articulo = (datos) => ({
  id: 'a1',
  nombre: 'Pan',
  cantidad: 2,
  comprado: false,
  creado: new Date('2025-03-15T10:00:00Z'),
  ...datos,
});
const json = (articulos, version = VERSION) => JSON.stringify({ version, articulos });

describe('guardar y cargar', () => {
  let almacen;

  beforeEach(() => {
    almacen = new AlmacenFalso();
  });

  it('guarda la lista con la versión en la clave «lista-compra»', () => {
    expect(CLAVE).toBe('lista-compra');
    expect(guardar([articulo({})], almacen)).toBe(true);
    const guardado = JSON.parse(almacen.getItem('lista-compra'));
    expect(guardado.version).toBe(1);
    expect(guardado.articulos).toHaveLength(1);
  });

  it('guarda las fechas como texto ISO', () => {
    guardar([articulo({})], almacen);
    expect(JSON.parse(almacen.getItem(CLAVE)).articulos[0].creado).toBe('2025-03-15T10:00:00.000Z');
  });

  it('vuelve a cargar lo guardado, con las fechas convertidas de nuevo en Date', () => {
    const lista = [articulo({}), articulo({ id: 'b2', nombre: 'Leche', comprado: true })];
    guardar(lista, almacen);
    const cargada = cargar(almacen);
    expect(cargada).toEqual(lista);
    expect(cargada[0].creado).toBeInstanceOf(Date);
  });

  it('guarda y carga una lista vacía', () => {
    guardar([], almacen);
    expect(cargar(almacen)).toEqual([]);
  });

  it('devuelve [] si no hay nada guardado', () => {
    expect(cargar(almacen)).toEqual([]);
  });

  it.each([['{no es json'], ['null'], ['"texto"'], ['42'], ['[]']])(
    'devuelve [] si el valor guardado está roto o no tiene la forma esperada (%s)',
    (valor) => {
      almacen.setItem(CLAVE, valor);
      expect(cargar(almacen)).toEqual([]);
    },
  );

  it('devuelve [] si es de otra versión, aunque los artículos sean válidos', () => {
    almacen.setItem(CLAVE, json([articulo({})], 2));
    expect(cargar(almacen)).toEqual([]);
    almacen.setItem(CLAVE, JSON.stringify({ articulos: [articulo({})] }));
    expect(cargar(almacen)).toEqual([]);
  });

  it('devuelve [] si «articulos» no es un array', () => {
    almacen.setItem(CLAVE, JSON.stringify({ version: VERSION, articulos: {} }));
    expect(cargar(almacen)).toEqual([]);
  });

  it('descarta los artículos con datos incorrectos y conserva los válidos', () => {
    const buenos = articulo({ id: 'ok' });
    const malos = [
      null,
      'texto',
      42,
      articulo({ id: 5 }),
      articulo({ id: '' }),
      articulo({ nombre: '   ' }),
      articulo({ nombre: 7 }),
      articulo({ cantidad: 0 }),
      articulo({ cantidad: 100 }),
      articulo({ cantidad: 1.5 }),
      articulo({ cantidad: '2' }),
      articulo({ comprado: 'no' }),
      articulo({ creado: 'no es una fecha' }),
      articulo({ creado: 12345 }),
      { id: 'sin-campos' },
    ];
    almacen.setItem(CLAVE, json([malos[0], buenos, ...malos.slice(1)]));
    expect(cargar(almacen).map((a) => a.id)).toEqual(['ok']);
  });

  it('acepta las cantidades límite 1 y 99', () => {
    almacen.setItem(
      CLAVE,
      json([articulo({ id: 'a', cantidad: 1 }), articulo({ id: 'b', cantidad: 99 })]),
    );
    expect(cargar(almacen)).toHaveLength(2);
  });

  it('devuelve [] si el almacenamiento lanza un error al leer', () => {
    const roto = {
      getItem: vi.fn(() => {
        throw new Error('bloqueado');
      }),
    };
    expect(cargar(roto)).toEqual([]);
    expect(roto.getItem).toHaveBeenCalledWith('lista-compra');
  });

  it('guardar devuelve false si el almacenamiento está lleno', () => {
    const lleno = {
      setItem: vi.fn(() => {
        throw new DOMException('Cuota superada', 'QuotaExceededError');
      }),
    };
    expect(guardar([articulo({})], lleno)).toBe(false);
    expect(lleno.setItem).toHaveBeenCalledTimes(1);
  });
});
