/**
 * Seletor do método de propagação (botões segmentados) e a fórmula do método escolhido.
 */
export class MethodSelector {
  /**
   * @param {object} elements
   * @param {HTMLElement} elements.options container dos botões
   * @param {HTMLElement} elements.formula onde a fórmula do método é exibida
   * @param {HTMLElement} elements.hint texto de quando usar o método
   * @param {import('../core/methods/PropagationMethod.js').PropagationMethod[]} methods
   * @param {import('./LatexRenderer.js').LatexRenderer} renderer
   */
  constructor({ options, formula, hint }, methods, renderer) {
    this.optionsContainer = options;
    this.formula = formula;
    this.hint = hint;
    this.methods = methods;
    this.renderer = renderer;
    this.selected = methods[0];
    this.listeners = [];
    this.#render();
  }

  get value() {
    return this.selected;
  }

  /** @param {import('../core/methods/PropagationMethod.js').PropagationMethod} method */
  set value(method) {
    this.selected = method;
    for (const input of this.optionsContainer.querySelectorAll('input')) {
      input.checked = input.value === method.id;
    }
    this.renderer.render(this.formula, method.formulaTex);
    this.hint.textContent = method.hint;
  }

  /** @param {(method: import('../core/methods/PropagationMethod.js').PropagationMethod) => void} callback */
  onChange(callback) {
    this.listeners.push(callback);
  }

  #render() {
    this.optionsContainer.replaceChildren(
      ...this.methods.map((method) => {
        const label = document.createElement('label');
        label.className = 'segment';
        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'method';
        input.value = method.id;
        input.addEventListener('change', () => {
          this.value = method;
          this.listeners.forEach((callback) => callback(method));
        });
        const text = document.createElement('span');
        text.textContent = method.label;
        label.append(input, text);
        return label;
      }),
    );
    this.value = this.selected;
  }
}
