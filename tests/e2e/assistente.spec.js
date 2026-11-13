const { test, expect } = require("@playwright/test");
const { ligarApiFalsa } = require("./apoio");
const { USUARIO } = require("../apoio/api-falsa");

async function abrirJoao(page) {
    await page.locator("#listaConversas .chat-contact", { hasText: "João Lima" }).click();
    await expect(page.locator("#nomeGrupo")).toHaveText("João Lima");
    await expect(page.locator("#mensagens .message-bubble")).toHaveText(["Oi, Maria!"]);
}

async function enviar(page, texto) {
    await page.locator("#campoMensagem").fill(texto);
    await page.locator("#formMensagem button[type=submit]").click();
    await expect(page.locator("#mensagens .message-row.mine .message-bubble").last()).toHaveText(texto);
}

const tiposDasLinhas = page => page.locator("#mensagens").evaluate(el =>
    [...el.children].map(linha => (linha.classList.contains("ai-row") ? "quadro" : linha.classList.contains("mine") ? "minha" : "dele")));

test.beforeEach(async ({ page }) => {
    await ligarApiFalsa(page);
    await page.addInitScript(sessao => localStorage.setItem("sessao", JSON.stringify(sessao)), USUARIO);
    await page.goto("/app.html");
});

test("mensagem de compromisso: o quadro aparece abaixo dela, aceita voto e continua depois de recarregar", async ({ page }) => {
    await abrirJoao(page);
    await enviar(page, "jogo sábado às 19h no Ginásio Central");

    const quadro = page.locator("#mensagens .ai-board");
    await expect(quadro.locator("h4")).toHaveText("Jogo · Sábado");
    await expect(quadro.locator(".ai-board-info li")).toHaveText(["📅 14/11/2026", "🕒 19:00", "📍 Ginásio Central"]);
    expect(await tiposDasLinhas(page)).toEqual(["dele", "minha", "quadro"]);

    await quadro.locator('[data-opcao="0"]').click();
    await expect(quadro.locator('[data-opcao="0"]')).toHaveClass(/voted/);
    await expect(quadro.locator('[data-opcao="0"] strong')).toHaveText("1");

    await page.reload();
    await page.locator("#listaConversas .chat-contact", { hasText: "João Lima" }).click();
    await expect(page.locator("#mensagens .message-bubble")).toHaveText(["Oi, Maria!", "jogo sábado às 19h no Ginásio Central"]);
    await expect(page.locator("#mensagens .ai-board h4")).toHaveText("Jogo · Sábado");
    await expect(page.locator('#mensagens .ai-board [data-opcao="0"]')).toHaveClass(/voted/);
    expect(await tiposDasLinhas(page)).toEqual(["dele", "minha", "quadro"]);
});

test("'Adicionar aos eventos' leva o compromisso para a tela de eventos", async ({ page }) => {
    await abrirJoao(page);
    await enviar(page, "festa dia 20/12 às 21h");
    await page.locator("#mensagens [data-quadro-salvar]").click();
    await expect(page.locator("#mensagens .ai-board-saved")).toHaveText("✓ Salvo em Eventos");

    await page.locator('.menu-item[data-view="eventos"]').click();
    await expect(page.locator("#listaEventos h3")).toHaveText(["Festa"]);
    await expect(page.locator("#listaEventos .event-date")).toContainText("20/12/2026");
});

test("mensagem de tarefa: sugere, abre o formulário preenchido e não troca a conversa aberta", async ({ page }) => {
    await abrirJoao(page);
    await enviar(page, "preciso estudar para a prova");

    await expect(page.locator("#sugestao")).toBeVisible();
    await page.locator("#criarAcao").click();
    await expect(page.locator("#modalTitulo")).toHaveText("Nova tarefa");
    await expect(page.locator("#modalCampos #titulo")).toHaveValue("preciso estudar para a prova");
    await page.locator("#formModal button[type=submit]").click();
    await expect(page.locator("#modal")).toBeHidden();

    await expect(page.locator("#contadorTarefas")).toHaveText("1");
    await expect(page.locator("#nomeGrupo")).toHaveText("João Lima");
    await expect(page.locator("#mensagens .message-bubble")).toHaveText(["Oi, Maria!", "preciso estudar para a prova"]);
});

test("a memória guarda a mensagem e continua depois de recarregar", async ({ page }) => {
    await abrirJoao(page);
    await enviar(page, "preciso estudar para a prova");
    await expect(page.locator("#resumoMemoria .memory-mini")).toHaveText(["preciso estudar para a prova"]);

    await page.reload();
    await expect(page.locator("#resumoMemoria .memory-mini")).toHaveText(["preciso estudar para a prova"]);
    await page.locator('.menu-item[data-view="memoria"]').click();
    await expect(page.locator("#listaMemoria")).toContainText("preciso estudar para a prova");
    await expect(page.locator("#listaMemoria .tag")).toHaveText("João Lima");
});
