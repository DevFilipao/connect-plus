function renderizarMemoria() {
    const lista = document.getElementById("listaMemoria");


    if (!memoria.length) {
        lista.innerHTML = criarVazio("Sua memória está vazia", "Quando uma mensagem importante for identificada, ela poderá aparecer aqui.");
        return;
    }


    lista.innerHTML = memoria.map(item => `
        <div class="memory-card-item">
            <div class="memory-symbol">🧠</div>
            <div style="flex:1;min-width:0">
                <span class="tag">${escaparHTML(item.conversa)}</span>
                <p style="margin-top:10px">${escaparHTML(item.texto)}</p>
                <p>Guardado em ${formatarData(item.data)}</p>
                <button class="delete-button" data-delete-memory="${item.id}">✕ Excluir</button>
            </div>
        </div>
    `).join("");


    lista.querySelectorAll("[data-delete-memory]").forEach(botao => {
        botao.addEventListener("click", () => {
            memoria = memoria.filter(item => item.id !== Number(botao.dataset.deleteMemory));
            salvarDados();
            atualizarTudo();
        });
    });
}


function renderizarResumoMemoria() {
    const resumo = document.getElementById("resumoMemoria");


    if (!memoria.length) {
        resumo.innerHTML = `<p class="muted">Nenhuma informação guardada ainda.</p>`;
        return;
    }


    resumo.innerHTML = memoria.slice(0, 3).map(item => `
        <div class="memory-mini">${escaparHTML(item.texto)}</div>
    `).join("");
}
