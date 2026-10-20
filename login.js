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

        // Envio do formulário
        const formulario = document.getElementById("formulario");

        formulario.addEventListener("submit", function (event) {

            event.preventDefault();

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

            mensagem.style.display = "block";

            formulario.reset();

        });