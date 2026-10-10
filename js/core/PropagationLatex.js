import { NumberFormatter } from './NumberFormatter.js';

/**
 * Base das fórmulas LaTeX do passo a passo.
 * Cada método de propagação tem uma subclasse que implementa `methodSteps()`.
 *
 * @typedef {{ title: string, formulas: string[] }} LatexStep
 */
export class PropagationLatex {
  /**
   * @param {import('./PropagationResult.js').PropagationResult} result
   * @param {NumberFormatter} [formatter]
   */
  constructor(result, formatter = new NumberFormatter()) {
    this.result = result;
    this.formatter = formatter;
    /** LaTeX do nome do resultado (ex.: "V"). */
    this.f = result.equation.resultTex;
  }

  /**
   * Passos específicos do método (sem o resultado final).
   * @abstract
   * @returns {LatexStep[]}
   */
  methodSteps() {
    throw new Error(`${this.constructor.name} precisa implementar methodSteps().`);
  }

  /** Todos os passos, terminando com o resultado arredondado. */
  steps() {
    return [...this.methodSteps(), { title: 'Resultado (arredondado)', formulas: [this.final()] }];
  }

  /** Resultado final arredondado: f = (valor ± incerteza) × 10^n */
  final() {
    const { value, uncertainty, exponent } = this.formatter.roundWithUncertainty(this.result.value, this.result.uncertainty);
    const body = `${value} \\pm ${uncertainty}`;
    return exponent === 0
      ? `${this.f} = ${body}`
      : `${this.f} = \\left(${body}\\right) \\times 10^{${exponent}}`;
  }

  /** Atalho para formatar números em LaTeX. */
  num(number) {
    return this.formatter.toTex(number);
  }
}
