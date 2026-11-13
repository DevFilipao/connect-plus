function analisarMensagem(texto) {
    const tipo = classificarMensagem(texto);


    if (tipo === "enquete") {
        mostrarSugestao(
            "enquete",
            texto,
            "Parece que vocês estão tentando tomar uma decisão. Que tal criar uma enquete?"
        );
    } else if (tipo === "evento") {
        // A IA do Connect+ monta o quadro do compromisso direto no chat
        sugestao.hidden = true;
        sugestaoAtual = null;
        publicarQuadro(extrairCompromisso(texto), { conversaId: conversaAtual });
    } else if (tipo === "tarefa") {
        mostrarSugestao(
            "tarefa",
            texto,
            "Parece que essa mensagem contém uma tarefa ou algo importante para lembrar."
        );
    } else {
        sugestao.hidden = true;
        sugestaoAtual = null;
    }


    // Guarda mensagens que parecem conter informações importantes.
    if (tipo) {
        if (!memoria.some(item => item.texto === texto)) {
            memoria.unshift({
                id: gerarId(),
                texto,
                conversa: obterConversa()?.nome || "Conversa",
                data: dataISO()
            });


            salvarDados();
            renderizarResumoMemoria();
        }
    }
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


document.getElementById("dispensarSugestao").addEventListener("click", () => {
    sugestao.hidden = true;
    sugestaoAtual = null;
});


document.getElementById("criarAcao").addEventListener("click", () => {
    const conversa = obterConversa();
    const texto = sugestaoAtual?.texto || conversa?.mensagens.at(-1)?.texto;
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


    sugestao.hidden = true;
    sugestaoAtual = null;
});
