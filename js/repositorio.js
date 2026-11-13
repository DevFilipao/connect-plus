const CHAVES = {
    tarefas: "connect_tarefas",
    eventos: "connect_eventos",
    enquetes: "connect_enquetes",
    memoria: "connect_memoria",
    grupos: "connect_grupos",
    conversas: "connect_conversas"
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

        limparConversasEMemoria() {
            storage.removeItem(CHAVES.conversas);
            storage.removeItem(CHAVES.memoria);
        },

        salvar({ tarefas, eventos, enquetes, memoria, grupos }) {
            gravar(CHAVES.tarefas, tarefas);
            gravar(CHAVES.eventos, eventos);
            gravar(CHAVES.enquetes, enquetes);
            gravar(CHAVES.memoria, memoria);
            gravar(CHAVES.grupos, grupos);
        }
    };
}

if (typeof module === "object" && module.exports) {
    module.exports = { criarRepositorio, CHAVES };
}
