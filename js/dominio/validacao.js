function validarLogin({ telefone, senha, aceitouTermos, confirmouTitular }) {
    const erros = [];

    if (!telefone) erros.push("Informe o número de telefone.");
    if (!senha) erros.push("Informe a senha.");
    if (telefone && telefone.length < 10) erros.push("Digite um número válido com DDD!");
    if (senha && senha.length < 6) erros.push("Digite sua senha (mínimo de 6 caracteres).");
    if (!aceitouTermos) erros.push("Para continuar, aceite os Termos de Uso e a Política de Privacidade.");
    if (!confirmouTitular) erros.push("Para continuar, confirme que você é o titular da conta.");

    return erros;
}

function validarCadastro({ nome, senha, confirmarSenha }) {
    const erros = [];

    if (!nome) erros.push("Informe o nome.");
    else if (nome.length < 3) erros.push("O nome deve ter pelo menos 3 caracteres.");
    if (senha !== confirmarSenha) erros.push("As senhas não conferem.");

    return erros;
}

if (typeof module === "object" && module.exports) {
    module.exports = { validarLogin, validarCadastro };
}
