// Liga a API falsa ao navegador: toda chamada ao Apps Script é respondida localmente.
const { criarApiFalsa } = require("../apoio/api-falsa");

async function ligarApiFalsa(contextoOuPagina, sobrescritas) {
    const api = criarApiFalsa(sobrescritas);
    await contextoOuPagina.route("https://script.google.com/**", async route => {
        const request = route.request();
        const envelope = api.responder(request.postData() || "{}", {
            url: request.url(),
            metodo: request.method(),
            headers: request.headers()
        });
        await route.fulfill({
            status: 200,
            contentType: "application/json",
            headers: { "access-control-allow-origin": "*" },
            body: JSON.stringify(envelope)
        });
    });
    return api;
}

module.exports = { ligarApiFalsa };
