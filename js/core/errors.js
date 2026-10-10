/**
 * Erro causado por uma entrada inválida do usuário.
 * A mensagem é exibida diretamente na interface, por isso deve ser clara e em português.
 */
export class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
  }
}
