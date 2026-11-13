# Testes do Connect+

O site continua estático (sem build). O `package.json` existe só para os testes.

## Como rodar

```bash
npm install                      # uma vez
npx playwright install chromium  # uma vez, para os testes E2E

npm test             # unitários + integração (node:test + jsdom), ~7 s
npm run test:e2e     # ponta a ponta no Chromium (Playwright), ~4 s
npm run test:cov     # cobertura de js/dominio/*, storage.js, api.js e util.js (rodados via require ou node:vm)
npm run test:cov:ui  # cobertura aproximada dos scripts rodados dentro do jsdom (sem js/dominio/*)
```

Nenhum teste chama o Apps Script de verdade. A API é sempre simulada por [apoio/api-falsa.js](apoio/api-falsa.js).

## Estrutura

| Pasta | O que tem | Ferramenta |
|---|---|---|
| `unit/` | funções isoladas: sessão, contrato da API, máscara, `repositorio.js` (com storage falso) e todos os módulos de `js/dominio/` (via `require`) | `node:test` |
| `integracao/` | as páginas **reais** (`app.html`, `login.html`, `index.html`, `termos.html`) com os scripts na ordem real | `node:test` + jsdom |
| `e2e/` | login, sessão por aba ou aparelho, conversa, tarefa persistida | Playwright |
| `apoio/` | carregador do jsdom, dublê da API, carregador de script via `node:vm`, cobertura da UI | — |

`carregarPagina` fecha sozinho as páginas que um teste esquecer aberta; sem isso, o polling do `chat.js` deixaria o processo travado depois de uma falha.

O "agora" das páginas no jsdom é fixo: quarta-feira, 11/11/2026, 10:00 (America/Sao_Paulo).

## Testes de caracterização

Estes testes descrevem o que o código **faz hoje**, não o que deveria fazer. Eles existem para proteger a refatoração. Se um teste quebrar durante uma refatoração, o comportamento mudou, e isso precisa ser intencional.

Os testes com nome **"BUG CONHECIDO"** fixam bugs que decidimos não corrigir agora. Quando um deles for corrigido, inverta o teste no mesmo PR.

| Bug | Teste |
|---|---|
| D4: o assistente não roda ao enviar pelo chat | `integracao/assistente.test.js` |
| D5: criar tarefa com conversa da API aberta troca o painel pela conversa da IA | `integracao/app.test.js` |
| D6: a memória é apagada a cada carregamento | `integracao/app.test.js` |
| D7: a conversa da IA consulta a API com `conversaId: 1` | `integracao/chat.test.js` |
| D8: `id="erro-contato"` duplicado no modal | `integracao/app.test.js` |
| "amanhã" com til não é reconhecido (`\b` + `ã`) | `unit/compromisso.test.js` |
| "às 10" sem "h" não vira horário | `unit/compromisso.test.js` |
| data inexistente (31/02) é aceita | `unit/compromisso.test.js` |

## Cobertura base (antes da refatoração)

| Arquivo | Linhas | Como foi medido |
|---|---|---|
| `storage.js`, `api.js`, `util.js` | 100% | `npm run test:cov` |
| `auth.js` | 98,3% | `npm run test:cov:ui` |
| `chat.js` | 92,2% | `npm run test:cov:ui` |
| `login.js` | 90,2% | `npm run test:cov:ui` |
| `termos.js` | 87,5% | `npm run test:cov:ui` |
| `app.js` | 81,9% | `npm run test:cov:ui` |
| **UI (todos via jsdom)** | **85,2%** | `npm run test:cov:ui` |

O `test:cov:ui` é conservador: uma linha só conta se estiver inteira executada. A tabela acima é a base **antes da refatoração**. O que faltava em `app.js` era quase todo código morto ou inalcançável: o chat local, os grupos e a `ConnectAI`.

| Depois da fase | UI (todos via jsdom) |
|---|---|
| F2 (código morto removido) | 89,1% |
| F3 (formato.js extraído) | 87,8% (`js/dominio/formato.js` fora da conta: 100% em `test:cov`) |
| F4 (assistente e votação extraídos) | 86,9% (`js/dominio/*` fora da conta: ≥ 96% em `test:cov`) |
| F5 (repositorio.js extraído) | 87,2% (inclui `repositorio.js`; 100% em `test:cov`) |
| F6 (app.js dividido) | 87,2% (igual: só movimentação) |

Depois da F6, a cobertura por arquivo mostra onde está o que falta: `conversas.js` 28% (chat local antigo, inalcançável pela interface, D4) e `modal.js` 72% (ramos de grupos, que dependem do bloco comentado de `app.js`). Os demais módulos de funcionalidade estão entre 91% e 100%.
