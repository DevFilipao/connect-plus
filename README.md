# Connect+
 
> Um app de mensagens instantâneas inteligente que transforma conversas em ações.
 
## 📌 Sobre o projeto
 
O **Connect+** é um mensageiro com inteligência artificial que entende o contexto das conversas, identifica intenções e ajuda os usuários a organizar tarefas, eventos, decisões e compromissos, sem precisar sair do chat.
 
## ❗ Problema
 
Vários apps de mensagens não ajudam a transformar conversas em ações. Informações importantes, como datas de provas, compromissos, planos de viagem ou tarefas, podem ser esquecidas no meio das mensagens.
 
Além disso, quando uma conversa gera uma decisão (escolher uma data, organizar um passeio), os usuários precisam criar manualmente enquetes, eventos, listas ou lembretes. Isso desanima e muitas vezes acaba caindo no esquecimento da rotina.
 
O Connect+ vem para resolver isso.
 
## 🎯 Objetivo
 
Criar um app de mensagens instantâneas que utilize inteligência artificial para compreender o contexto das conversas, identificar intenções e auxiliar na organização de tarefas, eventos, decisões e compromissos.
 
## ⚙️ Como funciona
 
O Connect+ funciona, inicialmente, como um mensageiro comum, com **conversas individuais e em grupo**. Durante as conversas, a IA analisa o contexto para identificar situações que podem virar ações, ajudando o usuário a organizar seus compromissos.
 
### Exemplo de uso
 
Em um grupo de **futsal**, o capitão marca um jogo. A IA identifica a situação e monta automaticamente a lista com:
 
- quantidade de jogadores necessários;
- data;
- local;
- horário;
- entre outras informações relevantes.
## ✨ Funcionalidades esperadas
 
- [ ] Enviar e receber mensagens em tempo real
- [ ] Identificar determinados contextos nas conversas
- [ ] Sugerir a criação de enquetes, tarefas e planejamentos
- [ ] Armazenar informações importantes mencionadas pelos usuários
- [ ] Recuperar essas informações quando forem relevantes
- [ ] Auxiliar na organização de compromissos e atividades
## 🛠️ Tecnologias e materiais
 
| Categoria | Item |
|---|---|
| Front-end | HTML, CSS e JavaScript |
| Framework | A definir |
| Inteligência artificial | Um modelo de IA para análise de contexto |
| Banco de dados | Armazenamento de mensagens e informações importantes |
| Apoio | Google Sheets |
| Dispositivos | Computador / smartphone |
 
## 💡 Diferencial e inovação
 
O Connect+ é simples de usar e ajuda nas atividades do dia a dia: eventos, listas, horários e obrigações.
 
A combinação de **chat + memória contextual + inteligência artificial + transformação automática de conversas em ações** é o principal elemento inovador do projeto.
 
## 🚀 Resultado esperado
 
Desenvolver um **protótipo funcional** de aplicativo de mensagens capaz de entender o contexto das conversas e sugerir ações úteis aos usuários, conforme as funcionalidades listadas acima.
 
## ▶️ Como executar
 
O projeto é um site estático (sem instalação nem build). Basta servir a pasta:

```bash
# clone o repositório
git clone <url-do-repositorio>

# entre na pasta do projeto
cd connect-plus

# sirva os arquivos (mesma porta do .vscode/launch.json)
python3 -m http.server 8080
```

Depois abra <http://localhost:8080>. A página inicial leva ao login ou, se já houver sessão, ao app.

O back-end é um Web App do Google Apps Script. A URL dele fica em `API_URL`, no arquivo `js/api.js`.

### Estrutura

```text
connect-plus/
├── index.html      entrada: redireciona para login ou app
├── login.html      entrar / criar conta
├── app.html        app principal (conversas, tarefas, eventos, enquetes, memória)
├── termos.html     termos de uso e política de privacidade
├── css/            um estilo por página (login, app, termos)
└── js/
    ├── dominio/
    │   ├── formato.js      funções puras: escaparHTML, formatarData, dataISO, horaPtBR, formatarTelefone
    │   ├── compromisso.js  extrai tipo, data, horário e local de uma frase
    │   ├── assistente.js   classifica a mensagem: enquete, evento, tarefa ou nada
    │   └── votacao.js      regras de voto do quadro e das enquetes
    ├── storage.js  sessão no navegador
    ├── repositorio.js  leitura e gravação dos dados do app (tarefas, eventos, enquetes, grupos)
    ├── api.js      chamadas ao Apps Script
    ├── auth.js     login, cadastro e saída
    ├── chat.js     conversas ligadas à API
    ├── app.js      interface do app (usa os módulos de dominio/)
    ├── login.js    interface da tela de login
    ├── termos.js   interface dos termos
    └── util.js     liga a máscara de telefone a um campo
```
 
## 👥 Equipe
 
- Filipe
- Rayssa 
- Maria Eduarda
- Paulo Henrique
- Thayrone
- João Marcos

## 📄 Licença
 
_A definir._