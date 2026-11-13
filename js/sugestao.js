function analisarMensagem(texto, conversa, depoisDe = 0) {
    const tipo = classificarMensagem(texto);
    const aberta = Boolean(conversaSelecionada) && conversaSelecionada.id === conversa.id;

    if (aberta) esconderSugestao();

    if (tipo === "enquete") {
        if (aberta) {
            mostrarSugestao(
                "enquete",
                texto,
                "Parece que vocês estão tentando tomar uma decisão. Que tal criar uma enquete?"
            );
        }
    } else if (tipo === "evento") {
        publicarQuadro(extrairCompromisso(texto), { conversa, depoisDe });
    } else if (tipo === "tarefa") {
        if (aberta) {
            mostrarSugestao(
                "tarefa",
                texto,
                "Parece que essa mensagem contém uma tarefa ou algo importante para lembrar."
            );
        }
    }

    if (tipo) guardarNaMemoria(texto, conversa.nome);
}


function guardarNaMemoria(texto, nomeConversa) {
    if (memoria.some(item => item.texto === texto)) return;

    memoria.unshift({
        id: gerarId(),
        texto,
        conversa: nomeConversa || "Conversa",
        data: dataISO()
    });

    salvarDados();
    renderizarResumoMemoria();
}


function mostrarSugestao(tipo, texto, descricao) {
    const rotulos = {
        tarefa: "Criar tarefa",
        evento: "Criar evento",
        enquete: "Criar enquete"
    };


    sugestaoAtual = { tipo, texto };
    textoSugestao.textContent = descricao;
    document.getElementById("criarAcao").textContent = rotulos[tipo] || "Criar tarefa";
    sugestao.hidden = false;
}


function esconderSugestao() {
    sugestao.hidden = true;
    sugestaoAtual = null;
}


document.getElementById("dispensarSugestao").addEventListener("click", esconderSugestao);


document.getElementById("criarAcao").addEventListener("click", () => {
    const texto = sugestaoAtual?.texto || ultimaMensagemDaConversaAberta();
    const tipo = sugestaoAtual?.tipo || "tarefa";


    if (!texto) {
        alert("Envie uma mensagem antes de criar uma tarefa.");
        return;
    }


    // Abre o formulário certo conforme o que o Connect+ identificou
    if (tipo === "enquete") {
        abrirModal("enquete", { pergunta: texto });
    } else if (tipo === "evento") {
        abrirModal("evento", { titulo: texto });
    } else {
        abrirModal("tarefa", { titulo: texto });
    }


    esconderSugestao();
});
