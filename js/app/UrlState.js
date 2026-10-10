/**
 * Guarda a equação e os valores na URL (depois do "#"),
 * para que o usuário possa compartilhar um link com o cálculo pronto.
 *
 * @typedef {{ equation: string, values: Record<string, [string, string]>, method?: string }} AppState
 */
export class UrlState {
  constructor(location = window.location, history = window.history) {
    this.location = location;
    this.history = history;
  }

  /** @returns {AppState | null} */
  read() {
    const params = new URLSearchParams(this.location.hash.slice(1));
    const equation = params.get('eq');
    if (!equation) return null;
    let values = {};
    try {
      values = JSON.parse(params.get('v') ?? '{}');
    } catch {
      // Link corrompido: usa só a equação.
    }
    return { equation, values, method: params.get('m') ?? undefined };
  }

  /** @param {AppState} state */
  write({ equation, values, method }) {
    const params = new URLSearchParams();
    if (equation.trim()) {
      params.set('eq', equation);
      params.set('v', JSON.stringify(values));
      if (method) params.set('m', method);
    }
    const hash = params.toString();
    this.history.replaceState(null, '', hash ? `#${hash}` : this.location.pathname + this.location.search);
  }

  /** Link completo para o estado atual. */
  get href() {
    return this.location.href;
  }
}
