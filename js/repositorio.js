const CHAVES = {
    tarefas: "connect_tarefas",
    eventos: "connect_eventos",
    enquetes: "connect_enquetes",
    memoria: "connect_memoria",
    grupos: "connect_grupos",
    conversas: "connect_conversas",
    quadros: "connect_quadros"
};

function criarRepositorio(storage) {
    function ler(chave, padrao) {
        try {
            const dados = storage.getItem(chave);
            return dados ? JSON.parse(dados) : padrao;
        } catch {
            return padrao;
        }
    }

    function gravar(chave, valor) {
        storage.setItem(chave, JSON.stringify(valor));
    }

    return {
        carregarTarefas: () => ler(CHAVES.tarefas, []),
        carregarEventos: () => ler(CHAVES.eventos, []),
        carregarEnquetes: () => ler(CHAVES.enquetes, []),
        carregarGrupos: () => ler(CHAVES.grupos, []),
        carregarMemoria: () => ler(CHAVES.memoria, []),

        carregarQuadros() {
            const quadros = ler(CHAVES.quadros, {});
            return quadros && typeof quadros === "object" && !Array.isArray(quadros) ? quadros : {};
        },

        limparConversasAntigas() {
            storage.removeItem(CHAVES.conversas);
        },

        salvar({ tarefas, eventos, enquetes, memoria, grupos, quadros }) {
            gravar(CHAVES.tarefas, tarefas);
            gravar(CHAVES.eventos, eventos);
            gravar(CHAVES.enquetes, enquetes);
            gravar(CHAVES.memoria, memoria);
            gravar(CHAVES.grupos, grupos);
            gravar(CHAVES.quadros, quadros);
        }
    };
}

if (typeof module === "object" && module.exports) {
    module.exports = { criarRepositorio, CHAVES };
}
