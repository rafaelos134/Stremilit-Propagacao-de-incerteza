import { PartialDerivativesMethod } from './PartialDerivativesMethod.js';
import { PowerLawMethod } from './PowerLawMethod.js';

/**
 * Métodos disponíveis na interface, na ordem em que aparecem.
 * O primeiro é o padrão.
 */
export const METHODS = [new PartialDerivativesMethod(), new PowerLawMethod()];

/** @param {string | null | undefined} id */
export function findMethod(id) {
  return METHODS.find((method) => method.id === id) ?? METHODS[0];
}
