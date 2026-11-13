// Cobertura de linhas dos scripts executados DENTRO do jsdom.
//
// `node --test --experimental-test-coverage` só enxerga arquivos file://; os scripts
// que o jsdom roda têm URL http://localhost:8080/js/*.js e ficam de fora. Aqui rodamos
// a suíte com NODE_V8_COVERAGE e juntamos os blocos do V8 por arquivo.
//
// Critério (conservador): uma linha conta como coberta só se TODOS os seus caracteres
// de código foram executados. Linhas vazias e comentários não entram na conta.
// Uso: node tests/apoio/cobertura-ui.js

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { RAIZ } = require("./caminhos");

const SAIDA = path.join(RAIZ, "coverage", "v8");
fs.rmSync(SAIDA, { recursive: true, force: true });
fs.mkdirSync(SAIDA, { recursive: true });

const execucao = spawnSync(process.execPath,
    ["--test", "tests/unit/**/*.test.js", "tests/integracao/**/*.test.js"],
    { cwd: RAIZ, env: { ...process.env, NODE_V8_COVERAGE: SAIDA }, stdio: ["ignore", "ignore", "inherit"] });
if (execucao.status !== 0) {
    console.error("A suíte falhou; cobertura não calculada.");
    process.exit(execucao.status || 1);
}

// url → Uint8Array (1 = executado em algum processo)
const executado = new Map();

for (const arquivo of fs.readdirSync(SAIDA)) {
    const { result } = JSON.parse(fs.readFileSync(path.join(SAIDA, arquivo), "utf8"));
    for (const script of result) {
        const m = script.url.match(/^http:\/\/localhost:8080\/(js\/[\w/-]+\.js)$/);
        if (!m) continue;
        // js/dominio/* é puro e tem meta própria; é medido por `npm run test:cov` (require direto).
        if (m[1].startsWith("js/dominio/")) continue;
        const fonte = fs.readFileSync(path.join(RAIZ, m[1]), "utf8");
        const contagem = new Int32Array(fonte.length);
        const faixas = script.functions.flatMap(f => f.ranges)
            .sort((a, b) => a.startOffset - b.startOffset || b.endOffset - a.endOffset);
        for (const r of faixas) contagem.fill(r.count, r.startOffset, Math.min(r.endOffset, fonte.length));
        const marca = executado.get(m[1]) || new Uint8Array(fonte.length);
        for (let i = 0; i < fonte.length; i++) if (contagem[i] > 0) marca[i] = 1;
        executado.set(m[1], marca);
    }
}

// Marca os caracteres que são código (fora de comentários e espaços).
function mascaraDeCodigo(fonte) {
    const codigo = new Uint8Array(fonte.length);
    let i = 0;
    let aspas = null;
    while (i < fonte.length) {
        const c = fonte[i];
        const prox = fonte[i + 1];
        if (aspas) {
            codigo[i] = 1;
            if (c === "\\") { codigo[i + 1] = 1; i += 2; continue; }
            if (c === aspas) aspas = null;
            i++;
            continue;
        }
        if (c === "/" && prox === "/") { while (i < fonte.length && fonte[i] !== "\n") i++; continue; }
        if (c === "/" && prox === "*") {
            const fim = fonte.indexOf("*/", i + 2);
            i = fim === -1 ? fonte.length : fim + 2;
            continue;
        }
        if (c === "'" || c === "\"" || c === "`") aspas = c;
        if (!/\s/.test(c)) codigo[i] = 1;
        i++;
    }
    return codigo;
}

const linhas = [];
for (const relativo of [...executado.keys()].sort()) {
    const fonte = fs.readFileSync(path.join(RAIZ, relativo), "utf8");
    const marca = executado.get(relativo);
    const codigo = mascaraDeCodigo(fonte);
    let total = 0;
    let cobertas = 0;
    const descobertas = [];
    let inicio = 0;
    fonte.split("\n").forEach((texto, n) => {
        let temCodigo = false;
        let inteira = true;
        for (let i = inicio; i < inicio + texto.length; i++) {
            if (!codigo[i]) continue;
            temCodigo = true;
            if (!marca[i]) inteira = false;
        }
        if (temCodigo) {
            total++;
            if (inteira) cobertas++;
            else descobertas.push(n + 1);
        }
        inicio += texto.length + 1;
    });
    linhas.push({ arquivo: relativo, total, cobertas, descobertas });
}

const faixasTexto = nums => {
    const partes = [];
    for (let i = 0; i < nums.length; i++) {
        let j = i;
        while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
        partes.push(i === j ? `${nums[i]}` : `${nums[i]}-${nums[j]}`);
        i = j;
    }
    return partes.join(" ");
};

console.log("arquivo            linhas  cobertas      %   não cobertas");
let total = 0;
let cobertas = 0;
for (const l of linhas) {
    total += l.total;
    cobertas += l.cobertas;
    const pct = (100 * l.cobertas / l.total).toFixed(1).padStart(6);
    console.log(`${l.arquivo.padEnd(18)} ${String(l.total).padStart(6)} ${String(l.cobertas).padStart(9)} ${pct}   ${faixasTexto(l.descobertas)}`);
}
console.log(`${"todos".padEnd(18)} ${String(total).padStart(6)} ${String(cobertas).padStart(9)} ${(100 * cobertas / total).toFixed(1).padStart(6)}`);
