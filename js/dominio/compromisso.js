// Extração de compromisso a partir de uma frase. Puro: sem DOM, storage ou rede.
// O "hoje" entra por parâmetro, então o resultado é determinístico e testável.
// Script clássico no navegador; no Node, `require` devolve as mesmas funções.

// No navegador, dataISO vem de formato.js (global); no Node, do require.
const dataISOCompromisso = typeof dataISO === "function" ? dataISO : require("./formato").dataISO;

const DIAS_SEMANA = [
    { chaves: ["domingo"], indice: 0, nome: "Domingo" },
    { chaves: ["segunda"], indice: 1, nome: "Segunda-feira" },
    { chaves: ["terça", "terca"], indice: 2, nome: "Terça-feira" },
    { chaves: ["quarta"], indice: 3, nome: "Quarta-feira" },
    { chaves: ["quinta"], indice: 4, nome: "Quinta-feira" },
    { chaves: ["sexta"], indice: 5, nome: "Sexta-feira" },
    { chaves: ["sábado", "sabado"], indice: 6, nome: "Sábado" }
];

const TIPOS_COMPROMISSO = [
    ["jogo", "Jogo"], ["reunião", "Reunião"], ["reuniao", "Reunião"],
    ["encontro", "Encontro"], ["aniversário", "Aniversário"],
    ["aniversario", "Aniversário"], ["passeio", "Passeio"],
    ["viagem", "Viagem"], ["festa", "Festa"]
];

// Lê a frase e tenta descobrir tipo, dia, horário e local.
// `hoje` é só lido (nunca alterado); sem ele, usa o momento atual.
function extrairCompromisso(texto, hoje = new Date()) {
    const minusculo = texto.toLowerCase();
    const inicioDoDia = new Date(hoje);
    inicioDoDia.setHours(0, 0, 0, 0);

    let titulo = "Compromisso";
    const tipo = TIPOS_COMPROMISSO.find(([chave]) => minusculo.includes(chave));
    if (tipo) titulo = tipo[1];

    let data = "";
    let diaNome = "";

    const explicita = minusculo.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
    if (explicita) {
        const ano = explicita[3]
            ? (explicita[3].length === 2 ? 2000 + Number(explicita[3]) : Number(explicita[3]))
            : inicioDoDia.getFullYear();
        data = `${ano}-${explicita[2].padStart(2, "0")}-${explicita[1].padStart(2, "0")}`;
    } else if (/\bamanh[ãa]\b/.test(minusculo)) {
        const d = new Date(inicioDoDia);
        d.setDate(d.getDate() + 1);
        data = dataISOCompromisso(d);
        diaNome = "Amanhã";
    } else if (/\bhoje\b/.test(minusculo)) {
        data = dataISOCompromisso(inicioDoDia);
        diaNome = "Hoje";
    } else {
        const dia = DIAS_SEMANA.find(item => item.chaves.some(c => minusculo.includes(c)));
        if (dia) {
            const d = new Date(inicioDoDia);
            const falta = (dia.indice - d.getDay() + 7) % 7 || 7;
            d.setDate(d.getDate() + falta);
            data = dataISOCompromisso(d);
            diaNome = dia.nome;
        }
    }

    let horario = "";
    const hora = minusculo.match(/\b(\d{1,2})\s*(?:h|:)\s*(\d{2})?\b/) ||
        minusculo.match(/\bàs\s+(\d{1,2})()\b/);
    if (hora && Number(hora[1]) < 24) {
        horario = `${hora[1].padStart(2, "0")}:${hora[2] || "00"}`;
    }

    let local = "";
    const achouLocal = texto.match(
        /\b(?:no|na|em|n[oa]s)\s+((?:[A-ZÀ-Ú][\wÀ-ú]*)(?:\s+(?:d[aeo]s?\s+)?[A-ZÀ-Ú][\wÀ-ú]*)*)/
    );
    if (achouLocal) local = achouLocal[1];

    if (diaNome) titulo = `${titulo} · ${diaNome}`;

    return { titulo, data, horario, local };
}

if (typeof module === "object" && module.exports) {
    module.exports = { extrairCompromisso, DIAS_SEMANA, TIPOS_COMPROMISSO };
}
