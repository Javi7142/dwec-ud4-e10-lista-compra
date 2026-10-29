import { describe, it, expect } from 'vitest';
import { anadir } from '../src/lista.js';

describe('anadir', () => {
  it('rechaza un nombre vacío', () => {
    expect(() => anadir([], '   ')).toThrow('El nombre no puede estar vacío');
  });

  // TODO: el resto de tests del enunciado, en este fichero y en los demás
});
