/* ============================================================
   UTILIDADES
   ============================================================ */

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



/* ============================================================
   ABAS: ENTRAR / CRIAR CONTA
   ============================================================ */

const formLogin = document.getElementById("formularioLogin");
const formCadastro = document.getElementById("formulario");
const abaLogin = document.getElementById("abaLogin");
const abaCadastro = document.getElementById("abaCadastro");
const tituloPagina = document.getElementById("tituloPagina");
const subtituloPagina = document.getElementById("subtituloPagina");
const mensagem = document.getElementById("mensagem");


function mudarModo(modo) {
    
    const ehLogin = modo === "login";

    formLogin.style.display = ehLogin ? "block" : "none";
    formCadastro.style.display = ehLogin ? "none" : "block";

    abaLogin.classList.toggle("ativa", ehLogin);
    abaCadastro.classList.toggle("ativa", !ehLogin);
    abaLogin.setAttribute("aria-selected", ehLogin);
    abaCadastro.setAttribute("aria-selected", !ehLogin);

    if (ehLogin) {
        tituloPagina.textContent = "Entrar na sua conta";
        subtituloPagina.textContent =
            "Use seu número e sua senha para acessar";
    } else {
        tituloPagina.textContent = "Crie sua conta";
        subtituloPagina.textContent = "Preencha seus dados para começar";
    }

    mensagem.style.display = "none";

    try {
        sessionStorage.setItem("modoAuth", modo);
    } catch (e) {}
}

abaLogin.addEventListener("click", function () { mudarModo("login"); });
abaCadastro.addEventListener("click", function () { mudarModo("cadastro"); });

document.getElementById("irCadastro").addEventListener("click", function (e) {
    e.preventDefault();
    mudarModo("cadastro");
});

document.getElementById("irLogin").addEventListener("click", function (e) {
    e.preventDefault();
    mudarModo("login");
});

// Restaura a aba em que a pessoa estava (ex.: voltou da página de termos)
(function () {
    let modo = "login";

    try {
        modo = sessionStorage.getItem("modoAuth") || "login";
    } catch (e) {}

    mudarModo(modo);
})();

/* ============================================================
   MÁSCARAS DE TELEFONE
   ============================================================ */

const telefone = document.getElementById("telefone");
const loginNumero = document.getElementById("loginNumero");

aplicarMascaraTelefone(telefone);
aplicarMascaraTelefone(loginNumero);

/* ============================================================
   TERMOS DE USO (cadastro e login)
   ============================================================ */

const campoTermos = document.getElementById("termos");
const campoTermosLogin = document.getElementById("termosLogin");

function verificarTermosAceitos() {
    try {
        if (sessionStorage.getItem("termosAceitos") === "sim") {
            campoTermos.checked = true;
            campoTermosLogin.checked = true;
        }
    } catch (e) {}
}

verificarTermosAceitos();

window.addEventListener("pageshow", verificarTermosAceitos);

/* ============================================================
   RASCUNHO (cadastro + login)
   ============================================================ */

const camposRascunho = ["nome", "telefone", "email", "loginNumero"];

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

function ligarFormulario(form, aoEnviar) {
    const erro = form.querySelector(".erro");
    const botao = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async function (ev) {
        ev.preventDefault();
        if (erro) erro.textContent = "";
        botao.disabled = true;
        try {
            await aoEnviar();
        } catch (e) {
            if (erro) erro.textContent = e.message;
            else alert(e.message);
        } finally {
            botao.disabled = false;
        }
    });
}

function mostrarMensagem(texto, comErro) {
    mensagem.classList.toggle("mensagem-erro", comErro);
    mensagem.style.display = "block";
    mensagem.textContent = texto;
}

function valorDe(id) {
    return document.getElementById(id).value;
}

function somenteDigitos(texto) {
    return texto.replace(/\D/g, "");
}

function finalizarLogin() {
    localStorage.removeItem("connect_usuario");
    localStorage.removeItem("connect_lembrar");

    sessionStorage.removeItem("rascunhoCadastro");
    sessionStorage.removeItem("termosAceitos");

    mensagem.textContent = "Login realizado com sucesso!";

    location.replace("app.html");
}

function ligarLogin() {
    ligarFormulario(formLogin, async function () {
        const telefone = somenteDigitos(valorDe("loginNumero"));
        const senha = valorDe("loginSenha");

        const erros = validarLogin({
            telefone,
            senha,
            aceitouTermos: campoTermosLogin.checked,
            confirmouTitular: document.getElementById("termosDados").checked
        });
        if (erros.length) throw new Error(erros[0]);

        try {
            mostrarMensagem("Verificando sua conta...", false);
            await entrar(telefone, senha, document.getElementById("lembrarLogin").checked);
            finalizarLogin();
        } catch (erro) {
            mostrarMensagem(erro.message || "Erro ao entrar.", true);
        }
    });
}

function ligarCadastro() {
    ligarFormulario(formCadastro, async function () {
        const nome = valorDe("nome");
        const telefone = somenteDigitos(valorDe("telefone"));
        const senha = valorDe("senha");

        const erros = validarCadastro({ nome, senha, confirmarSenha: valorDe("confirmarSenha") });
        if (erros.length) throw new Error(erros[0]);

        await cadastrar({ nome, telefone, email: valorDe("email"), senha });
        await entrar(telefone, senha, true);
        finalizarLogin();
    });
}

const sessaoAtual = Sessao.ler();
if (sessaoAtual && sessaoAtual.token) {
    location.replace("app.html");
} else {
    ligarLogin();
    ligarCadastro();
}
