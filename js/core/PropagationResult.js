/**
 * Contribuição de uma variável para a incerteza final.
 * Cada método guarda seus próprios detalhes (derivada, expoente...) em `details`.
 */
export class PropagationTerm {
  /**
   * @param {object} params
   * @param {string} params.variable
   * @param {import('./Measurement.js').Measurement} params.measurement
   * @param {number} params.contribution parcela da incerteza devida a esta variável (mesma unidade do resultado)
   * @param {object} [params.details] dados específicos do método, usados no passo a passo
   */
  constructor({ variable, measurement, contribution, details = {} }) {
    this.variable = variable;
    this.measurement = measurement;
    this.contribution = contribution;
    this.details = details;
    /** Fração da variância total causada por esta variável (0 a 1). Preenchida pelo resultado. */
    this.share = 0;
  }
}

/**
 * Resultado completo da propagação de incertezas.
 * Δf = √( Σ contribuiçãoᵢ² )
 */
export class PropagationResult {
  /**
   * @param {object} params
   * @param {import('./Equation.js').Equation} params.equation
   * @param {number} params.value
   * @param {PropagationTerm[]} params.terms
   * @param {import('./methods/PropagationMethod.js').PropagationMethod} params.method
   */
  constructor({ equation, value, terms, method }) {
    this.equation = equation;
    this.value = value;
    this.terms = terms;
    this.method = method;

    const variance = terms.reduce((sum, term) => sum + term.contribution ** 2, 0);
    this.uncertainty = Math.sqrt(variance);
    for (const term of terms) {
      term.share = variance === 0 ? 0 : term.contribution ** 2 / variance;
    }
  }

  /** Incerteza relativa (0.05 = 5%). */
  get relativeUncertainty() {
    return this.value === 0 ? Infinity : this.uncertainty / Math.abs(this.value);
  }
}
