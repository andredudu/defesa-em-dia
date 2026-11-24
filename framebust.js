(function () {
  "use strict";
  if (window.self === window.top) return;
  try {
    window.top.location.replace(window.self.location.href);
  } catch (e) {}
  /* Se a navegação do quadro superior for bloqueada (comum entre origens
     distintas, sem clique), não entregamos a página ao site que nos embutiu. */
  document.documentElement.style.display = "none";
  window.addEventListener("DOMContentLoaded", function () {
    if (window.self === window.top) {
      document.documentElement.style.display = "block";
      return;
    }
    document.documentElement.replaceChildren();
    document.documentElement.style.display = "block";
    var p = document.createElement("p");
    p.textContent = "Esta página não pode ser exibida dentro de outro site.";
    document.documentElement.appendChild(p);
  });
})();
