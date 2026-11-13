function adicionarEnquete(pergunta, opcoes) {
    enquetes.unshift({
        id: gerarId(),
        pergunta,
        opcoes: criarOpcoes(opcoes),
        voto: null
    });


    salvarDados();
    atualizarTudo();
}


function renderizarEnquetes() {
    const lista = document.getElementById("listaEnquetes");


    if (!enquetes.length) {
        lista.innerHTML = criarVazio("Nenhuma enquete criada", "Crie uma enquete para ajudar seu grupo a tomar decisões.");
        return;
    }


    lista.innerHTML = enquetes.map(enquete => {
        const total = totalVotos(enquete.opcoes);


        return `
            <div class="poll-card">
                <span class="tag">📊 Enquete</span>
                <h3>${escaparHTML(enquete.pergunta)}</h3>
                <p>${total} voto(s)</p>
                ${enquete.opcoes.map((opcao, indice) => {
                    const pct = porcentagem(opcao.votos, total);


                    return `
                        <div class="poll-result">
                            <div class="poll-result-label">
                                <span>${escaparHTML(opcao.texto)}</span>
                                <strong>${opcao.votos} voto(s)</strong>
                            </div>
                            <div class="poll-bar"><span style="width:${pct}%"></span></div>
                            ${enquete.voto === null ? `
                                <button class="secondary small" data-votar="${enquete.id}" data-opcao="${indice}">
                                    Votar nesta opção
                                </button>
                            ` : ""}
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }).join("");


    lista.querySelectorAll("[data-votar]").forEach(botao => {
        botao.addEventListener("click", () => {
            const enquete = enquetes.find(e => e.id === Number(botao.dataset.votar));
            if (!enquete || !votarUmaVez(enquete, Number(botao.dataset.opcao))) return;


            salvarDados();
            renderizarEnquetes();
        });
    });
}


document.getElementById("novaEnquete").addEventListener("click", () => {
    abrirModal("enquete");
});
