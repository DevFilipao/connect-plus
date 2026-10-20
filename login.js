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
            "(" +
            valor.substring(0, 2) +
            ") " +
            valor.substring(2, 7) +
            "-" +
            valor.substring(7);

    } else if (valor.length > 2) {

        telefone.value =
            "(" +
            valor.substring(0, 2) +
            ") " +
            valor.substring(2);

    } else {

        telefone.value = valor;

    }

});


// Termos: marca o checkbox quando o usuário aceitou na página de termos
const campoTermos = document.getElementById("termos");

function verificarTermosAceitos() {
    try {
        if (sessionStorage.getItem("termosAceitos") === "sim") {
            campoTermos.checked = true;
        }
    } catch (e) {}
}

verificarTermosAceitos();

// Ao voltar da página de termos (inclusive pelo cache do navegador)
window.addEventListener("pageshow", verificarTermosAceitos);


// Guarda o que já foi digitado antes de abrir os termos e restaura ao voltar
const camposRascunho = ["nome", "telefone", "email"];

function salvarRascunho() {
    try {
        const rascunho = {};
        camposRascunho.forEach(function (id) {
            rascunho[id] = document.getElementById(id).value;
        });
        sessionStorage.setItem("rascunhoCadastro", JSON.stringify(rascunho));
    } catch (e) {}
}

function restaurarRascunho() {
    try {
        const rascunho = JSON.parse(sessionStorage.getItem("rascunhoCadastro"));
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


// Envio do formulário
const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    const confirmarSenha =
        document.getElementById("confirmarSenha").value;

    const mensagem =
        document.getElementById("mensagem");

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

        alert("Para continuar, aceite os Termos de Uso e a Política de Privacidade.");

        return;
    }

    // Guarda os dados da conta no navegador (a senha não é armazenada)
    try {
        localStorage.setItem("connect_usuario", JSON.stringify({
            nome: nome,
            telefone: telefone.value,
            email: email
        }));

        sessionStorage.removeItem("rascunhoCadastro");
        sessionStorage.removeItem("termosAceitos");
    } catch (e) {}

    mensagem.style.display = "block";

    formulario.reset();

    // Mostra a mensagem de sucesso por um instante e abre o app
    setTimeout(function () {
        window.location.href = "app.html";
    }, 1200);

});