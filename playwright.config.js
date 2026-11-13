// E2E em navegador real. O site é servido como no README (python3 -m http.server),
// numa porta própria para não brigar com o servidor de desenvolvimento (8080).
// A API do Apps Script é SEMPRE interceptada (tests/e2e/apoio.js): nenhum teste chama o back-end real.
const { defineConfig, devices } = require("@playwright/test");

const PORTA = 8090;

module.exports = defineConfig({
    testDir: "tests/e2e",
    fullyParallel: true,
    reporter: "list",
    use: {
        baseURL: `http://127.0.0.1:${PORTA}`,
        timezoneId: "America/Sao_Paulo",
        locale: "pt-BR"
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: {
        command: `python3 -m http.server ${PORTA} --bind 127.0.0.1`,
        url: `http://127.0.0.1:${PORTA}/login.html`,
        reuseExistingServer: !process.env.CI,
        stdout: "ignore",
        stderr: "ignore"
    }
});
