// Cole aqui a URL do Web App (termina em /exec).
var API_URL = 'https://script.google.com/macros/s/AKfycbxNzN-Wo4vlY05E1eNE0sRD546RB3V-6AhXg50OUFODFuItYF9jMdfaMMNebjJZ_HDL9Q/exec';

// Todas as chamadas são POST com JSON enviado como text/plain.
// Isso evita o preflight CORS, que o Apps Script não responde.
async function chamarApi(acao, dados) {
  if (API_URL.indexOf('COLE_AQUI') === 0) {
    throw new Error('Configure API_URL em js/api.js');
  }

  var resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ acao: acao }, dados || {}))
  });
  var json = await resp.json();

  if (!json.ok) {
    var e = new Error(json.erro || 'Erro na API.');
    e.codigo = json.codigo;
    throw e;
  }
  return json.dados;
}
