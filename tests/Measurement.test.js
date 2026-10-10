import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Measurement } from '../js/core/Measurement.js';
import { InputError } from '../js/core/errors.js';

test('lê "valor ± incerteza" em vários formatos', () => {
  for (const text of ['6.8±0.2', '6.8 +- 0.2', '6,8 ± 0,2', '6.8+/-0.2']) {
    const m = Measurement.fromText(text);
    assert.equal(m.value, 6.8, text);
    assert.equal(m.uncertainty, 0.2, text);
  }
});

test('aceita notação científica', () => {
  const m = Measurement.fromText('2.2e-3±4e-4');
  assert.equal(m.value, 2.2e-3);
  assert.equal(m.uncertainty, 4e-4);
});

test('rejeita entradas inválidas com InputError', () => {
  assert.throws(() => Measurement.fromParts('abc', '0.1'), InputError);
  assert.throws(() => Measurement.fromParts('', '0.1'), InputError);
  assert.throws(() => Measurement.fromText('1±2±3'), InputError);
});
