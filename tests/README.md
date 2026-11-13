# Testes do Connect+

O site continua estático (sem build). O `package.json` existe só para os testes.

## Como rodar

```bash
npm install                      # uma vez
npx playwright install chromium  # uma vez, para os testes E2E

npm test             # unitários + integração (node:test + jsdom), ~7 s
npm run test:e2e     # ponta a ponta no Chromium (Playwright), ~4 s
npm run test:cov     # cobertura de storage.js, api.js e util.js (rodados via node:vm)
npm run test:cov:ui  # cobertura aproximada dos scripts rodados dentro do jsdom
```

Nenhum teste chama o Apps Script de verdade. A API é sempre simulada por [apoio/api-falsa.js](apoio/api-falsa.js).

## Estrutura

| Pasta | O que tem | Ferramenta |
|---|---|---|
| `unit/` | funções isoladas: sessão, contrato da API, máscara, formatação, `extrairCompromisso` | `node:test` |
| `integracao/` | as páginas **reais** (`app.html`, `login.html`, `index.html`, `termos.html`) com os scripts na ordem real | `node:test` + jsdom |
| `e2e/` | login, sessão por aba ou aparelho, conversa, tarefa persistida | Playwright |
| `apoio/` | carregador do jsdom, dublê da API, carregador de script via `node:vm`, cobertura da UI | — |

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

O `test:cov:ui` é conservador: uma linha só conta se estiver inteira executada. O que falta em `app.js` é quase todo código morto ou inalcançável: o chat local (200–345), os grupos (1294–1339) e a `ConnectAI` (1380–1458).
