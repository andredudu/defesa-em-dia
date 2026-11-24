(function () {
  const form = document.getElementById("formulario");
  const botao = document.getElementById("gerar");
  if (!form || !botao) return;

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (!window.DefesaEmDia || typeof DefesaEmDia.gerar !== "function") {
      alert("Não foi possível carregar o gerador. Recarregue a página.");
      return;
    }
    botao.disabled = true;
    botao.textContent = "Gerando…";
    try {
      const dados = Object.fromEntries(new FormData(form).entries());
      const json = DefesaEmDia.gerar(dados);
      mostrar(json);
    } catch (err) {
      alert("Não foi possível gerar: " + err.message);
    } finally {
      botao.disabled = false;
      botao.textContent = "Gerar carta, checklist e passos";
    }
  });

  function li(ul, texto) {
    const el = document.createElement("li");
    el.textContent = texto;
    ul.appendChild(el);
  }
  function preencherLista(id, itens, vazio) {
    const ul = document.getElementById(id);
    ul.replaceChildren();
    if (!itens || !itens.length) {
      li(ul, vazio || "Nenhum.");
      return;
    }
    itens.forEach((t) => li(ul, t));
  }
  function mostrar(r) {
    const box = document.getElementById("resultado");
    box.classList.remove("escondido");
    const modo = document.getElementById("modo");
    modo.textContent = "modelo fixo";
    modo.className = "selo modelo";
    document.getElementById("meta").textContent =
      "Adquirente: " + (r.adquirente || "—") + " · Motivo tratado como: " + (r.tipoRotulo || "—") + ".";
    document.getElementById("carta").textContent = r.carta || "";
    const en = document.getElementById("bloco-en");
    if (r.cartaIngles) {
      en.classList.remove("escondido");
      document.getElementById("cartaEn").textContent = r.cartaIngles;
    } else {
      en.classList.add("escondido");
      document.getElementById("cartaEn").textContent = "";
    }
    const chk = r.checklist || {};
    preencherLista("checklist", chk.itens);
    preencherLista("jaTem", chk.jaTem, "Nada além do adquirente e do tipo.");
    preencherLista("faltas", chk.faltas, "Nenhuma pendência automática — ainda assim revise o checklist.");
    preencherLista("passos", r.passos);
    preencherLista("avisos", r.avisos);
    box.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  document.getElementById("copiar").addEventListener("click", async () => {
    const t = document.getElementById("carta").textContent;
    try {
      await navigator.clipboard.writeText(t);
      document.getElementById("copiar").textContent = "Carta copiada";
      setTimeout(() => { document.getElementById("copiar").textContent = "Copiar carta"; }, 2000);
    } catch {
      alert("Não foi possível copiar automaticamente. Selecione o texto da carta.");
    }
  });
  document.getElementById("imprimir").addEventListener("click", () => window.print());
})();
