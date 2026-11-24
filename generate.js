(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  if (typeof root === "object" && root) {
    root.DefesaEmDia = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
/**
 * Gera carta, checklist e passos do portal no navegador (modelo fixo).
 * Sem inventar fato: só usa o que veio no formulário.
 * Sem chave de API e sem envio dos dados a um servidor.
 */

const ADQUIRENTES = {
  cielo: {
    nome: "Cielo",
    passos: [
      "Abra a notificação e anote o prazo escrito nela — este é o que vale.",
      "No site Cielo, vá em Vendas e abra Contestação de Vendas (documentação oficial do e-commerce Cielo). Também existem o App Cielo Gestão e a API de Chargeback, com as mesmas informações, segundo a FAQ da API.",
      "Prazo publicado numa FAQ de atendimento da Cielo: 10 dias corridos a partir da notificação. Essa FAQ menciona webhook de split. A API Cielo fala em 10 dias; a API Braspag, em 7 dias. Se a sua notificação disser outra coisa, siga a notificação.",
      "Anexe os documentos no portal ou na API. A recusa via API pede uma descrição curta (até 100 caracteres) e um documento que comprove que a venda foi legítima.",
      "A decisão final segue as regras da bandeira. O processo pode se estender por até 120 dias, segundo a mesma FAQ."
    ]
  },
  stone: {
    nome: "Stone",
    passos: [
      "O prazo oficial da Stone é de 10 dias corridos após o recebimento do alerta. Sem documentos nesse prazo, a Dash marca prazo excedido e a contestação é perdida.",
      "Use o botão “Enviar documentação” no e-mail de notificação (abre o App Stone em Vendas → Contestação) ou responda ao e-mail no formato pedido na mensagem.",
      "Arquivos em PDF ou JPG (a ajuda também cita JPEG/JTIF). Sem áudio ou vídeo. Renomeie com o Stone ID (14 dígitos). Tamanho máximo citado: 50 MB. Todas as páginas na mesma orientação.",
      "Não inclua links, telefone ou e-mail “para mais informações”. Não envie número completo, validade ou CVV do cartão. Coloque o rastreio em captura de tela, não como link.",
      "Segundo a ajuda oficial, prints de conversa não são aceitos como documento principal; prints de rede social são só complemento.",
      "Acompanhe na Dash. A análise do banco pode levar até 120 dias. Se a Stone reapresentar, o crédito citado é de até 3 dias úteis. Um segundo chargeback, se o banco recusar, é descrito pela Stone como sem recurso."
    ]
  },
  mercadopago: {
    nome: "Mercado Pago",
    passos: [
      "Abra a seção Atividade da conta Mercado Pago, encontre a venda e escolha “Gerenciar contestação”.",
      "Há divergência entre páginas oficiais sobre o prazo: 10 dias corridos, 10 dias úteis, ou “7 a 10 dias corridos” no blog de 28/09/2026. Use o prazo da notificação; na dúvida, o mais curto.",
      "Envie o comprovante de entrega exigido para a forma de envio (veja o checklist). Entregas pelos Envios do Mercado Livre, no Programa de Proteção ao Vendedor, dispensam comprovante extra, segundo a ajuda oficial — a explicação do caso ainda deve ser enviada se a tela pedir.",
      "Capturas de conversas em redes sociais e histórico de motoristas de aplicativo não são aceitos como comprovante desse programa.",
      "Acompanhe o status no detalhe da transação, em Atividade. Se o comprovante for inválido ou não for enviado no prazo, a ajuda oficial diz que o valor pode ficar retido enquanto o Mercado Pago negocia com o banco (até 120 dias nesse texto). A decisão do emissor, no blog oficial, pode levar de 90 a 150 dias."
    ]
  },
  pagbank: {
    nome: "PagBank",
    passos: [
      "O prazo do lojista é o informado na própria contestação, na Central de Soluções — o guia oficial não publica um número fixo de dias. Se esse prazo passar, o blog do PagBank diz que o caso não reabre e o débito é concluído.",
      "No computador, acesse a conta PagBank, menu à esquerda, Central de Soluções, e use “Responder esta contestação”.",
      "Anexe os comprovantes pedidos para o motivo. Nomeie o PDF com o código da transação. O guia alerta que o arquivo não pode ser alterado depois do envio.",
      "Algumas transações não são passíveis de defesa; nesses casos o débito só aparece no extrato.",
      "Depois do envio, o PagBank tem até 10 dias úteis para analisar. A conclusão com o emissor pode levar até 120 dias corridos a partir do aceite da defesa pelo PagBank."
    ]
  },
  getnet: {
    nome: "Getnet",
    passos: [
      "O prazo oficial é de 12 dias corridos a partir da data da notificação, em um único arquivo. Depois que a documentação vai ao emissor, não é possível complementar.",
      "No Portal Minha Conta: Vendas → Chargeback. Também é possível enviar a pedido.documento@getnet.com.br (um arquivo por caso).",
      "Um único PDF, até 10 MB, no máximo 15 páginas. Título do arquivo: (Número de referência)_(Número de Atividade), campo “Defesa case” da notificação. Texto no corpo do e-mail é desconsiderado.",
      "Se a bandeira for Visa, o Manual de Chargeback 2026 da Getnet exige que a documentação esteja em inglês. Inclua a carta em inglês no mesmo PDF.",
      "Acompanhe o status no Portal Minha Conta. A página de ajuda cita análise do emissor entre 120 e 150 dias. Enviar a defesa não garante vitória."
    ]
  },
  pagarme: {
    nome: "Pagar.me",
    passos: [
      "O prazo oficial é de 10 dias corridos após o recebimento da notificação por e-mail (a mensagem traz uma planilha com ID, valor, motivo e prazo).",
      "No painel: Dashboard → Vendas → Contestações. Ou use “Abrir contestação” no e-mail.",
      "Anexe os documentos pedidos para o motivo e envie. O time do Pagar.me pode recusar a documentação como insuficiente e devolver o status para “Aguardando documentação”; a página de ajuda cita devolutiva em até 13 horas.",
      "Se a venda já tinha sido totalmente estornada, a ajuda oficial diz que em geral não há débito em duplicidade e não é necessário enviar documentos. Confirme no caso concreto.",
      "A análise do banco, segundo a mesma página, pode levar entre 45 e 120 dias."
    ]
  },
  rede: {
    nome: "Rede",
    passos: [
      "O prazo em dias para o lojista não foi encontrado no texto público das páginas oficiais abertas nesta pesquisa. Siga estritamente o prazo da notificação e o caminho indicado no app ou no portal Rede.",
      "A API de Chargeback da Rede (atualizada em 05/03/2026) permite consultar casos, enviar documentos e acompanhar o andamento. Após o envio, há análise de qualidade em até 3 dias úteis.",
      "Formatos citados na documentação da API: .tif, .tiff e .pdf. Nomeie o arquivo com o número do processo. Não inclua dados sensíveis (número de cartão ou CPF). Tamanho máximo citado em fluxos Mastercard: 9,5 MB; até 18 páginas, conforme a fase.",
      "A Rede lembra que, em venda à distância sem senha, a responsabilidade financeira pelo ressarcimento é do estabelecimento.",
      "Não inventamos um caminho de menu do portal além do que a notificação trouxer. Se o e-mail indicar um link ou tela, use esse caminho."
    ]
  }
};

const TIPOS = {
  fraude: "fraude",
  nao_recebido: "nao_recebido",
  diferente: "diferente",
  cancelamento: "cancelamento",
  duplicidade: "duplicidade"
};

function v(s) {
  if (s == null) return "";
  return String(s).trim();
}

function tem(s) {
  return v(s).length > 0 && v(s).toLowerCase() !== "não sei" && v(s).toLowerCase() !== "nao sei" && v(s).toLowerCase() !== "n/a";
}

function pendencia(dados, campo, rotulo) {
  return tem(dados[campo]) ? null : rotulo;
}

function inferirTipo(dados) {
  const t = v(dados.tipoMotivo);
  if (TIPOS[t]) return t;
  const code = v(dados.codigoMotivo).toLowerCase();
  if (/10\.4|4837|4850|\b83\b|fraude|não reconhece|nao reconhece|sem autorização|sem autorizacao/.test(code)) return "fraude";
  if (/13\.1|\b30\b|\b79\b|não recebido|nao recebido|nao receb|não fornec/.test(code)) return "nao_recebido";
  if (/13\.3|13\.4|13\.5|\b53\b|defeito|não conforme|nao conforme|desacordo com a descrição/.test(code)) return "diferente";
  if (/13\.2|13\.6|13\.7|\b41\b|\b75\b|\b85\b|recorrente|assinatura|cancelad|crédito não|credito nao/.test(code)) return "cancelamento";
  if (/12\.6|\b73\b|\b82\b|duplic|outros meios|outro meio/.test(code)) return "duplicidade";
  return "fraude";
}

function tituloTipo(tipo) {
  return {
    fraude: "não reconhecimento da compra / fraude",
    nao_recebido: "produto ou serviço não recebido",
    diferente: "produto diferente do anunciado ou com defeito",
    cancelamento: "cancelamento, assinatura ou crédito não processado",
    duplicidade: "cobrança em duplicidade ou pagamento por outro meio"
  }[tipo] || tipo;
}

function checklist(tipo, dados, adq) {
  const itens = [
    "Notificação completa (motivo, prazo, ID da transação)",
    "Comprovante da venda no gateway ou na maquininha (data, valor, autorização, só os 4 últimos dígitos do cartão)"
  ];
  if (tipo === "fraude") {
    itens.push(
      "Tela ou e-mail de checkout / confirmação do pedido",
      "Cadastro do comprador (nome, e-mail, endereço) — sem PAN",
      "IP, dispositivo ou fingerprint, se existirem",
      "Resultado 3-D Secure / ECI, se a venda teve autenticação",
      "Nota fiscal ou recibo",
      "Comprovante de entrega ou de prestação (print do rastreio com baixa, AR ou aceite) no endereço do cadastro",
      "Histórico de compras anteriores do mesmo cadastro ou cartão, se houver",
      "Carta de reversão + documento com foto + protocolo no banco, somente se o portador reconheceu a compra depois"
    );
  } else if (tipo === "nao_recebido") {
    itens.push(
      "Tela do pedido com o endereço de entrega",
      "Nota fiscal / DANFE",
      "Rastreio completo em captura de tela (não apenas o link)",
      "AR assinado, comprovante da transportadora com recebedor, ou NF assinada por quem recebeu (nome e documento)",
      "Se for serviço: log de uso, OS ou aceite",
      "Se for Mercado Pago + Correios: até R$ 450, rastreio + tela do pedido; acima de R$ 450, rastreio + NF + tela do pedido — ou AR assinado (ajuda oficial do Programa de Proteção)"
    );
  } else if (tipo === "diferente") {
    itens.push(
      "Print da oferta ou da página do produto na época da compra",
      "Nota fiscal e comprovante de entrega",
      "Política de troca/devolução e evidência de que foi apresentada no checkout",
      "Registro da reclamação e do que a loja ofereceu (troca, conserto, reembolso)",
      "Comprovante de estorno ou de que o item não foi devolvido, conforme o caso"
    );
  } else if (tipo === "cancelamento") {
    itens.push(
      "Termos de uso e política de cancelamento",
      "Prova de aceite (data)",
      "Data e canal do pedido de cancelamento, se houver",
      "Log de uso no período cobrado (serviço digital)",
      "Comprovante de estorno já enviado, se houver"
    );
  } else {
    itens.push(
      "Tela ou extrato de TODAS as transações do período (data, hora, valor, autorização)",
      "Notas fiscais correspondentes",
      "Comprovante de cancelamento ou estorno da transação indevida, se houve",
      "Se o outro pagamento foi Pix, boleto, dinheiro ou outro adquirente: esse comprovante",
      "Se são dois pedidos legítimos: os dois pedidos, com itens"
    );
  }
  itens.push("Carta explicativa (gerada abaixo), com anexos numerados");

  const avisos = [];
  if (adq === "stone") {
    avisos.push("Stone: renomeie os arquivos com o Stone ID (14 dígitos); sem links, áudio ou vídeo; prints de conversa não são o documento principal.");
  }
  if (adq === "getnet") {
    avisos.push("Getnet: um único PDF, até 10 MB e 15 páginas; depois do envio ao emissor não dá para complementar.");
    if (v(dados.bandeira).toLowerCase().includes("visa")) {
      avisos.push("Getnet + Visa: a documentação precisa estar em inglês (Manual 2026). Use a versão em inglês da carta no mesmo PDF.");
    }
  }
  if (adq === "mercadopago") {
    avisos.push("Mercado Pago: prints de rede social e histórico de motorista de aplicativo não valem como comprovante do Programa de Proteção. Siga o prazo da notificação (há divergência entre páginas oficiais).");
  }
  if (adq === "pagbank") {
    avisos.push("PagBank: o prazo é o da Central de Soluções; não inventamos um número de dias.");
  }
  if (adq === "rede") {
    avisos.push("Rede: prazo do lojista não encontrado em texto público aberto nesta pesquisa; siga a notificação. Não inclua PAN nem CPF no arquivo, segundo a API.");
  }
  if (adq === "cielo") {
    avisos.push("Cielo: confirme o prazo na notificação (FAQ de atendimento: 10 dias corridos; API Braspag: 7 dias).");
  }
  avisos.push("Enviar a defesa não garante que o banco aceite. A decisão é do emissor.");

  const jaTem = [];
  if (tem(dados.notificacaoPrazo) || tem(dados.codigoMotivo)) jaTem.push("Dados da notificação informados no formulário");
  if (tem(dados.idTransacao)) jaTem.push("ID da transação: " + v(dados.idTransacao));
  if (tem(dados.rastreio)) jaTem.push("Rastreio/status informado");
  if (tem(dados.notaFiscal)) jaTem.push("Nota fiscal informada");
  if (tem(dados.ipDispositivo)) jaTem.push("IP/dispositivo informado");
  if (tem(dados.tresDS)) jaTem.push("3-D Secure / ECI informado");
  if (tem(dados.arquivos)) jaTem.push("Arquivos listados: " + v(dados.arquivos));
  if (tem(dados.estorno)) jaTem.push("Informação sobre estorno/cancelamento");

  const faltas = [
    pendencia(dados, "notificacaoPrazo", "Prazo escrito na notificação"),
    pendencia(dados, "idTransacao", "ID da transação"),
    tipo !== "cancelamento" && tipo !== "duplicidade" ? pendencia(dados, "rastreio", "Rastreio, AR ou prova de prestação") : null,
    pendencia(dados, "notaFiscal", "Número da nota fiscal (se existir — não invente)")
  ].filter(Boolean);

  return { itens, avisos, jaTem, faltas };
}

function fatos(dados) {
  const linhas = [];
  const dVenda = tem(dados.dataVenda) ? v(dados.dataVenda) : "[data da venda não informada]";
  const pedido = tem(dados.pedido) ? v(dados.pedido) : "[pedido não informado]";
  const valor = tem(dados.valor) ? v(dados.valor) : "[valor não informado]";
  const comprador = tem(dados.comprador) ? v(dados.comprador) : "[comprador não informado]";
  linhas.push(`Em ${dVenda}, o comprador ${comprador} concluiu o pedido ${pedido}, no valor de ${valor}.`);
  if (tem(dados.idTransacao)) linhas.push(`Identificação da transação: ${v(dados.idTransacao)}.`);
  if (tem(dados.endereco)) linhas.push(`Endereço informado no checkout: ${v(dados.endereco)}.`);
  if (tem(dados.ipDispositivo)) linhas.push(`Acesso registrado: ${v(dados.ipDispositivo)}.`);
  if (tem(dados.tresDS)) linhas.push(`Autenticação 3-D Secure / ECI: ${v(dados.tresDS)}.`);
  if (tem(dados.envio)) linhas.push(`Forma de envio ou prestação: ${v(dados.envio)}.`);
  if (tem(dados.rastreio)) linhas.push(`Rastreio ou status de entrega/prestação: ${v(dados.rastreio)}.`);
  if (tem(dados.notaFiscal)) linhas.push(`Nota fiscal: ${v(dados.notaFiscal)}.`);
  if (tem(dados.comunicacoes)) linhas.push(`Comunicação com o comprador (conforme relato do lojista): ${v(dados.comunicacoes)}.`);
  if (tem(dados.estorno)) linhas.push(`Cancelamento ou estorno: ${v(dados.estorno)}.`);
  if (tem(dados.historico)) linhas.push(`Histórico anterior: ${v(dados.historico)}.`);
  if (tem(dados.portadorNotificacao) && tem(dados.comprador)) {
    linhas.push(`Nome do portador na notificação: ${v(dados.portadorNotificacao)}. Nome no cadastro da loja: ${v(dados.comprador)}. Se forem diferentes, a Stone alerta que, em fraude, a defesa fica mais frágil sem prova de vínculo — não afirmamos que o vínculo existe.`);
  }
  return linhas;
}

function cartaPT(dados, tipo, adqNome) {
  const loja = tem(dados.loja) ? v(dados.loja) : "[nome / CNPJ do estabelecimento]";
  const prazo = tem(dados.notificacaoPrazo) ? v(dados.notificacaoPrazo) : "[preencher com o prazo da notificação — não inventado]";
  const codigo = tem(dados.codigoMotivo) ? v(dados.codigoMotivo) : "[código e texto da notificação]";
  const bandeira = tem(dados.bandeira) ? v(dados.bandeira) : "[bandeira]";
  const linhasFato = fatos(dados);
  const corpo = linhasFato.map((l, i) => `${i + 1}. ${l}`).join("\n");
  return `${loja ? "" : ""}${adqNome ? `À equipe de chargeback da/o ${adqNome}` : "À equipe de chargeback do adquirente"}

Referência da transação: ${tem(dados.idTransacao) ? v(dados.idTransacao) : "[ID]"}
Bandeira: ${bandeira}
Código e motivo informados na notificação: ${codigo}
Prazo indicado na notificação (é este que vale): ${prazo}
Valor: ${tem(dados.valor) ? v(dados.valor) : "[valor]"}

Solicitamos a reapresentação / recusa desta contestação, relativa a ${tituloTipo(tipo)}. Os fatos abaixo repetem apenas o que o estabelecimento informou. Não incluímos prova que não tenha sido descrita.

Fatos, em ordem:

${corpo}

Os anexos correspondem aos arquivos que o estabelecimento listou${tem(dados.arquivos) ? `: ${v(dados.arquivos)}` : " (listar e numerar no momento do envio)"}. Não enviamos número completo de cartão, validade nem código de segurança.

Pedimos o acatamento da defesa e a manutenção do crédito da transação em favor deste estabelecimento. Registramos que o envio desta documentação não garante o resultado: a decisão é do banco emissor, segundo as regras da bandeira. Este texto é um apoio operacional, não um parecer jurídico.

${loja}`;
}

function cartaEN(dados, tipo, adqNome) {
  const lines = fatos(dados).map((l, i) => `${i + 1}. ${l}`).join("\n");
  return `To the ${adqNome} chargeback team

Transaction reference: ${tem(dados.idTransacao) ? v(dados.idTransacao) : "[ID]"}
Card brand / reason as stated in the notice: ${tem(dados.codigoMotivo) ? v(dados.codigoMotivo) : "[reason]"}
Deadline stated in the notice: ${tem(dados.notificacaoPrazo) ? v(dados.notificacaoPrazo) : "[deadline from the notice]"}
Amount: ${tem(dados.valor) ? v(dados.valor) : "[amount]"}

We request representment of this dispute (${tituloTipo(tipo)}). The facts below repeat only what the merchant provided. We have not added evidence that was not described.

${lines}

Annexes should match the files listed by the merchant. We do not enclose full PAN, expiry or security code.

We ask that the transaction amount remain with this merchant. Submitting this defence does not guarantee a favourable outcome; the issuer decides under the scheme rules. This text is an operational aid, not legal advice.

${tem(dados.loja) ? v(dados.loja) : "[merchant]"}`;
}

function montarModelo(dados) {
  const adq = v(dados.adquirente).toLowerCase() || "stone";
  const meta = ADQUIRENTES[adq] || ADQUIRENTES.stone;
  const tipo = inferirTipo(dados);
  const chk = checklist(tipo, dados, adq in ADQUIRENTES ? adq : "stone");
  const visaGetnet = adq === "getnet" && v(dados.bandeira).toLowerCase().includes("visa");
  return {
    modo: "modelo",
    tipo,
    tipoRotulo: tituloTipo(tipo),
    adquirente: meta.nome,
    carta: cartaPT(dados, tipo, meta.nome),
    cartaIngles: visaGetnet ? cartaEN(dados, tipo, meta.nome) : "",
    checklist: chk,
    passos: meta.passos,
    avisos: [
      ...chk.avisos,
      "Revise cada frase antes de protocolar. Se um fato estiver errado, corrija. Não complete lacunas com exemplo."
    ]
  };
}


function gerar(dados) {
  return montarModelo(dados);
}

return { gerar: gerar, montarModelo: montarModelo, ADQUIRENTES: ADQUIRENTES, inferirTipo: inferirTipo };
});
