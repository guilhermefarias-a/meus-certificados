
const certificados = [

    {
        nome: "Fundamentos de Redes",
        instituicao: "Instituição de ensino",
        categoria: "Redes",
        data: "2026",
        imagem: "certificados/redes.jpg"
    },

    {
        nome: "Excel e Planilhas",
        instituicao: "Instituição de ensino",
        categoria: "Dados",
        data: "2026",
        imagem: "certificados/excel.jpg"
    },

    {
        nome: "Análise de Dados",
        instituicao: "Instituição de ensino",
        categoria: "Dados",
        data: "2026",
        imagem: "certificados/analise-dados.jpg"
    }

];

const galeria = document.getElementById("galeria");
const pesquisa = document.getElementById("pesquisa");
const categoria = document.getElementById("categoria");
const mensagem = document.getElementById("mensagem");

const modal = document.getElementById("modal");
const imagemModal = document.getElementById("imagemModal");
const tituloModal = document.getElementById("tituloModal");
const detalhesModal = document.getElementById("detalhesModal");
const baixar = document.getElementById("baixar");

function mostrarCertificados() {

    galeria.innerHTML = "";

    const termo = pesquisa.value.toLowerCase();
    const filtro = categoria.value;

    const encontrados = certificados.filter(certificado => {

        const correspondePesquisa =
            certificado.nome.toLowerCase().includes(termo) ||
            certificado.instituicao.toLowerCase().includes(termo);

        const correspondeCategoria =
            filtro === "todos" ||
            certificado.categoria === filtro;

        return correspondePesquisa && correspondeCategoria;

    });

    mensagem.textContent = encontrados.length === 0
        ? "Nenhum certificado encontrado."
        : "";

    encontrados.forEach(certificado => {

        const cartao = document.createElement("article");
        cartao.className = "certificado";

        const imagem = document.createElement("img");
        imagem.src = certificado.imagem;
        imagem.alt = certificado.nome;

        const info = document.createElement("div");
        info.className = "info";

        const titulo = document.createElement("h3");
        titulo.textContent = certificado.nome;

        const instituicao = document.createElement("p");
        instituicao.textContent = certificado.instituicao;

        const data = document.createElement("p");
        data.textContent = "Ano: " + certificado.data;

        const etiqueta = document.createElement("span");
        etiqueta.className = "etiqueta";
        etiqueta.textContent = certificado.categoria;

        info.append(titulo, instituicao, data, etiqueta);
        cartao.append(imagem, info);

        cartao.addEventListener("click", () => {
            abrirCertificado(certificado);
        });

        imagem.addEventListener("error", () => {
            imagem.alt = "Imagem não encontrada";
        });

        galeria.appendChild(cartao);

    });

}

function abrirCertificado(certificado) {

    imagemModal.src = certificado.imagem;
    tituloModal.textContent = certificado.nome;

    detalhesModal.textContent =
        certificado.instituicao + " | " + certificado.data;

    baixar.href = certificado.imagem;
    baixar.download = certificado.imagem.split("/").pop();

    modal.classList.add("ativo");

}

function fecharModal() {
    modal.classList.remove("ativo");
    imagemModal.src = "";
}

pesquisa.addEventListener("input", mostrarCertificados);
categoria.addEventListener("change", mostrarCertificados);

document.getElementById("fechar").addEventListener("click", fecharModal);

modal.addEventListener("click", (evento) => {
    if (evento.target === modal) {
        fecharModal();
    }
});

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") {
        fecharModal();
    }
});

mostrarCertificados();
