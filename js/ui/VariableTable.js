import { Measurement } from '../core/Measurement.js';
import { InputError } from '../core/errors.js';
import { symbolTex } from '../core/latex.js';

/**
 * Tabela com um par de campos (valor e incerteza) para cada variável da equação.
 * Os valores digitados são guardados mesmo quando a equação muda,
 * para o usuário não perder o que já preencheu.
 */
export class VariableTable {
  /**
   * @param {object} elements
   * @param {HTMLElement} elements.body container das linhas
   * @param {HTMLElement} elements.emptyMessage mensagem exibida sem variáveis
   * @param {import('./LatexRenderer.js').LatexRenderer} renderer
   */
  constructor({ body, emptyMessage }, renderer) {
    this.body = body;
    this.emptyMessage = emptyMessage;
    this.renderer = renderer;
    /** @type {Map<string, { value: string, uncertainty: string }>} */
    this.values = new Map();
    /** @type {string[]} */
    this.variables = [];
    this.listeners = [];
  }

  /** @param {() => void} callback chamado sempre que um campo muda */
  onChange(callback) {
    this.listeners.push(callback);
  }

  #notify() {
    this.listeners.forEach((callback) => callback());
  }

  /**
   * Define as variáveis exibidas. Não recria a tabela se nada mudou (mantém o foco do cursor).
   * @param {string[]} variables
   */
  setVariables(variables) {
    if (variables.join('\u0000') === this.variables.join('\u0000')) return;
    this.variables = [...variables];
    this.body.replaceChildren(...this.variables.map((name) => this.#createRow(name)));
    this.emptyMessage.hidden = this.variables.length > 0;
  }

  /**
   * Preenche valores (ex.: ao carregar um exemplo ou um link compartilhado).
   * @param {Record<string, [string, string]>} values
   */
  setValues(values) {
    for (const [name, [value, uncertainty]] of Object.entries(values)) {
      this.values.set(name, { value, uncertainty });
    }
    for (const row of this.body.querySelectorAll('[data-variable]')) {
      const saved = this.values.get(row.dataset.variable);
      row.querySelector('[name="value"]').value = saved?.value ?? '';
      row.querySelector('[name="uncertainty"]').value = saved?.uncertainty ?? '';
    }
  }

  /** Valores atuais das variáveis visíveis, no formato usado por `setValues`. */
  getValues() {
    return Object.fromEntries(
      this.variables
        .filter((name) => this.values.has(name))
        .map((name) => [name, [this.values.get(name).value, this.values.get(name).uncertainty]]),
    );
  }

  /**
   * Lê e valida os campos.
   * @returns {{ measurements: Map<string, Measurement>, missing: string[], errors: string[] }}
   */
  read() {
    const measurements = new Map();
    const missing = [];
    const errors = [];

    for (const row of this.body.querySelectorAll('[data-variable]')) {
      const name = row.dataset.variable;
      const valueInput = row.querySelector('[name="value"]');
      const uncertaintyInput = row.querySelector('[name="uncertainty"]');
      valueInput.removeAttribute('aria-invalid');
      uncertaintyInput.removeAttribute('aria-invalid');

      if (!valueInput.value.trim() || !uncertaintyInput.value.trim()) {
        missing.push(name);
        continue;
      }
      try {
        measurements.set(name, Measurement.fromParts(valueInput.value, uncertaintyInput.value));
      } catch (error) {
        if (!(error instanceof InputError)) throw error;
        const invalid = Number.isFinite(Number(valueInput.value.replace(',', '.'))) ? uncertaintyInput : valueInput;
        invalid.setAttribute('aria-invalid', 'true');
        errors.push(`${name}: ${error.message}`);
      }
    }
    return { measurements, missing, errors };
  }

  #createRow(name) {
    const row = document.createElement('div');
    row.className = 'variable-row';
    row.dataset.variable = name;
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', `Variável ${name}`);

    const label = this.renderer.create(symbolTex(name), { display: false, tag: 'span', className: 'variable-name' });
    const saved = this.values.get(name) ?? { value: '', uncertainty: '' };
    const valueInput = VariableTable.#createInput('value', `Valor de ${name}`, 'ex.: 6.8', saved.value);
    const uncertaintyInput = VariableTable.#createInput('uncertainty', `Incerteza de ${name}`, 'ex.: 0.2', saved.uncertainty);

    const plusMinus = document.createElement('span');
    plusMinus.className = 'plus-minus';
    plusMinus.textContent = '±';
    plusMinus.setAttribute('aria-hidden', 'true');

    const update = () => {
      // Permite colar "6.8 ± 0.2" direto no campo do valor.
      if (Measurement.hasPlusMinus(valueInput.value)) {
        const [value, uncertainty] = Measurement.split(valueInput.value);
        valueInput.value = value;
        uncertaintyInput.value = uncertainty ?? '';
        if (uncertainty) uncertaintyInput.focus();
      }
      this.values.set(name, { value: valueInput.value, uncertainty: uncertaintyInput.value });
      this.#notify();
    };
    valueInput.addEventListener('input', update);
    uncertaintyInput.addEventListener('input', update);

    row.append(label, valueInput, plusMinus, uncertaintyInput);
    return row;
  }

  static #createInput(name, ariaLabel, placeholder, value) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = name;
    input.inputMode = 'decimal';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = placeholder;
    input.value = value;
    input.setAttribute('aria-label', ariaLabel);
    return input;
  }
}
