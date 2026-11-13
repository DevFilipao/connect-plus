// Classificação da mensagem pelo assistente simulado. Puro: só decide o TIPO;
// quem mostra sugestão, publica quadro ou guarda memória é a interface (app.js).

const PALAVRAS_TAREFA = [
    "preciso", "não esquecer", "nao esquecer",
    "lembrar", "estudar", "trabalho", "entregar",
    "fazer", "organizar", "levar", "comprar",
    "prova", "atividade", "tarefa", "treinar"
];

const PALAVRAS_EVENTO = [
    "jogo", "reunião", "reuniao", "encontro",
    "aniversário", "aniversario", "passeio",
    "viagem", "festa", "sábado", "sabado",
    "domingo", "segunda", "terça", "terca",
    "quarta", "quinta", "sexta", "amanhã", "amanha"
];

const PALAVRAS_ENQUETE = [
    "qual horário", "qual horario", "qual dia",
    "quem consegue", "quem vai", "vamos escolher",
    "o que vocês preferem", "o que voces preferem",
    "qual vocês preferem", "qual voces preferem"
];

// Devolve "enquete", "evento", "tarefa" ou null.
// Precedência quando a frase casa com mais de um tipo: enquete > evento > tarefa.
function classificarMensagem(texto) {
    const minusculo = texto.toLowerCase();
    const contem = palavras => palavras.some(p => minusculo.includes(p));

    if (contem(PALAVRAS_ENQUETE)) return "enquete";
    if (contem(PALAVRAS_EVENTO)) return "evento";
    if (contem(PALAVRAS_TAREFA)) return "tarefa";
    return null;
}

if (typeof module === "object" && module.exports) {
    module.exports = { classificarMensagem, PALAVRAS_TAREFA, PALAVRAS_EVENTO, PALAVRAS_ENQUETE };
}
