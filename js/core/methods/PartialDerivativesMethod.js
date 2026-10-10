import { math } from '../math.js';
import { InputError } from '../errors.js';
import { nodeTex, symbolTex } from '../latex.js';
import { PropagationLatex } from '../PropagationLatex.js';
import { PropagationTerm } from '../PropagationResult.js';
import { PropagationMethod } from './PropagationMethod.js';

/**
 * Método geral, válido para qualquer fórmula:
 *
 *   Δf = √( Σ (∂f/∂xᵢ · Δxᵢ)² )
 */
export class PartialDerivativesMethod extends PropagationMethod {
  constructor() {
    super({
      id: 'derivadas',
      label: 'Derivadas parciais',
      formulaTex: '\\Delta y = \\sqrt{\\left(\\frac{\\partial y}{\\partial x_1}\\Delta x_1\\right)^2 + \\left(\\frac{\\partial y}{\\partial x_2}\\Delta x_2\\right)^2 + \\cdots}',
      hint: 'Vale para qualquer fórmula.',
    });
  }

  computeTerms({ equation, measurements, scope }) {
    return equation.variables.map((name) => {
      const measurement = measurements.get(name);
      const derivative = PartialDerivativesMethod.#derive(equation.node, name);
      const derivativeValue = PropagationMethod.toReal(derivative.evaluate(scope), `∂${equation.resultName}/∂${name}`);
      return new PropagationTerm({
        variable: name,
        measurement,
        contribution: derivativeValue * measurement.uncertainty,
        details: { derivative, derivativeValue },
      });
    });
  }

  createLatex(result, formatter) {
    return new PartialDerivativesLatex(result, formatter);
  }

  static #derive(node, variable) {
    try {
      return math.derivative(node, variable);
    } catch (error) {
      throw new InputError(`Não foi possível derivar em relação a "${variable}": ${error.message}`);
    }
  }
}

/** Passo a passo do método das derivadas parciais. */
export class PartialDerivativesLatex extends PropagationLatex {
  methodSteps() {
    return [
      { title: 'Fórmula geral da propagação', formulas: [this.general()] },
      { title: 'Derivadas parciais', formulas: this.derivatives() },
      { title: 'Substituindo as derivadas', formulas: [this.symbolic()] },
      { title: 'Substituindo os valores', formulas: [this.numeric()] },
    ];
  }

  #sqrtOfSum(items) {
    return `\\Delta ${this.f} = \\sqrt{${items.join(' + ')}}`;
  }

  #partial(variable) {
    return `\\frac{\\partial ${this.f}}{\\partial ${symbolTex(variable)}}`;
  }

  /** Δf = √( (∂f/∂x · Δx)² + ... ) */
  general() {
    return this.#sqrtOfSum(
      this.result.terms.map((t) => `\\left(${this.#partial(t.variable)}\\,\\Delta ${symbolTex(t.variable)}\\right)^2`),
    );
  }

  /** Lista com cada derivada parcial: ∂f/∂x = ... */
  derivatives() {
    return this.result.terms.map((t) => `${this.#partial(t.variable)} = ${nodeTex(t.details.derivative)}`);
  }

  /** Fórmula com as derivadas já resolvidas, ainda em forma simbólica. */
  symbolic() {
    return this.#sqrtOfSum(
      this.result.terms.map((t) => `\\left[\\left(${nodeTex(t.details.derivative)}\\right)\\Delta ${symbolTex(t.variable)}\\right]^2`),
    );
  }

  /** Fórmula com os números substituídos e o resultado. */
  numeric() {
    const items = this.result.terms.map((t) => `\\left(${this.num(t.details.derivativeValue)} \\cdot ${this.num(t.measurement.uncertainty)}\\right)^2`);
    return `${this.#sqrtOfSum(items)} = ${this.num(this.result.uncertainty)}`;
  }
}
