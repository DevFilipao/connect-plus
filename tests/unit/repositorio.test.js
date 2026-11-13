const { test, describe } = require("node:test");
const assert = require("node:assert/strict");
const { criarRepositorio, CHAVES } = require("../../js/repositorio");
const { criarStorage } = require("../apoio/carregar-script");

const TAREFAS = [{ id: 2, titulo: "Lavar", descricao: "Carro", data: "2026-11-01", concluida: true }];
const EVENTOS = [{ id: 3, titulo: "Festa", data: "2026-12-20", horario: "21:00", local: "Clube", descricao: "" }];
const ENQUETES = [{ id: 4, pergunta: "Qual dia?", opcoes: [{ texto: "Sábado", votos: 1 }, { texto: "Domingo", votos: 0 }], voto: 0 }];
const GRUPOS = [{ id: 5, tipo: "grupo", nome: "Futsal", avatar: "F", descricao: "Grupo · 2 participantes", membros: [{ nome: "Ana", telefone: "11999990000" }], mensagens: [] }];

describe("chaves de armazenamento (contrato com dados já salvos nos navegadores)", () => {
    test("os nomes não mudam", () => {
        assert.deepEqual(CHAVES, {
            tarefas: "connect_tarefas",
            eventos: "connect_eventos",
            enquetes: "connect_enquetes",
            memoria: "connect_memoria",
            grupos: "connect_grupos",
            conversas: "connect_conversas"
        });
    });
});

describe("carregar", () => {
    const CASOS = [
        ["carregarTarefas", "connect_tarefas", TAREFAS],
        ["carregarEventos", "connect_eventos", EVENTOS],
        ["carregarEnquetes", "connect_enquetes", ENQUETES],
        ["carregarGrupos", "connect_grupos", GRUPOS]
    ];

    for (const [metodo, chave, dados] of CASOS) {
        test(`${metodo}: lê o que está salvo`, () => {
            const repo = criarRepositorio(criarStorage({ [chave]: JSON.stringify(dados) }));
            assert.deepEqual(repo[metodo](), dados);
        });

        test(`${metodo}: sem nada salvo devolve lista vazia`, () => {
            assert.deepEqual(criarRepositorio(criarStorage())[metodo](), []);
        });

        test(`${metodo}: JSON inválido devolve lista vazia`, () => {
            const repo = criarRepositorio(criarStorage({ [chave]: "{quebrado" }));
            assert.deepEqual(repo[metodo](), []);
        });
    }

    test("string vazia salva conta como ausente", () => {
        const repo = criarRepositorio(criarStorage({ connect_tarefas: "" }));
        assert.deepEqual(repo.carregarTarefas(), []);
    });

    test("storage que lança ao ler (acesso bloqueado) devolve lista vazia", () => {
        const bloqueado = { getItem() { throw new Error("SecurityError"); } };
        assert.deepEqual(criarRepositorio(bloqueado).carregarTarefas(), []);
    });

    test("a lista devolvida é nova a cada leitura", () => {
        const repo = criarRepositorio(criarStorage());
        assert.notEqual(repo.carregarTarefas(), repo.carregarTarefas());
    });

    test("JSON válido que não é lista é devolvido como está (sem validação, como antes)", () => {
        const repo = criarRepositorio(criarStorage({ connect_tarefas: "null", connect_eventos: "{\"a\":1}" }));
        assert.equal(repo.carregarTarefas(), null);
        assert.deepEqual(repo.carregarEventos(), { a: 1 });
    });
});

describe("salvar", () => {
    const tudo = { tarefas: TAREFAS, eventos: EVENTOS, enquetes: ENQUETES, memoria: [], grupos: GRUPOS };

    test("grava as cinco chaves em JSON", () => {
        const storage = criarStorage();
        criarRepositorio(storage).salvar(tudo);
        assert.equal(storage.getItem("connect_tarefas"), JSON.stringify(TAREFAS));
        assert.equal(storage.getItem("connect_eventos"), JSON.stringify(EVENTOS));
        assert.equal(storage.getItem("connect_enquetes"), JSON.stringify(ENQUETES));
        assert.equal(storage.getItem("connect_memoria"), "[]");
        assert.equal(storage.getItem("connect_grupos"), JSON.stringify(GRUPOS));
    });

    test("grava na ordem tarefas, eventos, enquetes, memória, grupos", () => {
        const ordem = [];
        const storage = { setItem: chave => ordem.push(chave) };
        criarRepositorio(storage).salvar(tudo);
        assert.deepEqual(ordem, ["connect_tarefas", "connect_eventos", "connect_enquetes", "connect_memoria", "connect_grupos"]);
    });

    test("não toca em outras chaves (sessão, lembretes antigos)", () => {
        const storage = criarStorage({ sessao: "{\"token\":\"t\"}", connect_lembretes: "[1]" });
        criarRepositorio(storage).salvar(tudo);
        assert.equal(storage.getItem("sessao"), "{\"token\":\"t\"}");
        assert.equal(storage.getItem("connect_lembretes"), "[1]");
    });

    test("erro do storage (cota cheia) não é engolido", () => {
        const cheio = { setItem() { throw new Error("QuotaExceededError"); } };
        assert.throws(() => criarRepositorio(cheio).salvar(tudo), /QuotaExceededError/);
    });

    test("ler e salvar de volta mantém os dados idênticos (sem migração)", () => {
        const original = {
            connect_tarefas: JSON.stringify(TAREFAS),
            connect_eventos: JSON.stringify(EVENTOS),
            connect_enquetes: JSON.stringify(ENQUETES),
            connect_grupos: JSON.stringify(GRUPOS)
        };
        const storage = criarStorage(original);
        const repo = criarRepositorio(storage);
        repo.salvar({
            tarefas: repo.carregarTarefas(),
            eventos: repo.carregarEventos(),
            enquetes: repo.carregarEnquetes(),
            memoria: [],
            grupos: repo.carregarGrupos()
        });
        for (const [chave, valor] of Object.entries(original)) {
            assert.equal(storage.getItem(chave), valor, chave);
        }
    });
});

describe("limparConversasEMemoria", () => {
    test("remove só connect_conversas e connect_memoria", () => {
        const storage = criarStorage({
            connect_conversas: "[1]",
            connect_memoria: "[2]",
            connect_tarefas: "[3]",
            connect_grupos: "[4]",
            sessao: "{}"
        });
        criarRepositorio(storage).limparConversasEMemoria();
        assert.equal(storage.getItem("connect_conversas"), null);
        assert.equal(storage.getItem("connect_memoria"), null);
        assert.equal(storage.getItem("connect_tarefas"), "[3]");
        assert.equal(storage.getItem("connect_grupos"), "[4]");
        assert.equal(storage.getItem("sessao"), "{}");
    });

    test("sem nada salvo não falha", () => {
        assert.doesNotThrow(() => criarRepositorio(criarStorage()).limparConversasEMemoria());
    });
});
