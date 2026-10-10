/**
 * Conversão de nós do math.js para LaTeX com a notação usada em física:
 * variáveis em itálico, índices com "_" (x_1 -> x_{1}) e letras gregas por nome (theta -> \theta).
 */
const GREEK = new Set([
  'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda',
  'mu', 'nu', 'xi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
  'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Sigma', 'Phi', 'Psi', 'Omega',
]);

function nameTex(name) {
  if (name === 'pi') return '\\pi';
  if (GREEK.has(name)) return `\\${name}`;
  return name.length === 1 ? name : `\\mathit{${name}}`;
}

/**
 * Converte o nome de uma variável para LaTeX.
 * @param {string} name ex.: "x", "L_1", "theta_max"
 */
export function symbolTex(name) {
  const [base, ...rest] = name.split('_');
  if (!base) return `\\mathit{${name.replaceAll('_', '\\_')}}`;
  const subscript = rest.join('_');
  if (!subscript) return nameTex(base);
  let subTex = `\\mathrm{${subscript.replaceAll('_', '\\_')}}`;
  if (/^\d+$/.test(subscript)) subTex = subscript;
  if (GREEK.has(subscript)) subTex = `\\${subscript}`;
  return `${nameTex(base)}_{${subTex}}`;
}

const TEX_OPTIONS = {
  parenthesis: 'auto',
  implicit: 'hide',
  handler(node) {
    // O espaço inicial evita junções como "\\cdoth" quando o math.js concatena operadores.
    if (node.isSymbolNode && node.name !== 'e') return ` ${symbolTex(node.name)}`;
    return undefined; // usa o padrão do math.js
  },
};

/**
 * Converte uma expressão (nó do math.js) para LaTeX.
 * @param {import('mathjs').MathNode} node
 */
export function nodeTex(node) {
  return node.toTex(TEX_OPTIONS);
}
