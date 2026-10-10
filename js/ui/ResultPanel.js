import { symbolTex } from '../core/latex.js';

/**
 * Painel de resultados: valor final, contribuição de cada variável e passo a passo.
 */
export class ResultPanel {
  /**
   * @param {object} elements
   * @param {HTMLElement} elements.status mensagem de estado (vazio/erro)
   * @param {HTMLElement} elements.content conteúdo exibido quando há resultado
   * @param {HTMLElement} elements.final
   * @param {HTMLElement} elements.summary
   * @param {HTMLElement} elements.contributions
   * @param {HTMLElement} elements.steps
   * @param {import('./LatexRenderer.js').LatexRenderer} renderer
   * @param {import('../core/NumberFormatter.js').NumberFormatter} formatter
   */
  constructor(elements, renderer, formatter) {
    this.el = elements;
    this.renderer = renderer;
    this.formatter = formatter;
    /** @type {import('../core/PropagationResult.js').PropagationResult | null} */
    this.result = null;
  }

  showMessage(message, { error = false } = {}) {
    this.result = null;
    this.el.content.hidden = true;
    this.el.status.hidden = false;
    this.el.status.classList.toggle('is-error', error);
    this.el.status.textContent = message;
  }

  /** @param {import('../core/PropagationResult.js').PropagationResult} result */
  showResult(result) {
    this.result = result;
    const latex = result.method.createLatex(result, this.formatter);

    this.renderer.render(this.el.final, latex.final());
    this.#renderSummary(result);
    this.#renderContributions(result);
    this.#renderSteps(latex.steps());

    this.el.status.hidden = true;
    this.el.content.hidden = false;
  }

  /** Resultado arredondado em texto simples, ex.: "V = (3.0 ± 0.5) × 10^4". */
  resultText() {
    if (!this.result) return '';
    const { value, uncertainty, exponent } = this.formatter.roundWithUncertainty(this.result.value, this.result.uncertainty);
    const body = exponent === 0 ? `${value} ± ${uncertainty}` : `(${value} ± ${uncertainty}) × 10^${exponent}`;
    return `${this.result.equation.resultName} = ${body}`;
  }

  /** Todas as fórmulas do passo a passo em LaTeX, uma por linha. */
  latexText() {
    if (!this.result) return '';
    return this.result.method
      .createLatex(this.result, this.formatter)
      .steps()
      .flatMap((step) => step.formulas)
      .join('\n');
  }

  #renderSummary(result) {
    const relative = Number.isFinite(result.relativeUncertainty)
      ? `${(result.relativeUncertainty * 100).toFixed(2)}%`
      : '—';
    const items = [
      ['Valor calculado', this.formatter.toText(result.value)],
      ['Incerteza', this.formatter.toText(result.uncertainty)],
      ['Incerteza relativa', relative],
    ];
    this.el.summary.replaceChildren(
      ...items.map(([label, value]) => {
        const item = document.createElement('div');
        const dt = document.createElement('dt');
        const dd = document.createElement('dd');
        dt.textContent = label;
        dd.textContent = value;
        item.append(dt, dd);
        return item;
      }),
    );
  }

  #renderContributions(result) {
    const rows = [...result.terms]
      .sort((a, b) => b.share - a.share)
      .map((term) => {
        const percent = (term.share * 100).toFixed(1);
        const row = document.createElement('li');
        row.className = 'contribution';

        const name = this.renderer.create(symbolTex(term.variable), { display: false, tag: 'span', className: 'contribution-name' });
        const bar = document.createElement('span');
        bar.className = 'contribution-bar';
        bar.style.setProperty('--share', `${term.share * 100}%`);
        const value = document.createElement('span');
        value.className = 'contribution-value';
        value.textContent = `${percent}%`;

        row.setAttribute('aria-label', `${term.variable}: ${percent}% da incerteza`);
        row.append(name, bar, value);
        return row;
      });
    this.el.contributions.replaceChildren(...rows);
  }

  /** @param {import('../core/PropagationLatex.js').LatexStep[]} steps */
  #renderSteps(steps) {
    this.el.steps.replaceChildren(
      ...steps.map(({ title, formulas }) => {
        const item = document.createElement('li');
        const heading = document.createElement('h4');
        heading.textContent = title;
        item.append(heading, ...formulas.map((tex) => this.renderer.create(tex)));
        return item;
      }),
    );
  }
}
