// Carrega uma página REAL do projeto (HTML + scripts na ordem real) dentro do jsdom.
// Nada do código de produção é alterado: os stubs entram em beforeParse.
//
// Funções declaradas no topo dos scripts clássicos ficam em `window`
// (ex.: window.extrairCompromisso). `const`/`let` de topo NÃO ficam.

process.env.TZ = "America/Sao_Paulo";

const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole, requestInterceptor } = require("jsdom");
const LocationImpl = require("jsdom/lib/jsdom/living/window/Location-impl.js").implementation;
const { criarApiFalsa } = require("./api-falsa");

const { RAIZ } = require("./caminhos");

// Quarta-feira, 11/11/2026, 10:00 em São Paulo.
const AGORA_PADRAO = Date.parse("2026-11-11T10:00:00-03:00");

// O jsdom não navega para outro documento e não deixa sobrescrever
// location.replace. Interceptamos a navegação e só registramos o destino.
const navegarOriginal = LocationImpl.prototype._locationObjectNavigate;
LocationImpl.prototype._locationObjectNavigate = function (url, flags = {}) {
    const janela = this._relevantDocument._defaultView;
    const atual = this._relevantDocument._URL;
    const soHash = url.fragment !== null &&
        url.scheme === atual.scheme && url.host === atual.host &&
        url.path.join("/") === atual.path.join("/") && url.query === atual.query;
    if (soHash || !janela || !janela.__navegacoes) {
        return navegarOriginal.call(this, url, flags);
    }
    const destino = new URL(serializar(url));
    janela.__navegacoes.push({
        destino: destino.pathname.replace(/^\//, "") + destino.search + destino.hash,
        substituir: Boolean(flags.replacement)
    });
};

function serializar(url) {
    return require("whatwg-url").serializeURL(url);
}

const TIPOS = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".svg": "image/svg+xml" };

// Serve http://localhost:8080/* direto do disco; qualquer outro host é bloqueado.
const servirDoDisco = requestInterceptor(request => {
    const url = new URL(request.url);
    if (url.host === "fonts.googleapis.com" || url.host === "fonts.gstatic.com") {
        return new Response("", { headers: { "content-type": "text/css" } });
    }
    if (url.host !== "localhost:8080") {
        return new Response("bloqueado nos testes", { status: 599 });
    }
    const arquivo = path.join(RAIZ, decodeURIComponent(url.pathname));
    if (!arquivo.startsWith(RAIZ) || !fs.existsSync(arquivo)) {
        return new Response("não encontrado", { status: 404 });
    }
    return new Response(fs.readFileSync(arquivo), {
        headers: { "content-type": TIPOS[path.extname(arquivo)] || "application/octet-stream" }
    });
});

// Relógio que começa em `inicio` e anda junto com o tempo real.
function instalarRelogio(window, inicio) {
    const DataReal = window.Date;
    const t0 = DataReal.now();
    const agora = () => inicio + (DataReal.now() - t0);
    class DataFixa extends DataReal {
        constructor(...args) {
            if (args.length === 0) super(agora());
            else super(...args);
        }
        static now() {
            return agora();
        }
    }
    window.Date = DataFixa;
}

function instalarStubs(window) {
    const proto = window.HTMLDialogElement.prototype;
    proto.showModal = function () {
        this.setAttribute("open", "");
    };
    proto.show = proto.showModal;
    proto.close = function () {
        if (!this.hasAttribute("open")) return;
        this.removeAttribute("open");
        this.dispatchEvent(new window.Event("close"));
    };
    window.Element.prototype.scrollIntoView = function () {};
    window.scrollTo = function () {};
}

function semear(armazenamento, valores) {
    for (const [chave, valor] of Object.entries(valores || {})) {
        armazenamento.setItem(chave, typeof valor === "string" ? valor : JSON.stringify(valor));
    }
}

/**
 * @param {string} arquivo  ex.: "app.html"
 * @param {object} [opcoes]
 * @param {object} [opcoes.local]    pares chave/valor para localStorage (objeto → JSON)
 * @param {object} [opcoes.sessao]   pares chave/valor para sessionStorage
 * @param {object} [opcoes.api]      instância de criarApiFalsa()
 * @param {number} [opcoes.agora]    epoch ms do "agora" da página
 * @param {string} [opcoes.hash]     ex.: "#privacidade"
 * @param {string} [opcoes.referrer]
 */
async function carregarPagina(arquivo, opcoes = {}) {
    const api = opcoes.api || criarApiFalsa();
    const alertas = [];
    const navegacoes = [];
    const erros = [];

    const virtualConsole = new VirtualConsole();
    virtualConsole.on("jsdomError", e => erros.push(e));

    let aoCarregar;
    const carregou = new Promise(resolve => { aoCarregar = resolve; });

    const dom = await JSDOM.fromFile(path.join(RAIZ, arquivo), {
        url: `http://localhost:8080/${arquivo}${opcoes.hash || ""}`,
        referrer: opcoes.referrer,
        runScripts: "dangerously",
        resources: { interceptors: [servirDoDisco] },
        pretendToBeVisual: true, // document.hidden === false (o polling do chat.js depende disso)
        virtualConsole,
        beforeParse(window) {
            window.__navegacoes = navegacoes;
            instalarRelogio(window, opcoes.agora ?? AGORA_PADRAO);
            instalarStubs(window);
            window.alert = mensagem => { alertas.push(String(mensagem)); };
            window.fetch = api.fetch;
            semear(window.localStorage, opcoes.local);
            semear(window.sessionStorage, opcoes.sessao);
            window.addEventListener("load", aoCarregar);
        }
    });

    await carregou;
    const { window } = dom;

    return {
        dom,
        window,
        document: window.document,
        api,
        alertas,
        navegacoes,
        erros,
        $: seletor => window.document.querySelector(seletor),
        $$: seletor => [...window.document.querySelectorAll(seletor)],
        lerLocal: chave => {
            const bruto = window.localStorage.getItem(chave);
            try { return JSON.parse(bruto); } catch { return bruto; }
        },
        // Dispara submit sem a validação HTML (testa só a lógica JS).
        submeter(alvo) {
            const form = typeof alvo === "string" ? window.document.querySelector(alvo) : alvo;
            form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
        },
        clicar(alvo) {
            const el = typeof alvo === "string" ? window.document.querySelector(alvo) : alvo;
            el.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true }));
        },
        digitar(alvo, valor) {
            const el = typeof alvo === "string" ? window.document.querySelector(alvo) : alvo;
            el.value = valor;
            el.dispatchEvent(new window.Event("input", { bubbles: true }));
        },
        fechar: () => window.close()
    };
}

const esperar = ms => new Promise(resolve => setTimeout(resolve, ms));

// Espera a fila de microtarefas/fetch falso assentar.
const assentar = () => esperar(20);

module.exports = { carregarPagina, esperar, assentar, AGORA_PADRAO, RAIZ };

// Atalho: app.html com usuário logado (sessão "lembrada" em localStorage).
const SESSAO_PADRAO = { token: "tok-123", nome: "Maria Souza", telefone: "11987654321" };

async function carregarApp(opcoes = {}) {
    const local = { sessao: SESSAO_PADRAO, ...(opcoes.local || {}) };
    const pagina = await carregarPagina("app.html", { ...opcoes, local });
    await assentar(); // carregarConversas() inicial do chat.js
    return pagina;
}

module.exports.carregarApp = carregarApp;
module.exports.SESSAO_PADRAO = SESSAO_PADRAO;
