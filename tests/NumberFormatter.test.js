import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NumberFormatter } from '../js/core/NumberFormatter.js';

const fmt = new NumberFormatter();

test('arredonda a incerteza para 1 algarismo (2 se começar com 1)', () => {
  assert.deepEqual(fmt.roundWithUncertainty(3.944, 0.238), { value: '3.9', uncertainty: '0.2', exponent: 0 });
  assert.deepEqual(fmt.roundWithUncertainty(1.972, 0.1123), { value: '1.97', uncertainty: '0.11', exponent: 0 });
});

test('trata incerteza que vira 1 após arredondar (0.096 -> 0.10)', () => {
  assert.deepEqual(fmt.roundWithUncertainty(2.3456, 0.096), { value: '2.35', uncertainty: '0.10', exponent: 0 });
});

test('usa notação científica para números grandes ou pequenos', () => {
  assert.deepEqual(fmt.roundWithUncertainty(29942.7, 5444.1), { value: '3.0', uncertainty: '0.5', exponent: 4 });
  assert.deepEqual(fmt.roundWithUncertainty(2.2e-6, 4e-7), { value: '2.2', uncertainty: '0.4', exponent: -6 });
});

test('toText e toTex', () => {
  assert.equal(fmt.toText(0.112303456), '0.112303');
  assert.equal(fmt.toText(2.2e-7), '2.2e-7');
  assert.equal(fmt.toTex(2.2e-7), '2.2 \\times 10^{-7}');
  assert.equal(fmt.toTex(-3), '\\left(-3\\right)');
});
