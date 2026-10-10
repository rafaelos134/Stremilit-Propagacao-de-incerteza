/**
 * Renderiza LaTeX usando o KaTeX carregado na página (window.katex).
 * Se o KaTeX não estiver disponível, mostra o código LaTeX como texto.
 */
export class LatexRenderer {
  constructor(katex = globalThis.katex) {
    this.katex = katex;
  }

  /**
   * @param {HTMLElement} element
   * @param {string} tex
   * @param {{ display?: boolean }} [options]
   */
  render(element, tex, { display = true } = {}) {
    element.dataset.tex = tex;
    if (!this.katex) {
      element.textContent = tex;
      return;
    }
    this.katex.render(tex, element, { displayMode: display, throwOnError: false });
  }

  /** Cria um elemento já com a fórmula renderizada. */
  create(tex, { display = true, tag = 'div', className = 'formula' } = {}) {
    const element = document.createElement(tag);
    element.className = className;
    this.render(element, tex, { display });
    return element;
  }
}
