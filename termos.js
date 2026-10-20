const abas = document.querySelectorAll(".aba");
        const documentos = document.querySelectorAll(".documento");

        function mostrar(alvo, atualizarHash) {

            abas.forEach(function (aba) {
                const ativa = aba.dataset.alvo === alvo;
                aba.classList.toggle("ativa", ativa);
                aba.setAttribute("aria-selected", ativa ? "true" : "false");
            });

            documentos.forEach(function (doc) {
                doc.classList.toggle("ativo", doc.id === alvo);
            });


            if (atualizarHash) {
                history.replaceState(null, "", "#" + alvo);
                window.scrollTo({ top: 0 });
            }
        }


        abas.forEach(function (aba) {
            aba.addEventListener("click", function () {
                mostrar(aba.dataset.alvo, true);
            });
        });

        function abrirPeloLink() {


            const hash = location.hash.replace("#", "");


            if (hash === "privacidade" || hash.startsWith("p")) {
                mostrar("privacidade", false);
            } else if (hash === "termos" || hash.startsWith("t")) {
                mostrar("termos", false);
            }


            if (hash) {
                const el = document.getElementById(hash);
                if (el && !el.classList.contains("documento")) {
                    el.scrollIntoView();
                }
            }
        }

        abrirPeloLink();
        window.addEventListener("hashchange", abrirPeloLink);

        document.getElementById("btnAceitar").addEventListener("click", function () {
            try {
                sessionStorage.setItem("termosAceitos", "sim");
            } catch (e) {}
            history.back();
        });