
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyZUaQxHXB7PHBjK5lwf8LhJogyWpLzBzrCZ7hVG5DifpzlPZ8V8QRGtGsRpuSkiKGd/exec";

function mostrarSenha(id, botao) {
    const campo = document.getElementById(id);

    if (campo.type === "password") {
        campo.type = "text";
        botao.textContent = "🙈";
    } else {
        campo.type = "password";
        botao.textContent = "👁";
    }
}

// Máscara do telefone
const telefone = document.getElementById("telefone");

telefone.addEventListener("input", function () {
    let valor = telefone.value.replace(/\D/g, "");

    if (valor.length > 11) {
        valor = valor.substring(0, 11);
    }

    if (valor.length > 6) {
        telefone.value =
            "(" + valor.substring(0, 2) + ") " +
            valor.substring(2, 7) + "-" +
            valor.substring(7);
    } else if (valor.length > 2) {
        telefone.value =
            "(" + valor.substring(0, 2) + ") " +
            valor.substring(2);
    } else {
        telefone.value = valor;
    }
});

// Termos de uso
const campoTermos = document.getElementById("termos");

function verificarTermosAceitos() {
    try {
        if (sessionStorage.getItem("termosAceitos") === "sim") {
            campoTermos.checked = true;
        }
    } catch (e) {}
}

verificarTermosAceitos();

window.addEventListener("pageshow", verificarTermosAceitos);

// Rascunho do cadastro
const camposRascunho = ["nome", "telefone", "email"];

function salvarRascunho() {
    try {
        const rascunho = {};

        camposRascunho.forEach(function (id) {
            rascunho[id] = document.getElementById(id).value;
        });

        sessionStorage.setItem(
            "rascunhoCadastro",
            JSON.stringify(rascunho)
        );
    } catch (e) {}
}

function restaurarRascunho() {
    try {
        const rascunho = JSON.parse(
            sessionStorage.getItem("rascunhoCadastro")
        );

        if (!rascunho) return;

        camposRascunho.forEach(function (id) {
            const campo = document.getElementById(id);

            if (!campo.value && rascunho[id]) {
                campo.value = rascunho[id];
            }
        });
    } catch (e) {}
}

restaurarRascunho();

document.querySelectorAll(".termos a").forEach(function (link) {
    link.addEventListener("click", salvarRascunho);
});

// Enviar perfil para o Google Sheets
async function salvarPerfilNaPlanilha(nome, telefone) {
    const resposta = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        body: JSON.stringify({
            acao: "perfil",
            nome: nome,
            telefone: telefone
        })
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
        throw new Error(
            resultado.erro || "Não foi possível salvar o cadastro."
        );
    }

    return resultado;
}

// Envio do formulário
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha =
        document.getElementById("confirmarSenha").value;
    const mensagem = document.getElementById("mensagem");

    if (senha !== confirmarSenha) {
        alert("As senhas não são iguais!");
        return;
    }

    if (senha.length < 6) {
        alert("A senha precisa ter pelo menos 6 caracteres!");
        return;
    }

    if (telefone.value.replace(/\D/g, "").length < 10) {
        alert("Digite um telefone válido com DDD!");
        return;
    }

    if (!campoTermos.checked) {
        alert(
            "Para continuar, aceite os Termos de Uso e a Política de Privacidade."
        );
        return;
    }

    const telefoneFormatado = telefone.value;
    const telefoneLimpo = telefone.value.replace(/\D/g, "");

    const botaoEnviar = formulario.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    try {
        if (botaoEnviar) {
            botaoEnviar.disabled = true;
        }

        mensagem.style.display = "block";
        mensagem.textContent = "Salvando seu cadastro...";
        
        // Salva o perfil na planilha e recebe o ID
        const resultado = await salvarPerfilNaPlanilha(
            nome,
            telefoneFormatado
        );

        // Guarda também o ID do usuário no navegador
        localStorage.setItem("connect_usuario", JSON.stringify({
            id: resultado.id,
            nome: nome,
            telefone: telefoneFormatado,
            email: email
        }));


        sessionStorage.removeItem("rascunhoCadastro");
        sessionStorage.removeItem("termosAceitos");

        mensagem.textContent = "Cadastro realizado com sucesso!";

        formulario.reset();

        setTimeout(function () {
            window.location.href = "app.html";
        }, 1200);

    } catch (erro) {
        console.error("Erro ao salvar cadastro:", erro);

        mensagem.textContent = "";
        mensagem.style.display = "none";

        alert(
            "Não foi possível salvar seu cadastro na planilha. " +
            "Confira sua conexão e tente novamente."
        );

    } finally {
        if (botaoEnviar) {
            botaoEnviar.disabled = false;
        }
    }
});


