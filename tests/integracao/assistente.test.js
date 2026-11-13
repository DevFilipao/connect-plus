const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { carregarApp, assentar, esperar } = require("../apoio/carregar-pagina");
const { criarApiFalsa, erro } = require("../apoio/api-falsa");

const QUADRO_MS = 800;

const conversa = (p, nome) => p.$$("#listaConversas .chat-contact").find(b => b.querySelector("strong").textContent === nome);

async function abrir(p, nome = "João Lima") {
    p.clicar(conversa(p, nome));
    await assentar();
}

async function enviar(p, texto) {
    p.$("#campoMensagem").value = texto;
    p.submeter("#formMensagem");
    await assentar();
}

const ordem = p => [...p.$("#mensagens").children].map(linha =>
    linha.classList.contains("ai-row")
        ? `[quadro] ${linha.querySelector("h4").textContent}`
        : linha.querySelector(".message-bubble").textContent);

const guardado = p => {
    const armazenamento = p.window.localStorage;
    const dados = {};
    for (let i = 0; i < armazenamento.length; i++) dados[armazenamento.key(i)] = armazenamento.getItem(armazenamento.key(i));
    return dados;
};

async function comConversa(corpo) {
    const p = await carregarApp();
    try {
        await abrir(p);
        await corpo(p);
    } finally { p.fechar(); }
}

describe("sugestões de tarefa e enquete", () => {
    const CASOS = [
        ["preciso estudar para a prova", "Criar tarefa"],
        ["não esquecer de comprar pão", "Criar tarefa"],
        ["qual dia vocês preferem?", "Criar enquete"],
        ["quem vai no jogo sábado? preciso levar bola", "Criar enquete"]
    ];
    for (const [texto, rotulo] of CASOS) {
        test(`${JSON.stringify(texto)} → '${rotulo}'`, () => comConversa(async p => {
            await enviar(p, texto);
            assert.equal(p.$("#sugestao").hidden, false);
            assert.equal(p.$("#criarAcao").textContent, rotulo);
        }));
    }

    test("mensagem neutra não sugere nada nem entra na memória", () => comConversa(async p => {
        await enviar(p, "bom dia");
        assert.equal(p.$("#sugestao").hidden, true);
        assert.deepEqual(p.lerLocal("connect_memoria"), []);
    }));

    test("uma mensagem neutra depois de uma sugestão esconde a sugestão", () => comConversa(async p => {
        await enviar(p, "preciso estudar");
        await enviar(p, "bom dia");
        assert.equal(p.$("#sugestao").hidden, true);
    }));

    test("trocar de conversa esconde a sugestão", () => comConversa(async p => {
        await enviar(p, "preciso estudar");
        await abrir(p, "CONNECT+ AI");
        assert.equal(p.$("#sugestao").hidden, true);
    }));

    test("'Criar tarefa' abre o modal com o texto enviado", () => comConversa(async p => {
        await enviar(p, "preciso estudar");
        p.clicar("#criarAcao");
        assert.equal(p.$("#modalTitulo").textContent, "Nova tarefa");
        assert.equal(p.$("#modalCampos #titulo").value, "preciso estudar");
        assert.equal(p.$("#sugestao").hidden, true);
    }));

    test("'Criar enquete' abre o modal com o texto como pergunta", () => comConversa(async p => {
        await enviar(p, "qual dia vocês preferem?");
        p.clicar("#criarAcao");
        assert.equal(p.$("#modalTitulo").textContent, "Nova enquete");
        assert.equal(p.$("#modalCampos #pergunta").value, "qual dia vocês preferem?");
    }));

    test("'Agora não' esconde a sugestão", () => comConversa(async p => {
        await enviar(p, "preciso estudar");
        p.clicar("#dispensarSugestao");
        assert.equal(p.$("#sugestao").hidden, true);
    }));

    test("sem sugestão, 'Criar' usa a última mensagem da conversa aberta", () => comConversa(async p => {
        p.clicar("#criarAcao");
        assert.equal(p.$("#modalTitulo").textContent, "Nova tarefa");
        assert.equal(p.$("#modalCampos #titulo").value, "Oi, Maria!");
    }));

    test("sem sugestão e sem conversa aberta, 'Criar' avisa por alert", async () => {
        const p = await carregarApp();
        try {
            p.clicar("#criarAcao");
            assert.deepEqual(p.alertas, ["Envie uma mensagem antes de criar uma tarefa."]);
        } finally { p.fechar(); }
    });
});

describe("memória", () => {
    test("mensagem relevante entra no topo da memória, com o nome da conversa e a data de hoje", () => comConversa(async p => {
        await enviar(p, "preciso estudar");
        await enviar(p, "qual dia vocês preferem?");
        assert.deepEqual(p.lerLocal("connect_memoria").map(m => ({ texto: m.texto, conversa: m.conversa, data: m.data })), [
            { texto: "qual dia vocês preferem?", conversa: "João Lima", data: "2026-11-11" },
            { texto: "preciso estudar", conversa: "João Lima", data: "2026-11-11" }
        ]);
        assert.deepEqual(p.$$("#resumoMemoria .memory-mini").map(e => e.textContent), ["qual dia vocês preferem?", "preciso estudar"]);
    }));

    test("o mesmo texto não é guardado duas vezes", () => comConversa(async p => {
        await enviar(p, "preciso estudar");
        await enviar(p, "preciso estudar");
        assert.equal(p.lerLocal("connect_memoria").length, 1);
    }));

    test("a memória sobrevive ao recarregar a página", async () => {
        const api = criarApiFalsa();
        const p = await carregarApp({ api });
        let salvo;
        try {
            await abrir(p);
            await enviar(p, "preciso estudar");
            salvo = guardado(p);
        } finally { p.fechar(); }

        const volta = await carregarApp({ api, local: salvo });
        try {
            assert.deepEqual(volta.lerLocal("connect_memoria").map(m => m.texto), ["preciso estudar"]);
            assert.deepEqual(volta.$$("#resumoMemoria .memory-mini").map(e => e.textContent), ["preciso estudar"]);
            volta.clicar('.menu-item[data-view="memoria"]');
            assert.match(volta.$("#listaMemoria").textContent, /preciso estudar/);
        } finally { volta.fechar(); }
    });

    test("excluir item da memória", () => comConversa(async p => {
        await enviar(p, "preciso estudar");
        p.clicar('.menu-item[data-view="memoria"]');
        p.clicar("#listaMemoria [data-delete-memory]");
        assert.deepEqual(p.lerLocal("connect_memoria"), []);
    }));

    test("mensagens dos outros não são analisadas", () => comConversa(async p => {
        p.api.estado.mensagens.push({ id: 2, conversaId: 10, de: "11911112222", nome: "João Lima", texto: "preciso estudar", dataHora: "2026-11-11T13:01:00.000Z" });
        await esperar(900);
        assert.equal(p.$$("#mensagens .message-bubble").length, 2);
        assert.equal(p.$("#sugestao").hidden, true);
        assert.deepEqual(p.lerLocal("connect_memoria"), []);
    }));
});

describe("quadro do compromisso", () => {
    const FRASE = "jogo sábado às 19h no Ginásio Central";

    test("aparece na conversa aberta, logo depois da mensagem enviada", () => comConversa(async p => {
        await enviar(p, FRASE);
        assert.equal(p.$("#sugestao").hidden, true);
        assert.equal(p.$$("#mensagens .ai-board").length, 0);
        await esperar(QUADRO_MS);
        assert.deepEqual(ordem(p), ["Oi, Maria!", FRASE, "[quadro] Jogo · Sábado"]);
        assert.deepEqual(p.$$("#mensagens .ai-board-info li").map(li => li.textContent),
            ["📅 14/11/2026", "🕒 19:00", "📍 Ginásio Central"]);
        assert.deepEqual(p.$$("#mensagens .ai-option-text").map(e => e.textContent), ["Vou", "Talvez", "Não vou"]);
    }));

    test("mensagens que chegam depois ficam abaixo do quadro", () => comConversa(async p => {
        await enviar(p, FRASE);
        await esperar(QUADRO_MS);
        p.api.estado.mensagens.push({ id: 200, conversaId: 10, de: "11911112222", nome: "João Lima", texto: "Fechado!", dataHora: "2026-11-11T13:05:00.000Z" });
        await esperar(700);
        assert.deepEqual(ordem(p), ["Oi, Maria!", FRASE, "[quadro] Jogo · Sábado", "Fechado!"]);
    }));

    test("evento vence tarefa na mesma frase ('reunião' + 'preciso')", () => comConversa(async p => {
        await enviar(p, "preciso ir na reunião");
        await esperar(QUADRO_MS);
        assert.equal(p.$("#mensagens .ai-board h4").textContent, "Reunião");
    }));

    test("é guardado por conversa, ancorado à mensagem que o originou", () => comConversa(async p => {
        await enviar(p, FRASE);
        await esperar(QUADRO_MS);
        const quadros = p.lerLocal("connect_quadros");
        assert.deepEqual(Object.keys(quadros), ["10"]);
        const [q] = quadros["10"];
        assert.equal(q.titulo, "Jogo · Sábado");
        assert.equal(q.depoisDe, 100);
        assert.equal(q.salvo, false);
        assert.equal(q.voto, null);
    }));

    test("só aparece na conversa em que foi criado", () => comConversa(async p => {
        await enviar(p, FRASE);
        await esperar(QUADRO_MS);
        await abrir(p, "CONNECT+ AI");
        assert.equal(p.$$("#mensagens .ai-board").length, 0);
        await abrir(p, "João Lima");
        assert.deepEqual(ordem(p), ["Oi, Maria!", FRASE, "[quadro] Jogo · Sábado"]);
    }));

    test("trocar de conversa antes de ele aparecer não o coloca na conversa errada", () => comConversa(async p => {
        await enviar(p, FRASE);
        await abrir(p, "CONNECT+ AI");
        await esperar(QUADRO_MS);
        assert.equal(p.$$("#mensagens .ai-board").length, 0);
        await abrir(p, "João Lima");
        assert.equal(p.$$("#mensagens .ai-board").length, 1);
    }));

    test("sobrevive ao recarregar a página, na mesma posição", async () => {
        const api = criarApiFalsa();
        const p = await carregarApp({ api });
        let salvo;
        try {
            await abrir(p);
            await enviar(p, FRASE);
            await esperar(QUADRO_MS);
            salvo = guardado(p);
        } finally { p.fechar(); }

        const volta = await carregarApp({ api, local: salvo });
        try {
            await abrir(volta);
            assert.deepEqual(ordem(volta), ["Oi, Maria!", FRASE, "[quadro] Jogo · Sábado"]);
        } finally { volta.fechar(); }
    });

    test("quadro guardado cuja mensagem não existe mais vai para o fim da conversa", async () => {
        const orfao = { id: 7, titulo: "Festa", data: "", horario: "", local: "", opcoes: [{ texto: "Vou", votos: 0 }], voto: null, salvo: false, depoisDe: 999, hora: "10:00" };
        const p = await carregarApp({ local: { connect_quadros: { 10: [orfao] } } });
        try {
            await abrir(p);
            assert.deepEqual(ordem(p), ["Oi, Maria!", "[quadro] Festa"]);
        } finally { p.fechar(); }
    });

    test("o polling não duplica o quadro", () => comConversa(async p => {
        await enviar(p, FRASE);
        await esperar(QUADRO_MS);
        await esperar(1200);
        assert.equal(p.$$("#mensagens .ai-board").length, 1);
    }));

    test("dois quadros na mesma conversa ficam na ordem em que foram criados", () => comConversa(async p => {
        await enviar(p, "jogo sábado");
        await esperar(QUADRO_MS);
        await enviar(p, "festa domingo");
        await esperar(QUADRO_MS);
        assert.deepEqual(ordem(p), ["Oi, Maria!", "jogo sábado", "[quadro] Jogo · Sábado", "festa domingo", "[quadro] Festa · Domingo"]);
    }));

    describe("votar e salvar", () => {
        const votos = p => p.$$("#mensagens .ai-option strong").map(e => Number(e.textContent));
        const opcao = (p, i) => p.$(`#mensagens [data-opcao="${i}"]`);

        test("votar, desfazer clicando de novo e trocar de opção", () => comConversa(async p => {
            await enviar(p, FRASE);
            await esperar(QUADRO_MS);
            p.clicar(opcao(p, 0));
            assert.deepEqual(votos(p), [1, 0, 0]);
            assert.ok(opcao(p, 0).classList.contains("voted"));
            assert.equal(opcao(p, 0).querySelector(".ai-option-bar").style.width, "100%");
            p.clicar(opcao(p, 0));
            assert.deepEqual(votos(p), [0, 0, 0]);
            p.clicar(opcao(p, 0));
            p.clicar(opcao(p, 2));
            assert.deepEqual(votos(p), [0, 0, 1]);
        }));

        test("votar não repinta as demais mensagens nem muda a posição do quadro", () => comConversa(async p => {
            await enviar(p, FRASE);
            await esperar(QUADRO_MS);
            const linhas = [...p.$("#mensagens").children];
            p.clicar(opcao(p, 1));
            const depois = [...p.$("#mensagens").children];
            assert.equal(depois.length, linhas.length);
            assert.equal(depois[0], linhas[0]);
            assert.equal(depois[1], linhas[1]);
            assert.deepEqual(ordem(p), ["Oi, Maria!", FRASE, "[quadro] Jogo · Sábado"]);
        }));

        test("o voto é guardado e sobrevive ao recarregar", async () => {
            const api = criarApiFalsa();
            const p = await carregarApp({ api });
            let salvo;
            try {
                await abrir(p);
                await enviar(p, FRASE);
                await esperar(QUADRO_MS);
                p.clicar(opcao(p, 1));
                salvo = guardado(p);
            } finally { p.fechar(); }

            const volta = await carregarApp({ api, local: salvo });
            try {
                await abrir(volta);
                assert.deepEqual(votos(volta), [0, 1, 0]);
                assert.ok(opcao(volta, 1).classList.contains("voted"));
            } finally { volta.fechar(); }
        });

        test("'Adicionar aos eventos' cria o evento uma vez e troca o botão pelo selo", () => comConversa(async p => {
            await enviar(p, FRASE);
            await esperar(QUADRO_MS);
            p.clicar("#mensagens [data-quadro-salvar]");
            assert.deepEqual(p.lerLocal("connect_eventos").map(e => ({ titulo: e.titulo, data: e.data, horario: e.horario, local: e.local, descricao: e.descricao })),
                [{ titulo: "Jogo · Sábado", data: "2026-11-14", horario: "19:00", local: "Ginásio Central", descricao: "" }]);
            assert.equal(p.$("#mensagens [data-quadro-salvar]"), null);
            assert.equal(p.$("#mensagens .ai-board-saved").textContent, "✓ Salvo em Eventos");
            assert.equal(p.lerLocal("connect_quadros")["10"][0].salvo, true);
        }));
    });
});

describe("robustez", () => {
    test("se o envio falha, o assistente não roda e o texto volta ao campo", async () => {
        const api = criarApiFalsa({ enviar: () => erro("Falhou.") });
        const p = await carregarApp({ api });
        try {
            await abrir(p);
            await enviar(p, "preciso estudar");
            assert.equal(p.$("#campoMensagem").value, "preciso estudar");
            assert.equal(p.$("#sugestao").hidden, true);
            assert.deepEqual(p.lerLocal("connect_memoria"), []);
        } finally { p.fechar(); }
    });

    test("um erro no assistente não desfaz o envio nem devolve o texto ao campo", () => comConversa(async p => {
        p.window.classificarMensagem = () => { throw new Error("quebrou"); };
        await enviar(p, "preciso estudar");
        assert.equal(p.$("#campoMensagem").value, "");
        assert.equal(p.api.doTipo("enviar").length, 1);
        assert.ok(p.$$("#mensagens .message-bubble").some(b => b.textContent === "preciso estudar"));
        assert.equal(p.$("#formMensagem button").disabled, false);
    }));

    test("enviar sem nenhuma conversa aberta não aciona o assistente", async () => {
        const p = await carregarApp();
        try {
            p.$("#campoMensagem").value = "preciso estudar";
            p.submeter("#formMensagem");
            await assentar();
            assert.equal(p.api.doTipo("enviar").length, 0);
            assert.equal(p.$("#sugestao").hidden, true);
        } finally { p.fechar(); }
    });
});
