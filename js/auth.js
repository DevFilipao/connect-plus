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

async function entrar(telefone, senha, lembrar) {
  var dados = await chamarApi('login', { telefone: telefone, senha: senha });
  Sessao.salvar(dados, lembrar);
  return dados;
}

function ligarFormulario(form, aoEnviar) {
  var erro = form.querySelector('.erro'); // só o cadastro tem; no login o erro vai para alert
  var botao = form.querySelector('button[type="submit"]');
  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    if (erro) erro.textContent = '';
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

        await entrar(numeroLimpo, senha, lembrar);

        finalizarLogin();

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

      await entrar(numeroLimpo, senha, true);

      finalizarLogin();
    });
  }
})();


// A sessão já foi salva por entrar(); aqui só limpa rascunhos e segue para o app.
function finalizarLogin() {
  // Chaves de versões antigas (a sessão agora fica só em 'sessao')
  localStorage.removeItem("connect_usuario");
  localStorage.removeItem("connect_lembrar");

  sessionStorage.removeItem("rascunhoCadastro");
  sessionStorage.removeItem("termosAceitos");

  mensagem.textContent = "Login realizado com sucesso!";

  location.replace('app.html');
}