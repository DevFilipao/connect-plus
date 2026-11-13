const modal = document.getElementById("modal");
const modalTitulo = document.getElementById("modalTitulo");
const modalCampos = document.getElementById("modalCampos");
const formModal = document.getElementById("formModal");


function campoFormulario(nome, rotulo, tipo = "text", valor = "", obrigatorio = true) {
    const id = `${nome}`;
    const required = obrigatorio ? "required" : "";


    if (tipo === "textarea") {
        return `
            <div class="form-field">
                <label for="${id}">${escaparHTML(rotulo)}</label>
                <textarea id="${id}" name="${nome}" ${required}>${escaparHTML(valor)}</textarea>
            </div>
        `;
    }


    return `
        <div class="form-field">
            <label for="${id}">${escaparHTML(rotulo)}</label>
            <input id="${id}" name="${nome}" type="${tipo}"
                value="${escaparHTML(valor)}" ${required}>
            <p id="erro-contato" class="erro" role="alert"></p>
        </div>
    `;
}

function campoFormularioTelefone(nome, rotulo, obrigatorio = true) {
    const id = `${nome}`;
    const required = obrigatorio ? "required" : "";
    
    return `
        <div class="form-field">
            <label for="${id}">${escaparHTML(rotulo)}</label>
            <input id="${id}" name="${nome}" type="tel" ${required}>
            <p id="erro-modal" class="erro" role="alert"></p>
        </div>
    `;
}


function abrirModal(tipo, dados = {}) {
    tipoModal = tipo;


    const modelos = {
        tarefa: {
            titulo: "Nova tarefa",
            campos:
                campoFormulario("titulo", "Nome da tarefa", "text", dados.titulo || "") +
                campoFormulario("descricao", "Descrição", "textarea", "", false) +
                campoFormulario("data", "Data de conclusão", "date", "", false)
        },
        evento: {
            titulo: "Novo evento",
            campos:
                campoFormulario("titulo", "Nome do evento", "text", dados.titulo || "") +
                campoFormulario("data", "Data", "date", dados.data || "") +
                campoFormulario("horario", "Horário", "time", "", false) +
                campoFormulario("local", "Local", "text", "", false) +
                campoFormulario("descricao", "Descrição", "textarea", "", false)
        },
        enquete: {
            titulo: "Nova enquete",
            campos:
                campoFormulario("pergunta", "Pergunta da enquete", "text", dados.pergunta || "") +
                campoFormulario("opcao1", "Opção 1", "text", "") +
                campoFormulario("opcao2", "Opção 2", "text", "") +
                campoFormulario("opcao3", "Opção 3 (opcional)", "text", "", false)
        },
        chat: {
            titulo: "Nova conversa",
            campos: campoFormularioTelefone("novo-telefone", "Número")
        }/** ,
        grupo: {
            titulo: "Novo grupo",
            campos:
                campoFormulario("nomeGrupo", "Nome", "text", "") + `
                <div class="form-field">
                    <label>Adicionar contato</label>
                    <div class="group-add">
                        <input id="grupoContatoNome" type="text" placeholder="Nome do contato" autocomplete="off">
                        <input id="grupoContatoNumero" type="tel" placeholder="Número" autocomplete="off">
                    </div>
                    <button type="button" class="secondary small group-add-button" id="grupoAdicionarContato">＋ Adicionar contato</button>
                    <div class="group-contacts" id="grupoContatos"></div>
                </div>
            `
        }*/
    };

    // Mesmo bloco de contatos do "Novo grupo", mas sem o campo do nome
   /** modelos.participantes = {
        titulo: "Adicionar participantes",
        campos: modelos.grupo.campos.replace(campoFormulario("nomeGrupo", "Nome", "text", ""), "")
    };*/ 

    modalTitulo.textContent = modelos[tipo].titulo;
    modalCampos.innerHTML = modelos[tipo].campos;

    if (tipo === "grupo" || tipo === "participantes") prepararModalGrupo();

    modal.showModal();
}

function fecharModal() {
    if (modal.open) modal.close();
    formModal.reset();
    contatosGrupo = [];
}

document.getElementById("fecharModal").addEventListener("click", fecharModal);
document.getElementById("cancelarModal").addEventListener("click", fecharModal);

// Esc também limpa o formulário
modal.addEventListener("cancel", () => {
    formModal.reset();
    contatosGrupo = [];
});

// Clique fora da janela fecha o modal
modal.addEventListener("click", event => {
    if (event.target === modal) fecharModal();
});

formModal.addEventListener("submit", event => {
    event.preventDefault();

    if (tipoModal === "chat") return;

    const dados = Object.fromEntries(new FormData(formModal).entries());
    const texto = campo => (dados[campo] || "").trim();

    if (tipoModal === "tarefa") {
        adicionarTarefa(texto("titulo"), texto("descricao"), dados.data || "");
    }

    if (tipoModal === "evento") {
        const compromisso = {
            titulo: texto("titulo"),
            data: dados.data || "",
            horario: dados.horario || "",
            local: texto("local")
        };

        adicionarEvento(
            compromisso.titulo,
            compromisso.data,
            compromisso.horario,
            compromisso.local,
            texto("descricao")
        );

        // Quadro da IA na conversa aberta, já marcado como salvo em Eventos
        if (obterConversa()) {
            publicarQuadro(compromisso, { conversaId: conversaAtual, salvo: true });
        }
    }

    if (tipoModal === "enquete") {
        const opcoes = [texto("opcao1"), texto("opcao2"), texto("opcao3")]
            .filter(Boolean);

        if (opcoes.length < 2) {
            alert("Informe pelo menos duas opções para a enquete.");
            return;
        }

        adicionarEnquete(texto("pergunta"), opcoes);
    }

    if (tipoModal === "grupo") {
        const nomeGrupo = texto("nomeGrupo");

        // Se o usuário preencheu um contato mas não clicou em "Adicionar contato", adiciona agora
        const nomePendente = (document.getElementById("grupoContatoNome")?.value || "").trim();
        const numeroPendente = (document.getElementById("grupoContatoNumero")?.value || "").trim();
        if (nomePendente && numeroPendente &&
            !contatosGrupo.some(c => c.telefone === numeroPendente)) {
            contatosGrupo.push({ nome: nomePendente, telefone: numeroPendente });
        }

        if (!nomeGrupo) {
            alert("Informe o nome do grupo.");
            return;
        }

        if (!contatosGrupo.length) {
            alert("Adicione pelo menos um contato ao grupo.");
            return;
        }

        criarGrupo(nomeGrupo, [...contatosGrupo]);
    }

    if (tipoModal === "participantes") {
        const conversa = obterConversa();
        if (!conversa || conversa.tipo !== "grupo") return;

        // Inclui o contato preenchido que ainda não foi adicionado com o botão
        const nomePendente = (document.getElementById("grupoContatoNome")?.value || "").trim();
        const numeroPendente = (document.getElementById("grupoContatoNumero")?.value || "").trim();
        const repetido = numeroPendente && (
            contatosGrupo.some(c => c.telefone === numeroPendente) ||
            (conversa.membros || []).some(c => c.telefone === numeroPendente)
        );
        if (nomePendente && numeroPendente && !repetido) {
            contatosGrupo.push({ nome: nomePendente, telefone: numeroPendente });
        }

        if (!contatosGrupo.length) {
            alert("Adicione pelo menos um contato.");
            return;
        }

        adicionarParticipantes(conversa, [...contatosGrupo]);
    }

    fecharModal();
});
