(function () {
  "use strict";
  const boxes = Array.from(document.querySelectorAll(".check-grupo input[type='checkbox']"));
  const contador = document.getElementById("check-contador");
  const limpar = document.getElementById("check-limpar");
  const imprimir = document.getElementById("check-imprimir");

  function atualizar() {
    if (!contador) return;
    const marcados = boxes.filter((b) => b.checked).length;
    contador.textContent = marcados + " de " + boxes.length + " itens marcados nesta sessão (nada é salvo fora da aba).";
  }

  boxes.forEach((b) => b.addEventListener("change", atualizar));
  if (limpar) {
    limpar.addEventListener("click", () => {
      boxes.forEach((b) => { b.checked = false; });
      atualizar();
    });
  }
  if (imprimir) {
    imprimir.addEventListener("click", () => window.print());
  }
  atualizar();
})();
