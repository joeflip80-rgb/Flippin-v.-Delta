/* Homepage featured products: fetch products.json and render a few cards.
   Add-to-cart clicks are handled globally by cart.js via delegation. */
(function () {
  "use strict";
  var grid = document.getElementById("featured-grid");
  if (!grid) return;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Number(n).toFixed(2); }
  function initials(name) {
    return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s|-/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0]; }).join("").toUpperCase();
  }

  fetch("assets/data/products.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var featured = data.filter(function (p) { return p.tag && p.stock; }).slice(0, 4);
      if (featured.length < 4) featured = data.filter(function (p) { return p.stock; }).slice(0, 4);

      grid.innerHTML = featured.map(function (p) {
        return (
          '<article class="product">' +
            '<a class="product__media" aria-label="' + esc(p.name) + '" href="product.html?sku=' + encodeURIComponent(p.sku) + '"><span aria-hidden="true">' + esc(initials(p.name)) + "</span>" +
              (p.tag ? '<span class="product__tag">' + esc(p.tag) + "</span>" : "") +
            "</a>" +
            '<div class="product__body">' +
              '<div class="product__cat">' + esc(p.category) + "</div>" +
              '<h3><a href="product.html?sku=' + encodeURIComponent(p.sku) + '">' + esc(p.name) + "</a></h3>" +
              '<p class="alias">' + esc(p.size) + " · " + esc(p.purity) + "</p>" +
              '<div class="product__foot">' +
                '<span class="price">' + money(p.price) + "</span>" +
                '<button class="btn btn--primary" data-add data-sku="' + esc(p.sku) +
                  '" data-name="' + esc(p.name) + '" data-size="' + esc(p.size) +
                  '" data-price="' + p.price + '">Add to cart</button>' +
              "</div>" +
            "</div>" +
          "</article>"
        );
      }).join("");
    })
    .catch(function () {
      grid.innerHTML = '<p class="empty">Unable to load featured products. <a href="shop.html">Visit the shop →</a></p>';
    });
})();
