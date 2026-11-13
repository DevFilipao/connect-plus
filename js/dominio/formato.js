// Formatação pura: sem DOM, sem storage, sem rede.
// Script clássico no navegador (as funções viram globais); no Node, `require` devolve as mesmas funções.

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[caractere]);
}

// "2026-11-05" → "05/11/2026". Vazio → "Sem data definida"; formato inesperado volta como veio.
function formatarData(data) {
    if (!data) return "Sem data definida";

    const partes = data.split("-");
    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Data local no formato ISO (aaaa-mm-dd). Sem argumento, usa o dia de hoje.
function dataISO(data = new Date()) {
    return [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0")
    ].join("-");
}

// Hora local HH:MM em pt-BR. Sem argumento, usa o horário de agora.
function horaPtBR(data = new Date()) {
    return data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });
}

// Máscara de telefone brasileiro: "11987654321" → "(11) 98765-4321".
// Ignora o que não for dígito e corta em 11 dígitos.
function formatarTelefone(valor) {
    let digitos = String(valor).replace(/\D/g, "");

    if (digitos.length > 11) {
        digitos = digitos.substring(0, 11);
    }

    if (digitos.length > 6) {
        return "(" + digitos.substring(0, 2) + ") " +
            digitos.substring(2, 7) + "-" +
            digitos.substring(7);
    }

    if (digitos.length > 2) {
        return "(" + digitos.substring(0, 2) + ") " +
            digitos.substring(2);
    }

    return digitos;
}

if (typeof module === "object" && module.exports) {
    module.exports = { escaparHTML, formatarData, dataISO, horaPtBR, formatarTelefone };
}
