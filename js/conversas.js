function renderizarListaConversas() {
    const lista = document.getElementById("listaConversas");
    if (!lista || lista.dataset.origem === "api") return;


    lista.innerHTML = conversas.map(conversa => {
        const ultima = conversa.mensagens.at(-1);


        return `
            <button class="chat-contact ${conversa.id === conversaAtual ? "selected" : ""}"
                data-id="${conversa.id}">
                <div class="avatar">${escaparHTML(conversa.avatar)}</div>
                <div class="contact-info">
                    <strong>${escaparHTML(conversa.nome)}</strong>
                    <small>${escaparHTML(ultima?.texto || "Nova conversa")}</small>
                </div>
            </button>
        `;
    }).join("");


    lista.querySelectorAll(".chat-contact").forEach(botao => {
        botao.addEventListener("click", () => {
            conversaAtual = Number(botao.dataset.id);
            sugestaoAtual = null;
            sugestao.hidden = true;
            renderizarChat();
            renderizarListaConversas();
            abrirPagina("chat");
        });
    });
}


function renderizarChat() {
    const conversa = obterConversa();


    if (!conversa) return;


    document.getElementById("nomeGrupo").textContent = conversa.nome;
    document.getElementById("avatarGrupo").textContent = conversa.avatar;
    document.getElementById("statusGrupo").textContent = conversa.descricao;
    document.getElementById("adicionarParticipantes").hidden = conversa.tipo !== "grupo";


    mensagens.innerHTML = conversa.mensagens.map(mensagem => mensagem.tipo === "quadro" ? htmlQuadro(mensagem) : `
        <div class="message-row ${mensagem.minha ? "mine" : ""}">
            <div class="message-avatar">${escaparHTML(mensagem.autor.charAt(0).toUpperCase())}</div>
            <div class="message-content">
                <div class="message-name">${escaparHTML(mensagem.autor)}</div>
                <div class="message-bubble">${escaparHTML(mensagem.texto)}</div>
                <span class="message-time">${escaparHTML(mensagem.hora)}</span>
            </div>
        </div>
    `).join("");


    mensagens.scrollTop = mensagens.scrollHeight;
}


// ENVIAR MENSAGEM


async function enviarMensagem(texto) {
    const conversa = obterConversa();


    if (!conversa || !texto.trim()) return;


    const textoLimpo = texto.trim();


    const mensagem = {
        autor: nomeUsuario,
        texto: textoLimpo,
        hora: horaPtBR(),
        minha: true
    };


    conversa.mensagens.push(mensagem);


    salvarDados();
    renderizarChat();
    renderizarListaConversas();


    analisarMensagem(textoLimpo);
}




// FORMULÁRIO DE ENVIO


formulario.addEventListener("submit", async event => {
    event.preventDefault();

    if (formulario.dataset.origem === "api") return;


    const texto = campoMensagem.value.trim();
    if (!texto) return;


    await enviarMensagem(texto);


    campoMensagem.value = "";
    campoMensagem.focus();
});




// CRIAR NOVA CONVERSA


document.getElementById("novoChat").addEventListener("click", () => {
    abrirModal("chat");
    var campoTelefone = document.getElementById('novo-telefone');
    aplicarMascaraTelefone(campoTelefone);
});


document.getElementById("verInfo").addEventListener("click", () => {
    const conversa = obterConversa();
    if (!conversa) return;

    if (conversa.tipo === "grupo") {
        const lista = (conversa.membros || [])
            .map(m => `• ${m.nome} - ${m.telefone}`)
            .join("\n");
        alert(`${conversa.nome}\n${conversa.descricao}\n\nParticipantes:\n• Você\n${lista}`);
        return;
    }

    alert(`${conversa.nome}\n${conversa.descricao}`);
});
