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

  // Calculadora de prazo e lembrete (.ics)
  const calcAdq = document.getElementById("calc-adquirente");
  const calcNotif = document.getElementById("calc-data-notif");
  const calcManual = document.getElementById("calc-data-manual");
  const calcIdent = document.getElementById("calc-ident");
  const calcAnt = document.getElementById("calc-antecedencia");
  const calcBtn = document.getElementById("calc-btn");
  const calcUsar = document.getElementById("calc-usar");
  const calcIcs = document.getElementById("calc-ics");
  const calcRes = document.getElementById("calc-resultado");
  const calcTitulo = document.getElementById("calc-titulo");
  const calcNota = document.getElementById("calc-nota");
  const calcSec = document.getElementById("calc-secundaria");
  let ultimoCalculo = null;

  function executarCalculo() {
    if (!window.DefesaEmDiaPrazos || !calcAdq || !calcRes) return;
    const res = DefesaEmDiaPrazos.calcularPrazo({
      adquirente: calcAdq.value,
      dataNotificacao: calcNotif ? calcNotif.value : "",
      dataManual: calcManual ? calcManual.value : ""
    });
    calcRes.classList.remove("escondido");
    if (!res.ok) {
      ultimoCalculo = null;
      calcTitulo.textContent = res.semPrazoFixo
        ? res.adquirenteNome + ": informe a data da notificação"
        : "Preencha uma data para calcular";
      calcNota.textContent = res.erro || "";
      if (calcSec) {
        calcSec.textContent = "";
        calcSec.classList.add("escondido");
      }
      if (calcUsar) calcUsar.disabled = true;
      if (calcIcs) calcIcs.disabled = true;
      return;
    }
    ultimoCalculo = res;
    if (res.origem === "manual") {
      calcTitulo.textContent = "Prazo da notificação: " + res.dataLimiteBR;
    } else if (res.adquirente === "mercadopago") {
      calcTitulo.textContent = "Alerta preventivo (7 dias corridos): " + res.dataLimiteBR;
    } else {
      calcTitulo.textContent = "Data-limite estimada (" + res.diasUsados + " dias corridos): " + res.dataLimiteBR;
    }
    if (calcSec) {
      if (res.dataSecundariaBR) {
        calcSec.textContent = "Referência de 10 dias corridos: " + res.dataSecundariaBR + ". Na dúvida, siga a data escrita na notificação.";
        calcSec.classList.remove("escondido");
      } else {
        calcSec.textContent = "";
        calcSec.classList.add("escondido");
      }
    }
    calcNota.textContent = res.nota + " Confira sempre na sua notificação — é ela que vale.";
    if (calcUsar) calcUsar.disabled = false;
    if (calcIcs) calcIcs.disabled = false;
  }

  if (calcBtn) {
    calcBtn.addEventListener("click", executarCalculo);
  }
  [calcAdq, calcNotif, calcManual].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => {
      if ((calcNotif && calcNotif.value) || (calcManual && calcManual.value)) {
        executarCalculo();
      }
    });
  });

  if (calcUsar) {
    calcUsar.addEventListener("click", () => {
      if (!ultimoCalculo || !ultimoCalculo.ok) return;
      const selectAdq = document.getElementById("adquirente");
      const inputPrazo = document.getElementById("notificacaoPrazo");
      if (selectAdq && ultimoCalculo.adquirente) {
        selectAdq.value = ultimoCalculo.adquirente;
      }
      if (inputPrazo) {
        inputPrazo.value = ultimoCalculo.textoFormulario;
        inputPrazo.focus();
      }
    });
  }

  if (calcIcs) {
    calcIcs.addEventListener("click", () => {
      if (!ultimoCalculo || !ultimoCalculo.ok || !window.DefesaEmDiaPrazos) return;
      try {
        const ics = DefesaEmDiaPrazos.gerarICS({
          dataLimiteISO: ultimoCalculo.dataLimiteISO,
          adquirenteNome: ultimoCalculo.adquirenteNome,
          identificacao: calcIdent ? calcIdent.value : "",
          antecedenciaDias: calcAnt ? calcAnt.value : 2
        });
        const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "prazo-chargeback-" + ultimoCalculo.adquirente + ".ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (err) {
        alert("Não foi possível gerar o arquivo .ics: " + err.message);
      }
    });
  }
})();
