const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyZUaQxHXB7PHBjK5lwf8LhJogyWpLzBzrCZ7hVG5DifpzlPZ8V8QRGtGsRpuSkiKGd/exec";

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

// Gera o hash SHA-256 da senha (a senha em texto puro nunca é enviada)
async function hashSenha(senha) {
    const dados = new TextEncoder().encode(senha);
    const buffer = await crypto.subtle.digest("SHA-256", dados);

    return Array.from(new Uint8Array(buffer))
        .map(function (b) { return b.toString(16).padStart(2, "0"); })
        .join("");
}

function aplicarMascaraTelefone(campo) {
    campo.addEventListener("input", function () {
        let valor = campo.value.replace(/\D/g, "");

        if (valor.length > 11) {
            valor = valor.substring(0, 11);
        }

        if (valor.length > 6) {
            campo.value =
                "(" + valor.substring(0, 2) + ") " +
                valor.substring(2, 7) + "-" +
                valor.substring(7);
        } else if (valor.length > 2) {
            campo.value =
                "(" + valor.substring(0, 2) + ") " +
                valor.substring(2);
        } else {
            campo.value = valor;
        }
    });
}

/* ============================================================
   ABAS: ENTRAR / CRIAR CONTA
   ============================================================ */

const formularioLogin = document.getElementById("formularioLogin");
const formulario = document.getElementById("formulario");
const abaLogin = document.getElementById("abaLogin");
const abaCadastro = document.getElementById("abaCadastro");
const tituloPagina = document.getElementById("tituloPagina");
const subtituloPagina = document.getElementById("subtituloPagina");
const mensagem = document.getElementById("mensagem");

function mudarModo(modo) {
    const ehLogin = modo === "login";

    formularioLogin.style.display = ehLogin ? "block" : "none";
    formulario.style.display = ehLogin ? "none" : "block";

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

/* ============================================================
   GOOGLE SHEETS
   ============================================================ */

// Cadastro: salva o perfil na planilha
async function salvarPerfilNaPlanilha(nome, telefone, senhaHash) {
    const resposta = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        body: JSON.stringify({
            acao: "perfil",
            nome: nome,
            telefone: telefone,
            senhaHash: senhaHash
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

// Login: procura o perfil na planilha (telefone + senha)
async function entrarPelaPlanilha(telefone, senhaHash) {
    const resposta = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        body: JSON.stringify({
            acao: "login",
            telefone: telefone,
            senhaHash: senhaHash
        })
    });

    const resultado = await resposta.json();

    if (!resultado.sucesso) {
        throw new Error(
            resultado.erro || "Número ou senha incorretos."
        );
    }

    return resultado;
}

/* ============================================================
   ENVIO DO LOGIN
   ============================================================ */

formularioLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const senhaLogin = document.getElementById("loginSenha").value;
    const numeroFormatado = loginNumero.value;
    const numeroLimpo = numeroFormatado.replace(/\D/g, "");
    const lembrar = document.getElementById("lembrarLogin").checked;
    const botaoLogin = document.getElementById("btnLogin");

    if (numeroLimpo.length < 10) {
        alert("Digite um número válido com DDD!");
        return;
    }

    if (senhaLogin.length < 6) {
        alert("Digite sua senha (mínimo de 6 caracteres).");
        return;
    }

    if (!campoTermosLogin.checked) {
        alert(
            "Para continuar, aceite os Termos de Uso e a Política de Privacidade."
        );
        return;
    }

    if (!document.getElementById("termosDados").checked) {
        alert("Para continuar, confirme que você é o titular da conta.");
        return;
    }

    try {
        botaoLogin.disabled = true;

        mensagem.style.display = "block";
        mensagem.textContent = "Verificando sua conta...";

        const senhaHash = await hashSenha(senhaLogin);
        const resultado = await entrarPelaPlanilha(numeroFormatado, senhaHash);

        // Mantém o e-mail se já estiver guardado neste aparelho
        let emailSalvo = "";

        try {
            const anterior = JSON.parse(localStorage.getItem("connect_usuario"));

            if (anterior && anterior.email) {
                emailSalvo = anterior.email;
            }
        } catch (e) {}

        const dadosUsuario = {
            id: resultado.id,
            nome: resultado.nome || "",
            telefone: numeroFormatado,
            email: emailSalvo
        };

        localStorage.setItem("connect_usuario", JSON.stringify(dadosUsuario));

        try {
            if (lembrar) {
                localStorage.setItem("connect_lembrar", "sim");
            } else {
                localStorage.removeItem("connect_lembrar");
            }
        } catch (e) {}

        sessionStorage.removeItem("rascunhoCadastro");
        sessionStorage.removeItem("termosAceitos");

        mensagem.textContent = "Login realizado com sucesso!";

        setTimeout(function () {
            window.location.href = "app.html";
        }, 800);

    } catch (erro) {
        console.error("Erro ao entrar:", erro);

        mensagem.textContent = "";
        mensagem.style.display = "none";

        alert(
            "Número ou senha incorretos. " +
            "Confira os dados ou crie uma conta."
        );

    } finally {
        botaoLogin.disabled = false;
    }
});

/* ============================================================
   ENVIO DO CADASTRO
   ============================================================ */

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const confirmarSenha =
        document.getElementById("confirmarSenha").value;

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
        const senhaHash = await hashSenha(senha);

        const resultado = await salvarPerfilNaPlanilha(
            nome,
            telefoneFormatado,
            senhaHash
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