import { InputError } from '../errors.js';
import { findVariables } from '../Equation.js';
import { symbolTex } from '../latex.js';
import { PropagationLatex } from '../PropagationLatex.js';
import { PropagationTerm } from '../PropagationResult.js';
import { PropagationMethod } from './PropagationMethod.js';

/** Funções que equivalem a uma potência fixa. */
const ROOTS = { sqrt: 1 / 2, cbrt: 1 / 3 };

/**
 * Decompõe uma expressão do tipo c · x₁^p₁ · x₂^p₂ · ... e retorna os expoentes.
 * Lança InputError se a expressão tiver outra forma (soma de variáveis, seno, etc.).
 *
 * @param {import('mathjs').MathNode} node
 * @returns {Map<string, number>} expoente de cada variável
 */
export function decomposePowerLaw(node) {
  const powers = new Map();
  collectPowers(node, 1, powers);
  return powers;
}

function collectPowers(node, exponent, powers) {
  // Trechos sem variáveis fazem parte da constante c.
  if (findVariables(node).length === 0) return;

  if (node.isParenthesisNode) {
    collectPowers(node.content, exponent, powers);
    return;
  }
  if (node.isSymbolNode) {
    powers.set(node.name, (powers.get(node.name) ?? 0) + exponent);
    return;
  }
  if (node.isOperatorNode) {
    switch (node.fn) {
      case 'multiply':
        node.args.forEach((arg) => collectPowers(arg, exponent, powers));
        return;
      case 'divide':
        collectPowers(node.args[0], exponent, powers);
        collectPowers(node.args[1], -exponent, powers);
        return;
      case 'unaryMinus':
      case 'unaryPlus':
        collectPowers(node.args[0], exponent, powers);
        return;
      case 'pow': {
        const [base, power] = node.args;
        if (findVariables(power).length === 0) {
          collectPowers(base, exponent * PropagationMethod.toReal(power.evaluate(), 'o expoente'), powers);
          return;
        }
        break;
      }
      default:
        break;
    }
  }
  if (node.isFunctionNode && node.fn.name in ROOTS) {
    collectPowers(node.args[0], exponent * ROOTS[node.fn.name], powers);
    return;
  }

  throw new InputError(
    `O caso particular só vale para produtos e potências (y = c·x₁^p₁·x₂^p₂·…). `
    + `O trecho "${node.toString()}" não tem essa forma — use "Derivadas parciais".`,
  );
}

/**
 * Caso particular para fórmulas do tipo y = c · x₁^p₁ · x₂^p₂ · ...
 *
 *   Δy = |y| · √( Σ (pᵢ · Δxᵢ / xᵢ)² )
 *
 * Dá o mesmo resultado que as derivadas parciais, pois ∂y/∂xᵢ = pᵢ · y / xᵢ.
 */
export class PowerLawMethod extends PropagationMethod {
  constructor() {
    super({
      id: 'potencias',
      label: 'Caso particular',
      formulaTex: '\\Delta y = |y|\\,\\sqrt{\\left(p_1\\frac{\\Delta x_1}{x_1}\\right)^2 + \\left(p_2\\frac{\\Delta x_2}{x_2}\\right)^2 + \\cdots}',
      hint: 'Só vale quando a fórmula é um produto de potências das variáveis (sem somas, senos, exponenciais...).',
    });
  }

  validate(equation) {
    decomposePowerLaw(equation.node);
  }

  computeTerms({ equation, measurements, value }) {
    const powers = decomposePowerLaw(equation.node);
    return equation.variables.map((name) => {
      const measurement = measurements.get(name);
      const exponent = powers.get(name) ?? 0;
      if (measurement.value === 0 && exponent !== 0) {
        throw new InputError(`No caso particular nenhuma variável pode valer zero (${name} = 0). Use "Derivadas parciais".`);
      }
      const relative = exponent === 0 ? 0 : (exponent * measurement.uncertainty) / measurement.value;
      return new PropagationTerm({
        variable: name,
        measurement,
        contribution: Math.abs(value) * relative,
        details: { exponent, relative },
      });
    });
  }

  createLatex(result, formatter) {
    return new PowerLawLatex(result, formatter);
  }
}

/**
 * Escreve um expoente como fração quando possível (0.5 -> \frac{1}{2}).
 * @param {number} exponent
 * @param {(n: number) => string} fallback
 * @param {{ wrapNegative?: boolean }} [options] coloca negativos entre parênteses (para uso dentro de produtos)
 */
export function exponentTex(exponent, fallback, { wrapNegative = true } = {}) {
  for (let denominator = 1; denominator <= 12; denominator += 1) {
    const numerator = Math.round(exponent * denominator);
    if (Math.abs(numerator / denominator - exponent) < 1e-9) {
      const body = denominator === 1 ? String(Math.abs(numerator)) : `\\frac{${Math.abs(numerator)}}{${denominator}}`;
      if (numerator >= 0) return body;
      return wrapNegative ? `\\left(-${body}\\right)` : `-${body}`;
    }
  }
  return fallback(exponent);
}

/** Passo a passo do caso particular. */
export class PowerLawLatex extends PropagationLatex {
  methodSteps() {
    return [
      { title: 'Fórmula do caso particular', formulas: [this.general()] },
      { title: 'Expoentes identificados', formulas: [this.exponents()] },
      { title: 'Substituindo os expoentes', formulas: [this.symbolic()] },
      { title: 'Substituindo os valores', formulas: [this.numeric()] },
    ];
  }

  #formula(prefix, items) {
    return `\\Delta ${this.f} = ${prefix}\\,\\sqrt{${items.join(' + ')}}`;
  }

  #exponent(term, options) {
    return exponentTex(term.details.exponent, (n) => this.num(n), options);
  }

  /** Δy = |y| √( (p_x Δx/x)² + ... ) */
  general() {
    return this.#formula(
      `\\left|${this.f}\\right|`,
      this.result.terms.map((t) => {
        const x = symbolTex(t.variable);
        return `\\left(p_{${x}}\\frac{\\Delta ${x}}{${x}}\\right)^2`;
      }),
    );
  }

  /** p_x = 1, \quad p_y = -2, ... */
  exponents() {
    return this.result.terms
      .map((t) => `p_{${symbolTex(t.variable)}} = ${this.#exponent(t, { wrapNegative: false })}`)
      .join(',\\quad ');
  }

  symbolic() {
    return this.#formula(
      `\\left|${this.f}\\right|`,
      this.result.terms.map((t) => {
        const x = symbolTex(t.variable);
        return `\\left(${this.#exponent(t)}\\cdot\\frac{\\Delta ${x}}{${x}}\\right)^2`;
      }),
    );
  }

  numeric() {
    const items = this.result.terms.map(
      (t) => `\\left(${this.#exponent(t)}\\cdot\\frac{${this.num(t.measurement.uncertainty)}}{${this.num(t.measurement.value)}}\\right)^2`,
    );
    return `${this.#formula(this.num(Math.abs(this.result.value)), items)} = ${this.num(this.result.uncertainty)}`;
  }
}
