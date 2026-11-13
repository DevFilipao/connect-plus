// Login, cadastro e saída. Usado em login.html e app.html.
function exigirLogin() {
  var s = Sessao.ler();
  if (!s || !s.token) {
    location.replace('login.html');
    return null;
  }
  return s;
}

async function sair() {
  var s = Sessao.ler();
  Sessao.limpar();
  if (s) {
    try { await chamarApi('logout', { token: s.token }); } catch (e) { /* ignora */ }
  }
  location.replace('login.html');
}

async function entrar(telefone, senha) {
  var dados = await chamarApi('login', { telefone: telefone, senha: senha });
  Sessao.salvar(dados);
  return dados;
}

function ligarFormulario(form, aoEnviar) {
  var erro = document.getElementById('erro');
  var botao = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    erro.textContent = '';
    botao.disabled = true;
    try {
      aoEnviar();
    } catch (e) {
      erro.textContent = e.message;
      botao.disabled = false;
    }
  });
}


(() => {
  
  var campo = function (id) { return document.getElementById(id).value; };

  var formLogin = document.getElementById('formularioLogin');
  var formCadastro = document.getElementById('formulario');

  if (!formLogin && !formCadastro) return;

  var s = Sessao.ler();
  if (s && s.token) { location.replace('app.html'); return; }

  if (formLogin) {
    ligarFormulario(formLogin, async function (event) {
      const senha = campo('loginSenha');
      const numero = campo('loginNumero');
      const numeroLimpo = numero.replace(/\D/g, "");
      const lembrar = document.getElementById("lembrarLogin").checked;
      const botaoLogin = document.getElementById("btnLogin");
      
      if (!numeroLimpo) throw new Error('Informe o número de telefone.');
      if (!senha) throw new Error('Informe a senha.');
  
      if (numeroLimpo.length < 10) {
          alert("Digite um número válido com DDD!");
          return;
      }
  
      if (senha.length < 6) {
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
        
        mensagem.style.color = "";
        mensagem.style.backgroundColor = "";
        mensagem.style.border = "";
        mensagem.style.display = "block";
        mensagem.textContent = "Verificando sua conta...";

        const resultado = await entrar(numeroLimpo, senha);
       
        manterDadosLocal(resultado, lembrar);

      } catch (erro) {

        mensagem.style.color = "red";
        mensagem.style.backgroundColor = "#ff00001f";
        mensagem.style.border = "1px solid #ff000059";
        mensagem.style.display = "block"; 
        mensagem.textContent = erro.message || "Erro ao entrar.";
        
    } finally {
        botaoLogin.disabled = false;
    }

      
    });
  }

  if (formCadastro) {
    ligarFormulario(formCadastro, async function () {

      const nome = campo('nome');
      const numero = campo('telefone');
      const numeroLimpo = numero.replace(/\D/g, "");
      const email = campo('email');
      const senha = campo('senha');
      const confirmarSenha = campo('confirmarSenha');
      

      if (!nome) throw new Error('Informe o nome.');
      if (nome.length < 3) throw new Error('O nome deve ter pelo menos 3 caracteres.');
      if (senha !== confirmarSenha) throw new Error('As senhas não conferem.');

      await chamarApi('cadastro', {
        nome: nome,
        telefone: numeroLimpo,
        email: email,
        senha: senha
      });

      const resultado = await entrar(numeroLimpo, senha);
      
      manterDadosLocal(resultado, true);
    });
  }
})();


function manterDadosLocal(resultado, lembrar) {
        // Mantém o número se já estiver guardado neste aparelho
        let numeroSalvo = "";
        let anterior = null;
        
        try {
            anterior = JSON.parse(localStorage.getItem("connect_usuario"));
            if (anterior?.telefone) {
              console.log("Número salvo anteriormente:", anterior.telefone);
              numeroSalvo = anterior.telefone;
            }
        } catch (e) {
            alert("Não foi possível ler o número salvo no aparelho."+
                e
            );
        }

        const dadosUsuario = {
            id: resultado.id,
            nome: resultado.nome || "",
            telefone: resultado.telefone || numeroSalvo,
            email: resultado.email
        };
        
        executarComPausa(anterior);

        localStorage.setItem("connect_usuario", JSON.stringify(dadosUsuario));

        try {
            if (lembrar) {
                localStorage.setItem("connect_lembrar", "sim");
            } else {
                localStorage.removeItem("connect_lembrar");
            }
        } catch (e) {
            alert("Não foi possível salvar a preferência de 'lembrar login'.\n" + e);
        }

        sessionStorage.removeItem("rascunhoCadastro");
        sessionStorage.removeItem("termosAceitos");

        mensagem.textContent = "Login realizado com sucesso!";

       location.replace('app.html');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function executarComPausa(dados) {
  console.log(dados);
  await sleep(10000);
}