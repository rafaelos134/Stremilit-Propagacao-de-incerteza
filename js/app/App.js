import { Equation } from '../core/Equation.js';
import { InputError } from '../core/errors.js';
import { NumberFormatter } from '../core/NumberFormatter.js';
import { findMethod, METHODS } from '../core/methods/index.js';
import { EquationInput } from '../ui/EquationInput.js';
import { LatexRenderer } from '../ui/LatexRenderer.js';
import { MethodSelector } from '../ui/MethodSelector.js';
import { ResultPanel } from '../ui/ResultPanel.js';
import { VariableTable } from '../ui/VariableTable.js';
import { EXAMPLES } from './examples.js';
import { UrlState } from './UrlState.js';

const DEBOUNCE_MS = 200;

/**
 * Controlador da página: liga os componentes de interface ao núcleo de cálculo.
 * Não contém regras de cálculo (ficam em js/core) nem detalhes de HTML (ficam em js/ui).
 */
export class App {
  /** @param {Document} doc */
  constructor(doc = document) {
    const $ = (id) => doc.getElementById(id);
    const renderer = new LatexRenderer();
    const formatter = new NumberFormatter();

    this.urlState = new UrlState();
    /** @type {Equation | null} */
    this.equation = null;

    this.methodSelector = new MethodSelector(
      { options: $('method-options'), formula: $('method-formula'), hint: $('method-hint') },
      METHODS,
      renderer,
    );
    this.equationInput = new EquationInput(
      { input: $('equation'), preview: $('equation-preview'), examples: $('examples') },
      renderer,
    );
    this.variableTable = new VariableTable(
      { body: $('variables'), emptyMessage: $('variables-empty') },
      renderer,
    );
    this.resultPanel = new ResultPanel(
      {
        status: $('result-status'),
        content: $('result-content'),
        final: $('result-final'),
        summary: $('result-summary'),
        contributions: $('result-contributions'),
        steps: $('result-steps'),
      },
      renderer,
      formatter,
    );
    this.buttons = { copyResult: $('copy-result'), copyLatex: $('copy-latex'), share: $('share-link'), clear: $('clear') };
  }

  start() {
    this.equationInput.renderExamples(EXAMPLES, (example) => this.load(example));
    this.equationInput.onInput(this.#debounce(() => this.#updateEquation()));
    this.variableTable.onChange(this.#debounce(() => this.#calculate()));
    this.methodSelector.onChange(() => this.#calculate());

    this.#bindCopy(this.buttons.copyResult, () => this.resultPanel.resultText());
    this.#bindCopy(this.buttons.copyLatex, () => this.resultPanel.latexText());
    this.#bindCopy(this.buttons.share, () => this.urlState.href);
    this.buttons.clear.addEventListener('click', () => this.load({ equation: '', values: {} }));

    const saved = this.urlState.read();
    if (saved) this.load(saved);
    else this.#updateEquation();
  }

  /** Carrega uma equação e seus valores (exemplo ou link compartilhado). */
  load({ equation, values, method }) {
    if (method) this.methodSelector.value = findMethod(method);
    this.equationInput.value = equation;
    this.#updateEquation();
    this.variableTable.setValues(values);
    this.#calculate();
  }

  #updateEquation() {
    const text = this.equationInput.value;
    this.equation = null;
    if (!text.trim()) {
      this.equationInput.showEmpty();
      this.variableTable.setVariables([]);
    } else {
      try {
        this.equation = new Equation(text);
        this.equationInput.showPreview(this.equation.tex);
        this.variableTable.setVariables(this.equation.variables);
      } catch (error) {
        if (!(error instanceof InputError)) throw error;
        this.equationInput.showError(error.message);
      }
    }
    this.#calculate();
  }

  #calculate() {
    const method = this.methodSelector.value;
    this.urlState.write({
      equation: this.equationInput.value,
      values: this.variableTable.getValues(),
      method: method === METHODS[0] ? undefined : method.id,
    });

    if (!this.equation) {
      this.resultPanel.showMessage('Digite uma equação ou escolha um exemplo para começar.');
      return;
    }
    if (this.equation.variables.length === 0) {
      this.resultPanel.showMessage('A equação não tem variáveis medidas, então não há incerteza para propagar.');
      return;
    }

    try {
      method.validate(this.equation);
    } catch (error) {
      if (!(error instanceof InputError)) throw error;
      this.resultPanel.showMessage(error.message, { error: true });
      return;
    }

    const { measurements, missing, errors } = this.variableTable.read();
    if (errors.length > 0) {
      this.resultPanel.showMessage(errors.join(' '), { error: true });
      return;
    }
    if (missing.length > 0) {
      this.resultPanel.showMessage(`Preencha o valor e a incerteza de: ${missing.join(', ')}.`);
      return;
    }

    try {
      this.resultPanel.showResult(method.calculate(this.equation, measurements));
    } catch (error) {
      if (!(error instanceof InputError)) {
        console.error(error);
        this.resultPanel.showMessage('Ocorreu um erro inesperado no cálculo. Verifique a equação e os valores.', { error: true });
        return;
      }
      this.resultPanel.showMessage(error.message, { error: true });
    }
  }

  #bindCopy(button, getText) {
    const label = button.textContent;
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(getText());
        button.textContent = 'Copiado!';
      } catch {
        button.textContent = 'Não foi possível copiar';
      }
      setTimeout(() => { button.textContent = label; }, 1500);
    });
  }

  #debounce(callback) {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(callback, DEBOUNCE_MS);
    };
  }
}
