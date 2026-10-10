# Calculadora de Propagação de Incertezas

Site estático (GitHub Pages) que calcula a propagação de incertezas por dois métodos, escolhidos ao lado da equação:

- **Derivadas parciais** (qualquer fórmula):

  $$\Delta y = \sqrt{\sum_i \left(\frac{\partial y}{\partial x_i}\,\Delta x_i\right)^2}$$

- **Caso particular** (produtos de potências, $y = c\,x_1^{p_1} x_2^{p_2}\cdots$), com os expoentes identificados automaticamente:

  $$\Delta y = |y|\sqrt{\sum_i \left(p_i\,\frac{\Delta x_i}{x_i}\right)^2}$$

Quando o caso particular se aplica, os dois métodos dão o mesmo resultado, pois $\partial y/\partial x_i = p_i\,y/x_i$.

O usuário digita a fórmula (ex.: `V = (B + b) * h / 2`), as variáveis são detectadas automaticamente, e o site mostra:

- o resultado arredondado (`V = 1.97 ± 0.11`) e a incerteza relativa;
- quanto cada variável contribui para a incerteza final;
- o passo a passo em LaTeX (fórmula geral, derivadas parciais, substituição), com botão para copiar;
- um link compartilhável com o cálculo preenchido.

Para mais detalhes sobre o método, veja o [material do Departamento de Física da UFMG](https://www.fisica.ufmg.br/ciclo-basico/wp-content/uploads/sites/4/2022/04/Aula1_Eletro.pdf).

## Estrutura do projeto

```
index.html                  Página (estrutura HTML)
css/styles.css              Estilos (tema claro/escuro automático, responsivo)
js/
  main.js                   Ponto de entrada: cria e inicia o App
  core/                     Regras de cálculo — sem nenhuma dependência do navegador
    Equation.js             Interpreta a fórmula e detecta as variáveis
    Measurement.js          Grandeza medida (valor ± incerteza) e leitura de texto
    PropagationResult.js    Resultado do cálculo (valor, incerteza, contribuição de cada variável)
    PropagationLatex.js     Base das fórmulas LaTeX do passo a passo
    methods/                Métodos de propagação (padrão Strategy)
      PropagationMethod.js  Classe base: valida, calcula o valor e monta o resultado
      PartialDerivativesMethod.js  Derivadas parciais (+ passo a passo)
      PowerLawMethod.js     Caso particular de potências (+ passo a passo)
      index.js              Lista de métodos exibidos na interface
    NumberFormatter.js      Formatação e arredondamento de valor ± incerteza
    latex.js                Conversão de variáveis/expressões para LaTeX
    math.js                 Instância compartilhada do math.js
    errors.js               InputError (erros exibidos ao usuário)
  ui/                       Componentes de interface (manipulam o DOM)
    MethodSelector.js       Seletor do método (ao lado de "Equação")
    EquationInput.js        Campo da fórmula, pré-visualização e exemplos
    VariableTable.js        Campos de valor/incerteza de cada variável
    ResultPanel.js          Resultado, contribuições e passo a passo
    LatexRenderer.js        Renderização com KaTeX
  app/                      Orquestração
    App.js                  Liga a interface ao núcleo de cálculo
    UrlState.js             Salva/lê o estado na URL (link compartilhável)
    examples.js             Lista de exemplos prontos
tests/                      Testes do núcleo (node:test)
legacy/                     Versão antiga em Python/Streamlit (apenas referência)
```

A regra principal de organização: **`core/` não conhece o HTML** e **`ui/` não faz contas**. O `App` é o único lugar que conhece os dois. Assim dá para testar todo o cálculo sem navegador e mudar a interface sem medo de quebrar a matemática.

### Bibliotecas

Não há etapa de build: os arquivos são servidos como estão e as bibliotecas vêm de CDN.

- [math.js](https://mathjs.org/) — interpreta a fórmula e calcula as derivadas simbólicas (mapeado por um *import map* no `index.html`).
- [KaTeX](https://katex.org/) — renderiza as fórmulas.

## Rodando localmente

Requer [Node.js](https://nodejs.org/) 20+ (só para testes e servidor local).

```bash
npm install     # instala o math.js para os testes
npm test        # roda os testes
npm start       # abre um servidor em http://localhost:8080
```

> Abrir o `index.html` direto pelo explorador de arquivos (`file://`) não funciona, porque navegadores bloqueiam módulos JavaScript nesse modo. Use `npm start` ou qualquer servidor estático (ex.: `python3 -m http.server`).

## Publicação (GitHub Pages)

O workflow `.github/workflows/deploy.yml` roda os testes e publica o site a cada push na branch `main`.

Na primeira vez, ative em **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Como contribuir

- **Adicionar um método de propagação:** crie uma subclasse de `PropagationMethod` (veja `PowerLawMethod.js` como modelo) e registre em `js/core/methods/index.js`. O seletor da interface é gerado a partir dessa lista.
- **Adicionar um exemplo:** inclua um objeto em `js/app/examples.js`.
- **Aceitar uma nova forma de escrita** (ex.: outra abreviação de função): edite `SHORTCUTS` em `js/core/Equation.js`.
- **Mudar o arredondamento:** `NumberFormatter.roundWithUncertainty` em `js/core/NumberFormatter.js`.
- **Mudar textos ou layout:** `index.html` e `css/styles.css`.
- Mensagens de erro para o usuário devem usar `InputError` (em português), para aparecerem na tela.
- Toda mudança em `js/core/` deve vir com teste em `tests/`. Rode `npm test` antes de abrir o PR.

## Versão anterior

A primeira versão, em Python com Streamlit, está em [`legacy/`](legacy/).
