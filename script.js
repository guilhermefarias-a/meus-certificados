/* ====== CONFIGURAÇÃO ====== */
const CONFIG = { usuario: "guilhermefarias-a", repo: "meus-certificados", branch: "main" };

/* Nomes bonitos (opcional). Chave = caminho do arquivo no repositório. */
const TITULOS = {
  "82YSZERQ.jpg": "Certificado 1",
  "APSO2LUQ.jpg": "Certificado 2",
  "certificate_tmp_8a674f55-addf-4bc0-a7a0-11dc69e8c7db-2054933791_page-0001.jpg": "Certificado 3",
  // troque "Certificado 1, 2, 3" pelos nomes dos seus cursos
};

/* Plano B, caso a leitura automática do GitHub falhe (ex.: limite de acessos). */
const MANUAL = [
  // "82YSZERQ.jpg", "APSO2LUQ.jpg", "cursos/python.pdf"
];
/* ========================== */

const EXT = /\.(jpe?g|png|webp|gif|pdf)$/i;
const $ = s => document.querySelector(s);
const bonito = s => s.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
const href = p => p.split("/").map(encodeURIComponent).join("/");
function el(tag, props = {}, ...filhos) {
  const e = Object.assign(document.createElement(tag), props);
  filhos.forEach(f => e.append(f));
  return e;
}

let itens = [], pasta = null, visiveis = [], pos = 0;

async function listar() {
  try {
    const r = await fetch(`https://api.github.com/repos/${CONFIG.usuario}/${CONFIG.repo}/git/trees/${CONFIG.branch}?recursive=1`);
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    return d.tree.filter(t => t.type === "blob" && EXT.test(t.path)).map(t => t.path);
  } catch (e) {
    return MANUAL;
  }
}

function criarItem(caminho) {
  const partes = caminho.split("/");
  return {
    caminho,
    pasta: partes.length > 1 ? partes[0] : null,
    titulo: TITULOS[caminho] || bonito(partes[partes.length - 1]),
    pdf: /\.pdf$/i.test(caminho)
  };
}

function miniatura(it) {
  return it.pdf
    ? el("div", { className: "thumb pdf", textContent: "PDF" })
    : el("div", { className: "thumb" }, el("img", { src: href(it.caminho), alt: it.titulo, loading: "lazy" }));
}

function cartao(thumb, legenda, aoClicar) {
  const b = el("button", { className: "card", type: "button" }, thumb, el("div", { className: "cap", textContent: legenda }));
  b.onclick = aoClicar;
  return b;
}

function desenhar() {
  const grade = $("#grade");
  grade.replaceChildren();
  $("#voltar").hidden = pasta === null;
  $("#titulo").textContent = pasta === null ? "Meus certificados" : bonito(pasta);

  if (pasta === null) {
    const nomes = [...new Set(itens.filter(i => i.pasta).map(i => i.pasta))].sort();
    nomes.forEach(n => {
      const dentro = itens.filter(i => i.pasta === n);
      const t = miniatura(dentro[0]);
      t.append(el("span", { className: "badge", innerHTML: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="1.5" width="9" height="9" rx="2"/><path d="M3 5.5v7a2 2 0 0 0 2 2h7"/></svg>' + dentro.length }));
      grade.append(cartao(t, bonito(n), () => { pasta = n; desenhar(); window.scrollTo(0, 0); }));
    });
    visiveis = itens.filter(i => !i.pasta);
  } else {
    visiveis = itens.filter(i => i.pasta === pasta);
  }
  visiveis.forEach((it, i) => grade.append(cartao(miniatura(it), it.titulo, () => abrir(i))));
  $("#msg").textContent = grade.children.length ? "" : "Nenhum certificado encontrado.";
}

function abrir(i) {
  pos = i;
  const it = visiveis[pos];
  $("#visor").hidden = false;
  document.body.style.overflow = "hidden";
  $("#v-titulo").textContent = it.titulo;
  $("#v-baixar").href = href(it.caminho);
  $("#v-doc").replaceChildren(it.pdf
    ? el("iframe", { src: href(it.caminho), title: it.titulo })
    : el("img", { src: href(it.caminho), alt: "Certificado: " + it.titulo }));
  $("#v-ant").hidden = pos === 0;
  $("#v-prox").hidden = pos === visiveis.length - 1;
}

function fechar() {
  $("#visor").hidden = true;
  $("#v-doc").replaceChildren();
  document.body.style.overflow = "";
}

$("#voltar").onclick = () => { pasta = null; desenhar(); };
$("#v-fechar").onclick = fechar;
$("#v-ant").onclick = () => pos > 0 && abrir(pos - 1);
$("#v-prox").onclick = () => pos < visiveis.length - 1 && abrir(pos + 1);
$("#visor").addEventListener("click", e => { if (e.target.id === "visor" || e.target.id === "v-doc") fechar(); });
document.addEventListener("keydown", e => {
  if ($("#visor").hidden) return;
  if (e.key === "Escape") fechar();
  if (e.key === "ArrowLeft" && pos > 0) abrir(pos - 1);
  if (e.key === "ArrowRight" && pos < visiveis.length - 1) abrir(pos + 1);
});

listar().then(l => { itens = l.map(criarItem); desenhar(); });
