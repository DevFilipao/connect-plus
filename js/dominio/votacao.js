// Regras de votação compartilhadas pelo quadro do compromisso e pelas enquetes.
// Puro: sem DOM nem storage. As funções de voto ALTERAM o objeto recebido
// (é o mesmo objeto que a interface guarda e persiste), e devolvem-no ou um booleano.

// ["Vou", "Talvez"] → [{ texto: "Vou", votos: 0 }, { texto: "Talvez", votos: 0 }]
function criarOpcoes(textos) {
    return textos.map(texto => ({ texto, votos: 0 }));
}

function totalVotos(opcoes) {
    return opcoes.reduce((soma, opcao) => soma + opcao.votos, 0);
}

// Porcentagem inteira (arredondada) de `votos` sobre `total`; 0 se ainda não há votos.
function porcentagem(votos, total) {
    return total ? Math.round(votos / total * 100) : 0;
}

// Quadro do compromisso: um voto por pessoa, que pode ser trocado ou desfeito.
//  - clicar na opção já votada remove o voto;
//  - clicar em outra opção move o voto.
function alternarVoto(item, indice) {
    if (item.voto !== null) item.opcoes[item.voto].votos--;

    if (item.voto === indice) {
        item.voto = null;
    } else {
        item.opcoes[indice].votos++;
        item.voto = indice;
    }
    return item;
}

// Enquete: um único voto, definitivo. Devolve true se o voto foi registrado.
function votarUmaVez(item, indice) {
    if (item.voto !== null) return false;

    item.opcoes[indice].votos++;
    item.voto = indice;
    return true;
}

if (typeof module === "object" && module.exports) {
    module.exports = { criarOpcoes, totalVotos, porcentagem, alternarVoto, votarUmaVez };
}
