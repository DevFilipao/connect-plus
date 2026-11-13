const OPCOES_QUADRO = ["Vou", "Talvez", "Não vou"];

function publicarQuadro(compromisso, { conversa, depoisDe = 0, salvo = false }) {
    const quadro = {
        id: gerarId(),
        titulo: compromisso.titulo,
        data: compromisso.data || "",
        horario: compromisso.horario || "",
        local: compromisso.local || "",
        opcoes: criarOpcoes(OPCOES_QUADRO),
        voto: null,
        salvo,
        depoisDe
    };

    // Pequena pausa para parecer que a IA está organizando
    setTimeout(() => {
        quadro.hora = horaPtBR();
        (quadros[conversa.id] = quadros[conversa.id] || []).push(quadro);
        salvarDados();
        if (conversaSelecionada && conversaSelecionada.id === conversa.id) inserirQuadro(quadro, true);
    }, 700);
}


function htmlQuadro(q) {
    const total = totalVotos(q.opcoes);

    return `
        <div class="message-row ai-row" data-quadro-linha="${q.id}">
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
                <span class="message-time">${escaparHTML(q.hora || "")}</span>
            </div>
        </div>
    `;
}


function criarLinhaQuadro(quadro) {
    const molde = document.createElement("div");
    molde.innerHTML = htmlQuadro(quadro).trim();
    return molde.firstElementChild;
}


function inserirQuadro(quadro, aoFinalSeSemAncora = false) {
    if (mensagens.querySelector(`[data-quadro-linha="${quadro.id}"]`)) return;

    const ancora = mensagens.querySelector(`.message-row[data-id="${quadro.depoisDe}"]`);
    if (!ancora && quadro.depoisDe && !aoFinalSeSemAncora) return;

    const noFim = mensagens.scrollHeight - mensagens.scrollTop - mensagens.clientHeight < 80;
    const linha = criarLinhaQuadro(quadro);

    if (ancora) {
        let proxima = ancora.nextElementSibling;
        while (proxima && proxima.dataset.quadroLinha) proxima = proxima.nextElementSibling;
        mensagens.insertBefore(linha, proxima);
    } else {
        mensagens.appendChild(linha);
    }

    if (noFim) mensagens.scrollTop = mensagens.scrollHeight;
}


function inserirQuadrosDaConversa(conversaId, aoFinalSeSemAncora = false) {
    (quadros[conversaId] || []).forEach(quadro => inserirQuadro(quadro, aoFinalSeSemAncora));
}


function atualizarLinhaQuadro(quadro) {
    const atual = mensagens.querySelector(`[data-quadro-linha="${quadro.id}"]`);
    if (atual) atual.replaceWith(criarLinhaQuadro(quadro));
}


function acharQuadro(id) {
    if (!conversaSelecionada) return undefined;
    return (quadros[conversaSelecionada.id] || []).find(q => q.id === id);
}


mensagens.addEventListener("click", event => {
    const votar = event.target.closest("[data-quadro]");
    const salvarEvento = event.target.closest("[data-quadro-salvar]");

    if (votar) {
        const q = acharQuadro(Number(votar.dataset.quadro));
        if (!q) return;

        alternarVoto(q, Number(votar.dataset.opcao));

        salvarDados();
        atualizarLinhaQuadro(q);
    }

    if (salvarEvento) {
        const q = acharQuadro(Number(salvarEvento.dataset.quadroSalvar));
        if (!q || q.salvo) return;

        q.salvo = true;
        adicionarEvento(q.titulo, q.data, q.horario, q.local);
        atualizarLinhaQuadro(q);
    }
});
