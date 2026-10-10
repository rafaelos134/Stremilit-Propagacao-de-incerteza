import { InputError } from '../errors.js';
import { PropagationResult } from '../PropagationResult.js';

/**
 * Base para os métodos de propagação de incerteza.
 *
 * Para criar um método novo:
 *  1. estenda esta classe e implemente `computeTerms()` e `createLatex()`;
 *  2. se o método só vale para alguns tipos de fórmula, sobrescreva `validate()`;
 *  3. registre a instância em `methods/index.js`.
 */
export class PropagationMethod {
  /**
   * @param {object} info
   * @param {string} info.id identificador curto (usado na URL)
   * @param {string} info.label nome exibido no seletor
   * @param {string} info.formulaTex fórmula geral exibida na interface
   * @param {string} info.hint quando usar o método
   */
  constructor({ id, label, formulaTex, hint }) {
    this.id = id;
    this.label = label;
    this.formulaTex = formulaTex;
    this.hint = hint;
  }

  /**
   * Lança InputError se o método não puder ser aplicado à equação.
   * @param {import('../Equation.js').Equation} _equation
   */
  validate(_equation) {}

  /**
   * @param {import('../Equation.js').Equation} equation
   * @param {Map<string, import('../Measurement.js').Measurement>} measurements
   * @returns {PropagationResult}
   */
  calculate(equation, measurements) {
    this.validate(equation);

    const missing = equation.variables.filter((name) => !measurements.has(name));
    if (missing.length > 0) {
      throw new InputError(`Faltam valores para: ${missing.join(', ')}.`);
    }

    const scope = Object.fromEntries(equation.variables.map((name) => [name, measurements.get(name).value]));
    const value = PropagationMethod.toReal(equation.evaluate(scope), `o valor de ${equation.resultName}`);
    const terms = this.computeTerms({ equation, measurements, scope, value });
    return new PropagationResult({ equation, value, terms, method: this });
  }

  /**
   * Calcula a contribuição de cada variável.
   * @abstract
   * @param {object} context
   * @param {import('../Equation.js').Equation} context.equation
   * @param {Map<string, import('../Measurement.js').Measurement>} context.measurements
   * @param {Record<string, number>} context.scope valores das variáveis
   * @param {number} context.value valor calculado da função
   * @returns {import('../PropagationResult.js').PropagationTerm[]}
   */
  computeTerms(context) {
    throw new Error(`${this.constructor.name} precisa implementar computeTerms().`);
  }

  /**
   * Cria o gerador das fórmulas do passo a passo.
   * @abstract
   * @param {PropagationResult} result
   * @param {import('../NumberFormatter.js').NumberFormatter} formatter
   * @returns {import('../PropagationLatex.js').PropagationLatex}
   */
  createLatex(result, formatter) {
    throw new Error(`${this.constructor.name} precisa implementar createLatex().`);
  }

  /** Converte o retorno do math.js em número real, ou lança InputError. */
  static toReal(result, label) {
    const number = typeof result === 'number' ? result : Number(result?.valueOf?.());
    if (!Number.isFinite(number)) {
      throw new InputError(`Não foi possível calcular ${label} com esses valores (resultado indefinido, infinito ou complexo).`);
    }
    return number;
  }
}
