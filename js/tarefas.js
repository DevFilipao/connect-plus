function adicionarTarefa(titulo, descricao = "", data = "") {
    tarefas.unshift({
        id: gerarId(),
        titulo,
        descricao,
        data,
        concluida: false
    });


    salvarDados();
    atualizarTudo();
}


function renderizarTarefas() {
    const lista = document.getElementById("listaTarefas");
    const concluidas = tarefas.filter(t => t.concluida).length;
    const pendentes = tarefas.length - concluidas;


    document.getElementById("estatisticasTarefas").innerHTML = `
        <div class="stat-card">
            <small>Total de tarefas</small>
            <strong>${tarefas.length}</strong>
        </div>
        <div class="stat-card">
            <small>Pendentes</small>
            <strong>${pendentes}</strong>
        </div>
        <div class="stat-card">
            <small>Concluídas</small>
            <strong>${concluidas}</strong>
        </div>
    `;


    if (!tarefas.length) {
        lista.innerHTML = criarVazio("Nenhuma tarefa por enquanto", "Crie uma tarefa ou transforme uma mensagem em atividade.");
        return;
    }


    lista.innerHTML = tarefas.map(tarefa => `
        <div class="task-card ${tarefa.concluida ? "completed" : ""}">
            <input type="checkbox" class="task-check"
                data-check="${tarefa.id}" ${tarefa.concluida ? "checked" : ""}>
            <div class="task-details">
                <strong>${escaparHTML(tarefa.titulo)}</strong>
                <p>${escaparHTML(tarefa.descricao || "Sem descrição")}
                    ${tarefa.data ? " · " + formatarData(tarefa.data) : ""}
                </p>
                <span class="tag">${tarefa.concluida ? "Concluída" : "Pendente"}</span>
            </div>
            <button class="delete-button" data-delete-task="${tarefa.id}" title="Excluir tarefa">✕</button>
        </div>
    `).join("");


    lista.querySelectorAll("[data-check]").forEach(input => {
        input.addEventListener("change", () => {
            const tarefa = tarefas.find(t => t.id === Number(input.dataset.check));
            if (tarefa) tarefa.concluida = input.checked;
            salvarDados();
            atualizarTudo();
        });
    });


    lista.querySelectorAll("[data-delete-task]").forEach(botao => {
        botao.addEventListener("click", () => {
            tarefas = tarefas.filter(t => t.id !== Number(botao.dataset.deleteTask));
            salvarDados();
            atualizarTudo();
        });
    });
}


document.getElementById("novaTarefa").addEventListener("click", () => {
    abrirModal("tarefa");
});
