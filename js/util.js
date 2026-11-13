// Depende de formatarTelefone (js/dominio/formato.js), que deve ser carregado antes.
function aplicarMascaraTelefone(campo) {
    campo.addEventListener("input", function () {
        campo.value = formatarTelefone(campo.value);
    });
}
