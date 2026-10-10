import { math } from './math.js';
import { InputError } from './errors.js';
import { nodeTex, symbolTex } from './latex.js';

/** Símbolos tratados como constantes, e não como variáveis medidas. */
export const CONSTANTS = new Set(['pi', 'e']);

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Atalhos de escrita aceitos além da sintaxe do math.js
 * (para quem vem do Python ou usa a notação brasileira).
 */
const SHORTCUTS = [
  [/\*\*/g, '^'],
  [/\bln\s*\(/g, 'log('],
  [/\bsen\s*\(/g, 'sin('],
  [/\btg\s*\(/g, 'tan('],
  [/\barcsen\s*\(/g, 'asin('],
  [/\barctg\s*\(/g, 'atan('],
];

/**
 * Lista as variáveis de uma expressão (sem nomes de funções nem constantes), na ordem em que aparecem.
 * @param {import('mathjs').MathNode} node
 * @returns {string[]}
 */
export function findVariables(node) {
  const names = [];
  node.traverse((child, path, parent) => {
    if (!child.isSymbolNode) return;
    if (parent?.isFunctionNode && path === 'fn') return;
    if (CONSTANTS.has(child.name) || names.includes(child.name)) return;
    names.push(child.name);
  });
  return names;
}

/**
 * Uma equação do tipo "V = (B + b) * h / 2".
 * Detecta automaticamente as variáveis do lado direito.
 */
export class Equation {
  /** @param {string} text */
  constructor(text) {
    const raw = String(text ?? '').trim();
    if (!raw) {
      throw new InputError('Digite uma equação, por exemplo: V = (B + b) * h / 2');
    }

    const sides = raw.split('=');
    if (sides.length > 2) {
      throw new InputError('A equação deve ter no máximo um sinal de "=".');
    }
    const [lhs, rhs] = sides.length === 2 ? sides : ['f', sides[0]];

    this.resultName = lhs.trim() || 'f';
    if (!IDENTIFIER.test(this.resultName)) {
      throw new InputError(`"${this.resultName}" não é um nome válido para o resultado. Use letras, números e "_".`);
    }
    if (!rhs.trim()) {
      throw new InputError('Escreva a expressão do lado direito do "=".');
    }

    this.expression = Equation.normalize(rhs);
    try {
      this.node = math.parse(this.expression);
    } catch (error) {
      throw new InputError(`Não foi possível entender a expressão: ${error.message}`);
    }

    Equation.#assertKnownFunctions(this.node);
    this.variables = findVariables(this.node);
    if (this.variables.includes(this.resultName)) {
      throw new InputError(`"${this.resultName}" aparece dos dois lados da equação.`);
    }
  }

  /** Aplica os atalhos de escrita (**, ln, sen, tg...). */
  static normalize(expression) {
    return SHORTCUTS.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), expression.trim());
  }

  static #assertKnownFunctions(node) {
    node.traverse((child) => {
      if (child.isFunctionNode && typeof math[child.fn.name] !== 'function') {
        throw new InputError(`A função "${child.fn.name}" não é conhecida.`);
      }
    });
  }

  /** LaTeX do nome do resultado. */
  get resultTex() {
    return symbolTex(this.resultName);
  }

  /** LaTeX da equação completa. */
  get tex() {
    return `${this.resultTex} = ${nodeTex(this.node)}`;
  }

  /**
   * Calcula o valor numérico da expressão.
   * @param {Record<string, number>} scope
   */
  evaluate(scope) {
    return this.node.evaluate(scope);
  }
}
