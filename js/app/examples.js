/**
 * Exemplos prontos exibidos como atalhos na interface.
 * Para adicionar um novo, basta incluir um objeto nesta lista.
 *
 * @typedef {{ title: string, equation: string, values: Record<string, [string, string]> }} Example
 * @type {Example[]}
 */
export const EXAMPLES = [
  {
    title: 'Área do trapézio',
    equation: 'A = (B + b) * h / 2',
    values: { B: ['0.44', '0.02'], b: ['0.14', '0.02'], h: ['6.8', '0.2'] },
  },
  {
    title: 'Velocidade média',
    equation: 'v = d / t',
    values: { d: ['1.50', '0.01'], t: ['0.52', '0.02'] },
  },
  {
    title: 'Gravidade (pêndulo)',
    equation: 'g = 4 * pi^2 * L / T^2',
    values: { L: ['0.800', '0.005'], T: ['1.79', '0.02'] },
  },
  {
    title: 'Densidade (cilindro)',
    equation: 'rho = m / (pi * r^2 * h)',
    values: { m: ['25.3', '0.1'], r: ['1.00', '0.02'], h: ['3.00', '0.05'] },
  },
  {
    title: 'Componente de força',
    equation: 'F_x = F * cos(theta)',
    values: { F: ['12.0', '0.3'], theta: ['0.52', '0.01'] },
  },
];
