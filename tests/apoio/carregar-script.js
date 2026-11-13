// Executa UM script clássico do projeto num contexto isolado (node:vm), sem DOM.
// Os `var`/funções de topo viram propriedades do contexto devolvido.
// Usado nos unitários de arquivos pequenos que ainda não exportam nada (storage.js, api.js, util.js).

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { RAIZ } = require("./caminhos");

function carregarScript(relativo, globais = {}) {
    const arquivo = path.join(RAIZ, relativo);
    const contexto = vm.createContext({ console, ...globais });
    vm.runInContext(fs.readFileSync(arquivo, "utf8"), contexto, { filename: arquivo });
    return contexto;
}

// Storage em memória com a mesma interface do Web Storage.
function criarStorage(inicial = {}) {
    const dados = new Map(Object.entries(inicial));
    return {
        getItem: chave => (dados.has(chave) ? dados.get(chave) : null),
        setItem: (chave, valor) => { dados.set(chave, String(valor)); },
        removeItem: chave => { dados.delete(chave); },
        clear: () => dados.clear(),
        get length() { return dados.size; },
        _dados: dados
    };
}

module.exports = { carregarScript, criarStorage };
