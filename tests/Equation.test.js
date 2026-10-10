import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Equation } from '../js/core/Equation.js';
import { InputError } from '../js/core/errors.js';

test('detecta variáveis na ordem em que aparecem, ignorando funções e constantes', () => {
  const eq = new Equation('T = 2 * pi * sqrt(L / g)');
  assert.equal(eq.resultName, 'T');
  assert.deepEqual(eq.variables, ['L', 'g']);
});

test('sem "=" o resultado se chama f', () => {
  assert.equal(new Equation('a * b').resultName, 'f');
});

test('aceita atalhos ** , ln, sen e tg', () => {
  const eq = new Equation('y = x**2 + ln(a) + sen(b) + tg(c)');
  assert.equal(eq.evaluate({ x: 3, a: Math.E, b: 0, c: 0 }), 10);
});

test('rejeita equações inválidas', () => {
  for (const text of ['', 'a = b = c', 'x = 2(', 'y = foo(a)', 'x = x + 1', '2y = x']) {
    assert.throws(() => new Equation(text), InputError, text);
  }
});

test('gera LaTeX com índices e letras gregas', () => {
  assert.equal(new Equation('F_x = F * cos(theta)').tex.replace(/\s+/g, ''), 'F_{\\mathrm{x}}=F\\cdot\\cos\\left(\\theta\\right)');
});
