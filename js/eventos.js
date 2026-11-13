function adicionarEvento(titulo, data, horario, local, descricao = "") {
    eventos.unshift({
        id: gerarId(),
        titulo,
        data,
        horario,
        local,
        descricao
    });


    salvarDados();
    atualizarTudo();
}


function renderizarEventos() {
    const lista = document.getElementById("listaEventos");


    if (!eventos.length) {
        lista.innerHTML = criarVazio("Nenhum evento cadastrado", "Crie um evento para organizar seus compromissos.");
        return;
    }


    lista.innerHTML = eventos.map(evento => `
        <div class="event-card">
            <span class="event-date">📅 ${formatarData(evento.data)} ${evento.horario ? " · " + escaparHTML(evento.horario) : ""}</span>
            <h3>${escaparHTML(evento.titulo)}</h3>
            <p>📍 ${escaparHTML(evento.local || "Local não definido")}</p>
            ${evento.descricao ? `<p>${escaparHTML(evento.descricao)}</p>` : ""}
            <button class="delete-button" data-delete-event="${evento.id}">✕ Excluir evento</button>
        </div>
    `).join("");


    lista.querySelectorAll("[data-delete-event]").forEach(botao => {
        botao.addEventListener("click", () => {
            eventos = eventos.filter(e => e.id !== Number(botao.dataset.deleteEvent));
            salvarDados();
            atualizarTudo();
        });
    });
}


document.getElementById("novoEvento").addEventListener("click", () => {
    abrirModal("evento");
});
