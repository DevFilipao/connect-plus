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

function abrirPagina(pagina) {
    document.querySelectorAll(".view").forEach(view => {
        view.classList.remove("active");
    });


    document.getElementById(`view-${pagina}`).classList.add("active");


    document.querySelectorAll(".menu-item").forEach(botao => {
        botao.classList.toggle("active", botao.dataset.view === pagina);
    });


    document.getElementById("tituloPagina").textContent = titulos[pagina][0];
    document.getElementById("subtituloPagina").textContent = titulos[pagina][1];


    if (pagina === "tarefas") renderizarTarefas();
    if (pagina === "eventos") renderizarEventos();
    if (pagina === "enquetes") renderizarEnquetes();
    if (pagina === "memoria") renderizarMemoria();
}