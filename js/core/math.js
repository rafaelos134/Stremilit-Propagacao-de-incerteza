/**
 * Instância única do math.js usada por todo o projeto.
 * Centralizar aqui facilita trocar a versão ou configurar a biblioteca.
 */
import { create, all } from 'mathjs';

export const math = create(all);
