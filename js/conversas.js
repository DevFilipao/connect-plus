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
