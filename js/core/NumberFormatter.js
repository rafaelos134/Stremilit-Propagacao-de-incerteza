/**
 * Formatação de números para texto e LaTeX, incluindo o arredondamento
 * de "valor ± incerteza" segundo a convenção usual de laboratório:
 * a incerteza fica com 1 algarismo significativo (2 se o primeiro for 1)
 * e o valor é arredondado na mesma casa decimal da incerteza.
 */
export class NumberFormatter {
  /**
   * @param {object} [options]
   * @param {number} [options.precision=6] algarismos significativos para valores "brutos"
   * @param {string} [options.decimalSeparator='.']
   */
  constructor({ precision = 6, decimalSeparator = '.' } = {}) {
    this.precision = precision;
    this.decimalSeparator = decimalSeparator;
  }

  /** Separa um número em mantissa (texto) e expoente de base 10. */
  static #splitExponential(number, digits) {
    const [mantissa, exponent] = number.toExponential(digits).split('e');
    return { mantissa, exponent: Number(exponent) };
  }

  /** Arredonda `x` para `decimals` casas (aceita valores negativos, ex.: -2 = centenas). */
  static round(x, decimals) {
    if (decimals >= 0) return Number(x.toFixed(Math.min(decimals, 100)));
    const factor = 10 ** -decimals;
    return Math.round(x / factor) * factor;
  }

  #localize(text) {
    return this.decimalSeparator === '.' ? text : text.replace('.', this.decimalSeparator);
  }

  /** Número com `precision` algarismos significativos, em notação científica se for muito grande/pequeno. */
  toText(number) {
    if (!Number.isFinite(number)) return String(number);
    if (number === 0) return '0';
    const exponent = Math.floor(Math.log10(Math.abs(number)));
    if (exponent >= 6 || exponent < -4) {
      const split = NumberFormatter.#splitExponential(number, this.precision - 1);
      return `${this.#localize(NumberFormatter.#trimZeros(split.mantissa))}e${split.exponent}`;
    }
    return this.#localize(String(Number(number.toPrecision(this.precision))));
  }

  /** Igual a `toText`, mas em LaTeX (ex.: 2.2 \times 10^{-3}). */
  toTex(number) {
    const text = this.toText(number);
    const [mantissa, exponent] = text.split('e');
    const tex = exponent === undefined ? mantissa : `${mantissa} \\times 10^{${exponent}}`;
    return number < 0 ? `\\left(${tex}\\right)` : tex;
  }

  static #trimZeros(mantissa) {
    return mantissa.includes('.') ? mantissa.replace(/\.?0+$/, '') : mantissa;
  }

  /**
   * Arredonda valor e incerteza juntos.
   * @returns {{ value: string, uncertainty: string, exponent: number }}
   *   `exponent` != 0 significa que o resultado deve ser lido como (value ± uncertainty) × 10^exponent.
   */
  roundWithUncertainty(value, uncertainty) {
    if (!(uncertainty > 0) || !Number.isFinite(uncertainty)) {
      return { value: this.toText(value), uncertainty: '0', exponent: 0 };
    }

    let decimals = NumberFormatter.#decimalsFor(uncertainty);
    let roundedUncertainty = NumberFormatter.round(uncertainty, decimals);
    // Ex.: 0.096 vira 0.1 — o primeiro algarismo passou a ser 1, então refaz com 2 algarismos.
    if (NumberFormatter.#splitExponential(roundedUncertainty, 0).exponent !== NumberFormatter.#splitExponential(uncertainty, 0).exponent) {
      decimals = NumberFormatter.#decimalsFor(roundedUncertainty);
      roundedUncertainty = NumberFormatter.round(uncertainty, decimals);
    }
    const roundedValue = NumberFormatter.round(value, decimals);

    const uncertaintyExponent = NumberFormatter.#splitExponential(roundedUncertainty, 0).exponent;
    if (decimals >= 0 && uncertaintyExponent >= -4) {
      return {
        value: this.#localize(roundedValue.toFixed(decimals)),
        uncertainty: this.#localize(roundedUncertainty.toFixed(decimals)),
        exponent: 0,
      };
    }

    // Notação científica com expoente comum.
    const exponent = roundedValue !== 0 && Math.abs(roundedValue) >= roundedUncertainty
      ? Math.floor(Math.log10(Math.abs(roundedValue)))
      : uncertaintyExponent;
    const mantissaDecimals = Math.max(0, decimals + exponent);
    const scale = 10 ** exponent;
    return {
      value: this.#localize((roundedValue / scale).toFixed(mantissaDecimals)),
      uncertainty: this.#localize((roundedUncertainty / scale).toFixed(mantissaDecimals)),
      exponent,
    };
  }

  /** Casas decimais que deixam a incerteza com 1 algarismo significativo (2 se começar com 1). */
  static #decimalsFor(uncertainty) {
    const { mantissa, exponent } = NumberFormatter.#splitExponential(uncertainty, 12);
    const significantDigits = mantissa.startsWith('1') ? 2 : 1;
    return significantDigits - 1 - exponent;
  }
}
