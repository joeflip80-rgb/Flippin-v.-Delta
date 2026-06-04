/* Peptide reference library: load JSON, render cards, live search + category filter. */
(function () {
  "use strict";

  var grid = document.getElementById("pep-grid");
  var searchInput = document.getElementById("pep-search");
  var filterWrap = document.getElementById("pep-filters");
  var countEl = document.getElementById("pep-count");
  if (!grid) return;

  var all = [];
  var activeCat = "All";
  var query = "";

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function categories(list) {
    var set = {};
    list.forEach(function (p) { set[p.category] = true; });
    return ["All"].concat(Object.keys(set).sort());
  }

  function render() {
    var q = query.trim().toLowerCase();
    var shown = all.filter(function (p) {
      var matchCat = activeCat === "All" || p.category === activeCat;
      var hay = (p.name + " " + p.alias + " " + p.summary + " " + p.category).toLowerCase();
      var matchQ = !q || hay.indexOf(q) !== -1;
      return matchCat && matchQ;
    });

    if (countEl) {
      countEl.textContent = shown.length + " of " + all.length + " peptides";
    }

    if (!shown.length) {
      grid.innerHTML = '<p class="empty">No peptides match your search. Try a different term or category.</p>';
      return;
    }

    grid.innerHTML = shown.map(function (p) {
      return (
        '<article class="pep">' +
          '<div class="pep__head">' +
            "<h3>" + esc(p.name) + "</h3>" +
            '<span class="badge badge--cat">' + esc(p.category) + "</span>" +
          "</div>" +
          '<div class="alias">' + esc(p.alias) + "</div>" +
          "<p>" + esc(p.summary) + "</p>" +
          '<div class="pep__foot">' +
            '<span class="badge">Half-life: ' + esc(p.halflife) + "</span>" +
            '<span class="badge">' + esc(p.research) + "</span>" +
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

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      query = searchInput.value;
      render();
    });
  }

  fetch("assets/data/peptides.json")
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      all = data;
      buildFilters();
      render();
    })
    .catch(function () {
      grid.innerHTML = '<p class="empty">Unable to load the peptide library right now. Please refresh the page.</p>';
    });
})();
