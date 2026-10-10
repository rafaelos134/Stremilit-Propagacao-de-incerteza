/**
 * Campo da equação, com pré-visualização em LaTeX e botões de exemplo.
 */
export class EquationInput {
  /**
   * @param {object} elements
   * @param {HTMLInputElement} elements.input
   * @param {HTMLElement} elements.preview
   * @param {HTMLElement} elements.examples container dos botões de exemplo
   * @param {import('./LatexRenderer.js').LatexRenderer} renderer
   */
  constructor({ input, preview, examples }, renderer) {
    this.input = input;
    this.preview = preview;
    this.examplesContainer = examples;
    this.renderer = renderer;
  }

  get value() {
    return this.input.value;
  }

  set value(text) {
    this.input.value = text;
  }

  /** @param {(text: string) => void} callback */
  onInput(callback) {
    this.input.addEventListener('input', () => callback(this.value));
  }

  /**
   * @param {import('../app/examples.js').Example[]} examples
   * @param {(example: import('../app/examples.js').Example) => void} onSelect
   */
  renderExamples(examples, onSelect) {
    this.examplesContainer.replaceChildren(
      ...examples.map((example) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chip';
        button.textContent = example.title;
        button.title = example.equation;
        button.addEventListener('click', () => onSelect(example));
        return button;
      }),
    );
  }

  showPreview(tex) {
    this.input.removeAttribute('aria-invalid');
    this.preview.classList.remove('is-error', 'is-empty');
    this.renderer.render(this.preview, tex);
  }

  showError(message) {
    this.input.setAttribute('aria-invalid', 'true');
    this.preview.classList.add('is-error');
    this.preview.classList.remove('is-empty');
    this.preview.textContent = message;
  }

  showEmpty() {
    this.input.removeAttribute('aria-invalid');
    this.preview.classList.remove('is-error');
    this.preview.classList.add('is-empty');
    this.preview.textContent = 'A pré-visualização da equação aparece aqui.';
  }
}
