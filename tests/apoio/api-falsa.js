// Dublê do Web App do Google Apps Script (back-end fora deste repositório).
// O contrato abaixo foi INFERIDO do cliente (js/api.js, js/auth.js, js/chat.js):
//   POST API_URL, corpo JSON enviado como text/plain: { acao, ...dados }
//   resposta: { ok: true, dados } | { ok: false, erro, codigo }
// Serve tanto ao jsdom (como window.fetch) quanto ao Playwright (page.route).

const API_URL_PADRAO = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/;

const USUARIO = { token: "tok-123", nome: "Maria Souza", telefone: "11987654321" };

function ok(dados) {
    return { ok: true, dados };
}

function erro(mensagem, codigo) {
    return codigo ? { ok: false, erro: mensagem, codigo } : { ok: false, erro: mensagem };
}

function criarEstado() {
    return {
        usuario: { ...USUARIO },
        senha: "segredo1",
        proximoId: 100,
        conversas: [{ id: 10, nome: "João Lima", telefone: "11911112222" }],
        mensagens: [
            { id: 1, conversaId: 10, de: "11911112222", nome: "João Lima", texto: "Oi, Maria!", dataHora: "2026-11-11T12:58:00.000Z" }
        ]
    };
}

const ACOES_PADRAO = {
    login(corpo, estado) {
        if (corpo.telefone !== estado.usuario.telefone || corpo.senha !== estado.senha) {
            return erro("Número ou senha incorretos.");
        }
        return ok({ ...estado.usuario });
    },
    logout() {
        return ok(null);
    },
    cadastro(corpo, estado) {
        estado.usuario = { token: "tok-novo", nome: corpo.nome, telefone: corpo.telefone };
        estado.senha = corpo.senha;
        return ok({ criado: true });
    },
    conversas(corpo, estado) {
        if (corpo.token !== estado.usuario.token) return erro("Sessão expirada.", "SESSAO");
        return ok(estado.conversas.map(c => ({ ...c })));
    },
    mensagens(corpo, estado) {
        if (corpo.token !== estado.usuario.token) return erro("Sessão expirada.", "SESSAO");
        return ok(estado.mensagens
            .filter(m => m.conversaId === corpo.conversaId && m.id > (corpo.depoisId || 0))
            .map(m => ({ ...m })));
    },
    enviar(corpo, estado) {
        if (corpo.token !== estado.usuario.token) return erro("Sessão expirada.", "SESSAO");
        const msg = {
            id: estado.proximoId++,
            conversaId: corpo.conversaId,
            de: estado.usuario.telefone,
            nome: estado.usuario.nome,
            texto: corpo.texto,
            dataHora: new Date().toISOString()
        };
        estado.mensagens.push(msg);
        return ok({ id: msg.id });
    },
    abrirConversa(corpo, estado) {
        if (corpo.token !== estado.usuario.token) return erro("Sessão expirada.", "SESSAO");
        const digitos = String(corpo.telefone || "").replace(/\D/g, "");
        if (digitos.length < 10) return erro("Número inválido.");
        const existente = estado.conversas.find(c => c.telefone === digitos);
        if (existente) return ok({ ...existente });
        const nova = { id: estado.proximoId++, nome: "Contato " + digitos.slice(-4), telefone: digitos };
        estado.conversas.push(nova);
        return ok({ ...nova });
    }
};

/**
 * @param {Record<string, (corpo, estado) => object>} sobrescritas  troca o handler de uma ação
 */
function criarApiFalsa(sobrescritas = {}) {
    const estado = criarEstado();
    const acoes = { ...ACOES_PADRAO, ...sobrescritas };
    const chamadas = [];

    // Registra a chamada e devolve o envelope (objeto já "serializado").
    function responder(corpoTexto, extra = {}) {
        const corpo = JSON.parse(corpoTexto);
        chamadas.push({ ...extra, corpoTexto, corpo });
        const handler = acoes[corpo.acao];
        const envelope = handler ? handler(corpo, estado) : erro("Ação desconhecida: " + corpo.acao);
        return JSON.parse(JSON.stringify(envelope));
    }

    // Substituto de window.fetch para o jsdom.
    async function fetch(url, init = {}) {
        const envelope = responder(init.body, {
            url: String(url),
            metodo: init.method || "GET",
            headers: { ...(init.headers || {}) }
        });
        return { ok: true, status: 200, json: async () => envelope };
    }

    return {
        fetch,
        responder,
        chamadas,
        estado,
        acoes,
        doTipo: acao => chamadas.filter(c => c.corpo && c.corpo.acao === acao)
    };
}

module.exports = { criarApiFalsa, ok, erro, USUARIO, API_URL_PADRAO };
