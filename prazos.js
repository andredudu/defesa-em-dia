(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (typeof root === "object" && root) {
    root.DefesaEmDiaPrazos = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var REGRAS_PRAZO = {
    stone: {
      nome: "Stone",
      diasCorridos: 10,
      diasPreventivos: 10,
      nota: "A ajuda oficial da Stone publica 10 dias corridos após o recebimento do alerta. Passado o prazo, a Dash marca prazo excedido.",
      fonte: "https://ajuda.stone.com.br/contestacao-de-chargeback"
    },
    pagarme: {
      nome: "Pagar.me",
      diasCorridos: 10,
      diasPreventivos: 10,
      nota: "A ajuda oficial do Pagar.me informa 10 dias corridos após o recebimento da notificação.",
      fonte: "https://pagarme.helpjuice.com/pt_BR/chargeback-o-que-e-como-funciona-e-como-contestar"
    },
    cielo: {
      nome: "Cielo",
      diasCorridos: 10,
      diasPreventivos: 10,
      nota: "Uma FAQ oficial da Cielo e a documentação da API Cielo falam em 10 dias corridos da notificação (a API Braspag cita 7 dias). Confira sempre o prazo escrito no seu aviso.",
      fonte: "https://docs.cielo.com.br/atendimento/docs/faq-chargeback"
    },
    getnet: {
      nome: "Getnet",
      diasCorridos: 12,
      diasPreventivos: 12,
      nota: "A página de ajuda e o Manual 2026 da Getnet informam 12 dias corridos a partir da notificação, em um único PDF (até 10 MB e 15 páginas; Visa em inglês).",
      fonte: "https://site.getnet.com.br/get-ajuda-chargeback/sobre-o-chargeback/"
    },
    mercadopago: {
      nome: "Mercado Pago",
      diasCorridos: 10,
      diasPreventivos: 7,
      nota: "As páginas oficiais do Mercado Pago divergem: 7 a 10 dias corridos (blog de 28/09/2026), 10 dias corridos (ajuda contestação) e 10 dias úteis (ajuda proteção ao vendedor). O lembrete usa 7 dias corridos como margem preventiva — confirme na sua notificação.",
      fonte: "https://www.mercadopago.com.br/blog/disputa-de-contestacoes-mais-uma-maneira-com-que-o-mercado-pago-te-protege-contra-chargebacks"
    },
    pagbank: {
      nome: "PagBank / PagSeguro",
      diasCorridos: null,
      diasPreventivos: null,
      nota: "O guia oficial do PagBank não fixa um número de dias: o prazo é o exibido na Central de Soluções do seu caso. Informe abaixo a data-limite exata que aparece lá para gerar o lembrete.",
      fonte: "https://blog.pagbank.com.br/guia-do-chargeback"
    },
    rede: {
      nome: "Rede",
      diasCorridos: null,
      diasPreventivos: null,
      nota: "O prazo numérico em dias para o lojista não constava do texto público aberto nesta pesquisa. Confira o portal ou a notificação e informe a data-limite exata abaixo para gerar o lembrete.",
      fonte: "https://developer.userede.com.br/chargeback"
    }
  };

  function parseISODate(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    var parts = iso.split("-").map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    if (
      d.getUTCFullYear() !== parts[0] ||
      d.getUTCMonth() !== parts[1] - 1 ||
      d.getUTCDate() !== parts[2]
    ) {
      return null;
    }
    return d;
  }

  function addDaysUTC(date, days) {
    var d = new Date(date.getTime());
    d.setUTCDate(d.getUTCDate() + days);
    return d;
  }

  function formatISODate(date) {
    var y = date.getUTCFullYear();
    var m = String(date.getUTCMonth() + 1).padStart(2, "0");
    var d = String(date.getUTCDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function formatBR(date) {
    var dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    var dd = String(date.getUTCDate()).padStart(2, "0");
    var mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    var yyyy = date.getUTCFullYear();
    return dd + "/" + mm + "/" + yyyy + " (" + dias[date.getUTCDay()] + ")";
  }

  function formatBRCurto(date) {
    var dd = String(date.getUTCDate()).padStart(2, "0");
    var mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    var yyyy = date.getUTCFullYear();
    return dd + "/" + mm + "/" + yyyy;
  }

  function calcularPrazo(opts) {
    var adq = (opts && opts.adquirente ? String(opts.adquirente) : "stone").toLowerCase();
    var regra = REGRAS_PRAZO[adq] || REGRAS_PRAZO.stone;
    var dataManual = parseISODate(opts && opts.dataManual);
    var dataNotif = parseISODate(opts && opts.dataNotificacao);

    if (dataManual) {
      return {
        ok: true,
        adquirente: adq,
        adquirenteNome: regra.nome,
        origem: "manual",
        dataLimiteISO: formatISODate(dataManual),
        dataLimiteBR: formatBR(dataManual),
        dataLimiteCurta: formatBRCurto(dataManual),
        dataSecundariaBR: null,
        nota: "Usando a data exata informada por você a partir da notificação. Confira o horário-limite do portal e protocolo antes do vencimento.",
        textoFormulario: formatBRCurto(dataManual) + " (conforme notificação)"
      };
    }

    if (!dataNotif) {
      return {
        ok: false,
        adquirente: adq,
        adquirenteNome: regra.nome,
        erro: "Informe a data em que recebeu a notificação ou preencha a data-limite exata do aviso."
      };
    }

    if (regra.diasPreventivos === null) {
      return {
        ok: false,
        adquirente: adq,
        adquirenteNome: regra.nome,
        semPrazoFixo: true,
        erro: regra.nota
      };
    }

    var limitePrev = addDaysUTC(dataNotif, regra.diasPreventivos);
    var limiteMax = regra.diasCorridos && regra.diasCorridos !== regra.diasPreventivos
      ? addDaysUTC(dataNotif, regra.diasCorridos)
      : null;

    var textoForm = formatBRCurto(limitePrev) + " (estimativa de " + regra.diasPreventivos + " dias corridos; conferir na notificação)";
    if (adq === "mercadopago") {
      textoForm = "Entre " + formatBRCurto(limitePrev) + " e " + formatBRCurto(limiteMax) + " (conferir data exata na notificação)";
    }

    return {
      ok: true,
      adquirente: adq,
      adquirenteNome: regra.nome,
      origem: "regra",
      diasUsados: regra.diasPreventivos,
      dataLimiteISO: formatISODate(limitePrev),
      dataLimiteBR: formatBR(limitePrev),
      dataLimiteCurta: formatBRCurto(limitePrev),
      dataSecundariaBR: limiteMax ? formatBR(limiteMax) : null,
      nota: regra.nota,
      textoFormulario: textoForm
    };
  }

  function escaparICS(texto) {
    return String(texto || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function compactDate(iso) {
    return iso.replace(/-/g, "");
  }

  function gerarICS(opts) {
    var limite = parseISODate(opts && opts.dataLimiteISO);
    if (!limite) {
      throw new Error("Data-limite inválida para gerar o lembrete.");
    }
    var adqNome = (opts && opts.adquirenteNome) || "Adquirente";
    var ident = (opts && opts.identificacao ? String(opts.identificacao).trim() : "");
    var ant = parseInt(opts && opts.antecedenciaDias, 10);
    if (isNaN(ant) || ant < 1 || ant > 7) ant = 2;

    var proximoDia = addDaysUTC(limite, 1);
    var diaAlerta = addDaysUTC(limite, -ant);
    var diaAlertaFim = addDaysUTC(diaAlerta, 1);

    var now = new Date();
    var dtstamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    var sufixo = ident ? " (" + ident + ")" : "";
    var desc = "Prazo estimado para protocolar defesa de chargeback no portal " + adqNome + sufixo +
      ". Confira sempre a data exata escrita na notificacao do adquirente. Nao inclui garantia de reversao.";

    var uidBase = dtstamp + "-" + adqNome.toLowerCase().replace(/[^a-z0-9]/g, "") + "@defesaemdia";

    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Defesa em Dia//Calculadora de Prazo//PT-BR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:prazo-" + uidBase,
      "DTSTAMP:" + dtstamp,
      "DTSTART;VALUE=DATE:" + compactDate(formatISODate(limite)),
      "DTEND;VALUE=DATE:" + compactDate(formatISODate(proximoDia)),
      "SUMMARY:" + escaparICS("Prazo final chargeback — " + adqNome + sufixo),
      "DESCRIPTION:" + escaparICS(desc),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + escaparICS("Prazo de chargeback hoje — " + adqNome + sufixo),
      "TRIGGER:PT9H",
      "END:VALARM",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "UID:alerta-" + uidBase,
      "DTSTAMP:" + dtstamp,
      "DTSTART;VALUE=DATE:" + compactDate(formatISODate(diaAlerta)),
      "DTEND;VALUE=DATE:" + compactDate(formatISODate(diaAlertaFim)),
      "SUMMARY:" + escaparICS("Preparar defesa chargeback — " + adqNome + sufixo + " (vence " + formatBRCurto(limite) + ")"),
      "DESCRIPTION:" + escaparICS("Separar NF, rastreio/AR e montar carta em https://andredudu.github.io/defesa-em-dia/app.html antes do vencimento em " + formatBRCurto(limite) + "."),
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:" + escaparICS("Faltam " + ant + " dias para o prazo do chargeback — " + adqNome),
      "TRIGGER:PT9H",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    return lines.join("\r\n") + "\r\n";
  }

  return {
    REGRAS_PRAZO: REGRAS_PRAZO,
    calcularPrazo: calcularPrazo,
    gerarICS: gerarICS,
    parseISODate: parseISODate
  };
});
