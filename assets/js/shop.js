/* Shop page: load products, render cards, search + category filter + sort. */
(function () {
  "use strict";

  var grid = document.getElementById("shop-grid");
  var searchInput = document.getElementById("shop-search");
  var filterWrap = document.getElementById("shop-filters");
  var sortSel = document.getElementById("shop-sort");
  var countEl = document.getElementById("shop-count");
  if (!grid) return;

  var all = [];
  var activeCat = "All";
  var query = "";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Number(n).toFixed(2); }

  function categories(list) {
    var set = {};
    list.forEach(function (p) { set[p.category] = true; });
    return ["All"].concat(Object.keys(set).sort());
  }

  function initials(name) {
    return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s|-/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  function sortList(list) {
    var v = sortSel ? sortSel.value : "featured";
    var c = list.slice();
    if (v === "price-asc") c.sort(function (a, b) { return a.price - b.price; });
    else if (v === "price-desc") c.sort(function (a, b) { return b.price - a.price; });
    else if (v === "name") c.sort(function (a, b) { return a.name.localeCompare(b.name); });
    return c;
  }

  function render() {
    var q = query.trim().toLowerCase();
    var shown = sortList(all.filter(function (p) {
      var matchCat = activeCat === "All" || p.category === activeCat;
      var hay = (p.name + " " + p.alias + " " + p.summary + " " + p.category).toLowerCase();
      return matchCat && (!q || hay.indexOf(q) !== -1);
    }));

    if (countEl) countEl.textContent = shown.length + " of " + all.length + " products";

    if (!shown.length) {
      grid.innerHTML = '<p class="empty">No products match your search. Try another term or category.</p>';
      return;
    }

    grid.innerHTML = shown.map(function (p) {
      var soldOut = !p.stock;
      return (
        '<article class="product">' +
          '<div class="product__media" aria-hidden="true"><span>' + esc(initials(p.name)) + "</span>" +
            (p.tag ? '<span class="product__tag">' + esc(p.tag) + "</span>" : "") +
          "</div>" +
          '<div class="product__body">' +
            '<div class="product__cat">' + esc(p.category) + "</div>" +
            "<h3>" + esc(p.name) + "</h3>" +
            '<p class="alias">' + esc(p.size) + " · " + esc(p.purity) + "</p>" +
            "<p>" + esc(p.summary) + "</p>" +
            '<div class="product__foot">' +
              '<span class="price">' + money(p.price) + "</span>" +
              (soldOut
                ? '<button class="btn btn--ghost" disabled>Sold out</button>'
                : '<button class="btn btn--primary" data-add data-sku="' + esc(p.sku) +
                    '" data-name="' + esc(p.name) + '" data-size="' + esc(p.size) +
                    '" data-price="' + p.price + '">Add to cart</button>') +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function buildFilters() {
    if (!filterWrap) return;
    filterWrap.innerHTML = categories(all).map(function (c) {
      return '<button class="chip" type="button" aria-pressed="' +
        (c === activeCat) + '" data-cat="' + esc(c) + '">' + esc(c) + "</button>";
    }).join("");
    filterWrap.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      activeCat = btn.getAttribute("data-cat");
      filterWrap.querySelectorAll(".chip").forEach(function (c) {
        c.setAttribute("aria-pressed", c === btn ? "true" : "false");
      });
      render();
    });
  }

  if (searchInput) searchInput.addEventListener("input", function () { query = searchInput.value; render(); });
  if (sortSel) sortSel.addEventListener("change", render);

  fetch("assets/data/products.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) { all = data; buildFilters(); render(); })
    .catch(function () {
      grid.innerHTML = '<p class="empty">Unable to load products right now. Please refresh the page.</p>';
    });
})();
