import { InputError } from './errors.js';

/** Aceita "±", "+-" ou "+/-" como separador entre valor e incerteza. */
const PLUS_MINUS = /\s*(?:±|\+\/-|\+-)\s*/;

/**
 * Uma grandeza medida: valor ± incerteza.
 */
export class Measurement {
  /**
   * @param {number} value
   * @param {number} [uncertainty=0]
   */
  constructor(value, uncertainty = 0) {
    if (!Number.isFinite(value)) {
      throw new InputError('O valor da medida precisa ser um número.');
    }
    if (!Number.isFinite(uncertainty) || uncertainty < 0) {
      throw new InputError('A incerteza precisa ser um número maior ou igual a zero.');
    }
    this.value = value;
    this.uncertainty = uncertainty;
  }

  /** Incerteza relativa (0.05 = 5%). */
  get relativeUncertainty() {
    return this.value === 0 ? Infinity : this.uncertainty / Math.abs(this.value);
  }

  /**
   * Converte um texto em número, aceitando vírgula decimal e notação científica.
   * @param {string} text
   * @param {string} [label] nome do campo, usado na mensagem de erro
   */
  static parseNumber(text, label = 'valor') {
    const normalized = String(text ?? '').replace(/\s+/g, '').replace(',', '.');
    if (normalized === '') {
      throw new InputError(`Preencha o campo "${label}".`);
    }
    const number = Number(normalized);
    if (!Number.isFinite(number)) {
      throw new InputError(`"${text}" não é um número válido (${label}).`);
    }
    return number;
  }

  /**
   * Cria uma medida a partir de um texto como "6.8 ± 0.2" ou "6,8+-0,2".
   * @param {string} text
   */
  static fromText(text) {
    const parts = Measurement.split(text);
    if (parts.length > 2) {
      throw new InputError(`"${text}" tem mais de um sinal ±.`);
    }
    const [value, uncertainty = '0'] = parts;
    return Measurement.fromParts(value, uncertainty);
  }

  /** Separa "6.8 ± 0.2" em ["6.8", "0.2"]. */
  static split(text) {
    return String(text ?? '').split(PLUS_MINUS);
  }

  /**
   * Cria uma medida a partir de dois campos separados.
   * @param {string} valueText
   * @param {string} uncertaintyText
   */
  static fromParts(valueText, uncertaintyText) {
    return new Measurement(
      Measurement.parseNumber(valueText, 'valor'),
      Math.abs(Measurement.parseNumber(uncertaintyText, 'incerteza')),
    );
  }

  /** Indica se o texto contém um sinal ± (útil para colar "valor±incerteza" num campo só). */
  static hasPlusMinus(text) {
    return PLUS_MINUS.test(String(text ?? ''));
  }
}
