import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Equation } from '../js/core/Equation.js';
import { Measurement } from '../js/core/Measurement.js';
import { InputError } from '../js/core/errors.js';
import { NumberFormatter } from '../js/core/NumberFormatter.js';
import { PartialDerivativesMethod } from '../js/core/methods/PartialDerivativesMethod.js';
import { decomposePowerLaw, exponentTex, PowerLawMethod } from '../js/core/methods/PowerLawMethod.js';
import { findMethod, METHODS } from '../js/core/methods/index.js';

const measurements = (values) => new Map(Object.entries(values).map(([k, v]) => [k, Measurement.fromText(v)]));
const partial = new PartialDerivativesMethod();
const powerLaw = new PowerLawMethod();
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-12 * Math.max(1, Math.abs(b)), `${a} != ${b}`);

// ----- Derivadas parciais -----

test('derivadas: soma de incertezas em quadratura', () => {
  const r = partial.calculate(new Equation('s = a + b'), measurements({ a: '1 ± 0.3', b: '2 ± 0.4' }));
  assert.equal(r.value, 3);
  close(r.uncertainty, 0.5);
});

test('derivadas: exemplo do projeto original V = ((B+b)*h)/T', () => {
  const r = partial.calculate(
    new Equation('V = ((B+b)*h)/T'),
    measurements({ B: '0.44+-0.02', b: '0.14+-0.02', h: '6.8+-0.2', T: '1+-0.02' }),
  );
  close(r.value, 3.944);
  close(r.uncertainty, 0.23805472984169);
  close(r.terms.reduce((sum, t) => sum + t.share, 0), 1);
});

test('derivadas: erros claros para valores faltando ou resultados não reais', () => {
  assert.throws(() => partial.calculate(new Equation('f = a * b'), measurements({ a: '1 ± 0.1' })), InputError);
  assert.throws(() => partial.calculate(new Equation('f = sqrt(a)'), measurements({ a: '-4 ± 0.1' })), InputError);
});

// ----- Caso particular -----

test('caso particular: identifica os expoentes', () => {
  const powers = (text) => Object.fromEntries(decomposePowerLaw(new Equation(text).node));
  assert.deepEqual(powers('y = 3 * a * b^2 / c'), { a: 1, b: 2, c: -1 });
  assert.deepEqual(powers('g = 4 * pi^2 * L / T^2'), { L: 1, T: -2 });
  assert.deepEqual(powers('v = sqrt(2 * g * h)'), { g: 0.5, h: 0.5 });
  assert.deepEqual(powers('y = x * x / (x^3)^(1/2)'), { x: 0.5 });
  assert.deepEqual(powers('rho = -m / (pi * r^2 * h)'), { m: 1, r: -2, h: -1 });
});

test('caso particular: rejeita fórmulas que não são produto de potências', () => {
  for (const text of ['A = (B + b) * h / 2', 'y = sin(x)', 'y = a ^ b', 'y = exp(x)']) {
    assert.throws(() => powerLaw.validate(new Equation(text)), InputError, text);
  }
});

test('caso particular: Δy = |y| √Σ (p Δx/x)²', () => {
  const r = powerLaw.calculate(new Equation('y = a * b^2'), measurements({ a: '2 ± 0.1', b: '3 ± 0.06' }));
  close(r.value, 18);
  close(r.uncertainty, 18 * Math.hypot(0.1 / 2, (2 * 0.06) / 3));
});

test('caso particular dá o mesmo resultado que as derivadas parciais', () => {
  const cases = [
    ['g = 4 * pi^2 * L / T^2', { L: '0.800 ± 0.005', T: '1.79 ± 0.02' }],
    ['rho = m / (pi * r^2 * h)', { m: '25.3 ± 0.1', r: '1.00 ± 0.02', h: '3.00 ± 0.05' }],
    ['v = -sqrt(2 * g * h) / t', { g: '9.8 ± 0.1', h: '1.2 ± 0.01', t: '0.5 ± 0.02' }],
  ];
  for (const [text, values] of cases) {
    const equation = new Equation(text);
    const a = partial.calculate(equation, measurements(values));
    const b = powerLaw.calculate(equation, measurements(values));
    close(b.value, a.value);
    close(b.uncertainty, a.uncertainty);
  }
});

test('caso particular: variável igual a zero dá erro claro', () => {
  assert.throws(() => powerLaw.calculate(new Equation('y = a * b'), measurements({ a: '0 ± 0.1', b: '2 ± 0.1' })), InputError);
});

test('caso particular: passo a passo mostra expoentes como frações', () => {
  assert.equal(exponentTex(0.5, String), '\\frac{1}{2}');
  assert.equal(exponentTex(-2, String), '\\left(-2\\right)');
  const r = powerLaw.calculate(new Equation('v = sqrt(L) / T^2'), measurements({ L: '1 ± 0.1', T: '2 ± 0.1' }));
  const steps = r.method.createLatex(r, new NumberFormatter()).steps();
  assert.deepEqual(steps.map((s) => s.title), [
    'Fórmula do caso particular', 'Expoentes identificados', 'Substituindo os expoentes', 'Substituindo os valores', 'Resultado (arredondado)',
  ]);
  assert.match(steps[1].formulas[0], /p_\{L\} = \\frac\{1\}\{2\}/);
});

test('registro de métodos', () => {
  assert.deepEqual(METHODS.map((m) => m.id), ['derivadas', 'potencias']);
  assert.equal(findMethod('potencias'), METHODS[1]);
  assert.equal(findMethod('inexistente'), METHODS[0]);
});

test('caso particular: lista de expoentes sem parênteses em negativos', () => {
  assert.equal(exponentTex(-2, String, { wrapNegative: false }), '-2');
});
