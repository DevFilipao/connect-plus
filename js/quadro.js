const OPCOES_QUADRO = ["Vou", "Talvez", "Não vou"];

function publicarQuadro(compromisso, { conversaId, salvo = false } = {}) {
    const conversa = conversas.find(c => c.id === conversaId);
    if (!conversa) return;

    const quadro = {
        id: gerarId(),
        titulo: compromisso.titulo,
        data: compromisso.data || "",
        horario: compromisso.horario || "",
        local: compromisso.local || "",
        opcoes: criarOpcoes(OPCOES_QUADRO),
        voto: null,
        salvo
    };

    // Pequena pausa para parecer que a IA está organizando
    setTimeout(() => {
        conversa.mensagens.push({
            tipo: "quadro",
            autor: "Connect+ IA",
            texto: `📋 ${quadro.titulo}`,
            hora: horaPtBR(),
            minha: false,
            quadro
        });

        salvarDados();
        if (conversaAtual === conversa.id) renderizarChat();
    }, 700);
}


function htmlQuadro(mensagem) {
    const q = mensagem.quadro;
    const total = totalVotos(q.opcoes);

    return `
        <div class="message-row ai-row">
            <div class="message-avatar ai-avatar">✦</div>
            <div class="message-content">
                <div class="message-name">Connect+ IA</div>
                <div class="ai-board">
                    <span class="tag">📋 Quadro do compromisso</span>
                    <h4>${escaparHTML(q.titulo)}</h4>
                    <ul class="ai-board-info">
                        <li>📅 ${q.data ? escaparHTML(formatarData(q.data)) : "Data a definir"}</li>
                        <li>🕒 ${q.horario ? escaparHTML(q.horario) : "Horário a definir"}</li>
                        <li>📍 ${q.local ? escaparHTML(q.local) : "Local a definir"}</li>
                    </ul>
                    <p class="ai-board-question">Quem vai?</p>
                    ${q.opcoes.map((opcao, indice) => {
                        const pct = porcentagem(opcao.votos, total);
                        return `
                            <button type="button" class="ai-option ${q.voto === indice ? "voted" : ""}"
                                data-quadro="${q.id}" data-opcao="${indice}">
                                <span class="ai-option-bar" style="width:${pct}%"></span>
                                <span class="ai-option-text">${escaparHTML(opcao.texto)}</span>
                                <strong>${opcao.votos}</strong>
                            </button>
                        `;
                    }).join("")}
                    ${q.salvo
                        ? `<div class="ai-board-saved">✓ Salvo em Eventos</div>`
                        : `<button type="button" class="secondary small" data-quadro-salvar="${q.id}">＋ Adicionar aos eventos</button>`}
                </div>
                <span class="message-time">${escaparHTML(mensagem.hora)}</span>
            </div>
        </div>
    `;
}


function acharQuadro(id) {
    const conversa = obterConversa();
    const mensagem = conversa?.mensagens.find(m => m.tipo === "quadro" && m.quadro.id === id);
    return mensagem?.quadro;
}


// Cliques nos quadros (votar e salvar em Eventos)
mensagens.addEventListener("click", event => {
    const votar = event.target.closest("[data-quadro]");
    const salvarEvento = event.target.closest("[data-quadro-salvar]");

    if (votar) {
        const q = acharQuadro(Number(votar.dataset.quadro));
        if (!q) return;

        alternarVoto(q, Number(votar.dataset.opcao)); // clicar de novo na mesma opção remove o voto

        salvarDados();
        renderizarChat();
    }

    if (salvarEvento) {
        const q = acharQuadro(Number(salvarEvento.dataset.quadroSalvar));
        if (!q || q.salvo) return;

        q.salvo = true;
        adicionarEvento(q.titulo, q.data, q.horario, q.local);
        renderizarChat();
    }
});
