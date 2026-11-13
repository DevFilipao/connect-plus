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