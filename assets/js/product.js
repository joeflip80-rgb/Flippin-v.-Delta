/* Product detail page — reads ?sku= from the URL, finds it in products.json,
   and renders details + add-to-cart. Injects Product structured data.
   Add-to-cart clicks are handled globally by cart.js. */
(function () {
  "use strict";
  var root = document.getElementById("product-root");
  if (!root) return;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Number(n).toFixed(2); }
  function initials(name) {
    return name.replace(/[^A-Za-z0-9 ]/g, "").split(/\s|-/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w[0]; }).join("").toUpperCase();
  }
  function getParam(k) {
    return new URLSearchParams(window.location.search).get(k);
  }

  function notFound() {
    root.innerHTML =
      '<div class="empty">' +
        "<h2>Product not found</h2>" +
        "<p>We couldn't find that product. It may have sold out or moved.</p>" +
        '<a class="btn btn--primary mt-2" href="shop.html">Back to the shop →</a>' +
      "</div>";
  }

  function render(p) {
    document.title = p.name + " — " + p.size + " | Peptides Easy";
    var md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", p.name + " (" + p.size + ", " + p.purity + "). " + p.summary + " For laboratory research use only.");

    var soldOut = !p.stock;
    root.innerHTML =
      '<nav class="crumbs"><a href="shop.html">Shop</a> <span>/</span> <span>' + esc(p.category) + "</span> <span>/</span> " + esc(p.name) + "</nav>" +
      '<div class="product-detail">' +
        '<div class="product-detail__media" aria-hidden="true">' +
          "<span>" + esc(initials(p.name)) + "</span>" +
          (p.tag ? '<span class="product__tag">' + esc(p.tag) + "</span>" : "") +
        "</div>" +
        '<div class="product-detail__info">' +
          '<div class="product__cat">' + esc(p.category) + "</div>" +
          "<h1>" + esc(p.name) + "</h1>" +
          '<p class="alias">' + esc(p.alias) + "</p>" +
          '<div class="product-detail__price"><span class="price">' + money(p.price) + "</span>" +
            (soldOut ? '<span class="badge">Out of stock</span>' : '<span class="badge badge--cat">In stock</span>') +
          "</div>" +
          "<p>" + esc(p.summary) + "</p>" +
          '<div class="product-detail__buy">' +
            (soldOut
              ? '<button class="btn btn--ghost btn--block" disabled>Sold out</button>'
              : '<button class="btn btn--primary btn--block" data-add data-sku="' + esc(p.sku) +
                  '" data-name="' + esc(p.name) + '" data-size="' + esc(p.size) +
                  '" data-price="' + p.price + '">Add to cart — ' + money(p.price) + "</button>") +
          "</div>" +
          '<table class="spec"><tbody>' +
            "<tr><th>SKU</th><td>" + esc(p.sku) + "</td></tr>" +
            "<tr><th>Size</th><td>" + esc(p.size) + "</td></tr>" +
            "<tr><th>Purity</th><td>" + esc(p.purity) + "</td></tr>" +
            "<tr><th>Category</th><td>" + esc(p.category) + "</td></tr>" +
            "<tr><th>Form</th><td>Lyophilized powder</td></tr>" +
            "<tr><th>Storage</th><td>Store lyophilized at -20 °C; reconstituted, refrigerate at 2–8 °C</td></tr>" +
          "</tbody></table>" +
          '<div class="callout mt-2" role="note">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.42 0z" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            "<span><strong>For laboratory research use only.</strong> Not for human or veterinary consumption. Not a drug, supplement or food.</span>" +
          "</div>" +
        "</div>" +
      "</div>";

    var ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name + " (Research Use Only)",
      sku: p.sku,
      category: p.category,
      description: p.summary,
      brand: { "@type": "Brand", name: "Peptides Easy" },
      offers: {
        "@type": "Offer",
        price: p.price.toFixed(2),
        priceCurrency: "USD",
        availability: p.stock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url: "https://peptides-easy.com/product.html?sku=" + encodeURIComponent(p.sku)
      }
    });
    document.head.appendChild(ld);
  }

  var sku = getParam("sku");
  if (!sku) { notFound(); return; }

  fetch("assets/data/products.json")
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var p = data.filter(function (x) { return x.sku === sku; })[0];
      if (!p) notFound(); else render(p);
    })
    .catch(notFound);
})();
