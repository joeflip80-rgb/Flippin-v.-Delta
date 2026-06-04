/* Shared shopping cart — localStorage based, no backend.
   Loaded on every page: keeps cart badges in sync, handles "add to cart"
   clicks via delegation, and renders the full cart on cart.html. */
(function () {
  "use strict";

  var KEY = "pe_cart_v1";
  var CURRENCY = "$";

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch (e) { return {}; }
  }
  function write(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    updateBadges();
    renderCart();
  }
  function count(cart) {
    cart = cart || read();
    return Object.keys(cart).reduce(function (n, k) { return n + cart[k].qty; }, 0);
  }
  function total(cart) {
    cart = cart || read();
    return Object.keys(cart).reduce(function (s, k) { return s + cart[k].qty * cart[k].price; }, 0);
  }
  function money(n) { return CURRENCY + n.toFixed(2); }

  function add(item) {
    var cart = read();
    if (cart[item.sku]) cart[item.sku].qty += 1;
    else cart[item.sku] = { sku: item.sku, name: item.name, size: item.size, price: item.price, qty: 1 };
    write(cart);
    flash(item.name + " added to cart");
  }
  function setQty(sku, qty) {
    var cart = read();
    if (!cart[sku]) return;
    qty = Math.max(0, qty | 0);
    if (qty === 0) delete cart[sku];
    else cart[sku].qty = qty;
    write(cart);
  }
  function remove(sku) { setQty(sku, 0); }
  function clear() { localStorage.removeItem(KEY); updateBadges(); renderCart(); }

  // Shipping rule, shared with checkout
  function shippingFor(sub) { return (sub >= 100 || sub === 0) ? 0 : 9.99; }

  // Expose for other scripts
  window.PECart = {
    add: add, read: read, setQty: setQty, remove: remove, clear: clear,
    count: count, total: total, shippingFor: shippingFor, flash: function (m) { flash(m); }
  };

  /* ---- Badges ---- */
  function updateBadges() {
    var n = count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.classList.toggle("is-empty", n === 0);
    });
  }

  /* ---- Toast ---- */
  var toastEl;
  function flash(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }

  /* ---- Add-to-cart delegation ---- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-add]");
    if (!btn) return;
    e.preventDefault();
    add({
      sku: btn.getAttribute("data-sku"),
      name: btn.getAttribute("data-name"),
      size: btn.getAttribute("data-size"),
      price: parseFloat(btn.getAttribute("data-price"))
    });
  });

  /* ---- Full cart rendering (cart.html) ---- */
  function renderCart() {
    var root = document.getElementById("cart-root");
    if (!root) return;
    var cart = read();
    var skus = Object.keys(cart);

    if (!skus.length) {
      root.innerHTML =
        '<div class="empty">' +
          "<p>Your cart is empty.</p>" +
          '<a class="btn btn--primary mt-2" href="shop.html">Browse the shop →</a>' +
        "</div>";
      document.dispatchEvent(new CustomEvent("cart:rendered"));
      return;
    }

    var rows = skus.map(function (sku) {
      var i = cart[sku];
      return (
        '<div class="cart-row">' +
          '<div class="cart-row__info"><strong>' + esc(i.name) + "</strong>" +
            '<span class="alias">' + esc(i.size || "") + " · " + esc(sku) + "</span></div>" +
          '<div class="qty">' +
            '<button class="qty__btn" data-dec="' + esc(sku) + '" aria-label="Decrease quantity">−</button>' +
            '<span class="qty__n">' + i.qty + "</span>" +
            '<button class="qty__btn" data-inc="' + esc(sku) + '" aria-label="Increase quantity">+</button>' +
          "</div>" +
          '<div class="cart-row__price">' + money(i.qty * i.price) + "</div>" +
          '<button class="cart-row__rm" data-rm="' + esc(sku) + '" aria-label="Remove ' + esc(i.name) + '">✕</button>' +
        "</div>"
      );
    }).join("");

    var sub = total(cart);
    var shipping = shippingFor(sub);
    root.innerHTML =
      '<div class="cart-list">' + rows + "</div>" +
      '<aside class="cart-summary">' +
        "<h3>Order summary</h3>" +
        '<div class="result__row"><span>Subtotal</span><b>' + money(sub) + "</b></div>" +
        '<div class="result__row"><span>Shipping</span><b>' + (shipping === 0 ? "Free" : money(shipping)) + "</b></div>" +
        '<div class="result__row" style="font-size:1.15rem"><span>Total</span><b>' + money(sub + shipping) + "</b></div>" +
        (sub < 100 ? '<p class="hint mt-2" style="color:var(--muted)">Add ' + money(100 - sub) + " more for free shipping.</p>" : "") +
        '<div id="paypal-buttons" class="mt-2"></div>' +
        '<button class="btn btn--primary btn--block mt-2" id="checkout-btn">Proceed to checkout</button>' +
        '<a class="btn btn--ghost btn--block mt-1" href="shop.html">Continue shopping</a>' +
      "</aside>";
    document.dispatchEvent(new CustomEvent("cart:rendered"));
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // Cart page interactions
  document.addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]");
    var dec = e.target.closest("[data-dec]");
    var rm = e.target.closest("[data-rm]");
    var co = e.target.closest("#checkout-btn");
    var cart = read();
    if (inc) { var s = inc.getAttribute("data-inc"); setQty(s, (cart[s] ? cart[s].qty : 0) + 1); }
    else if (dec) { var d = dec.getAttribute("data-dec"); setQty(d, (cart[d] ? cart[d].qty : 0) - 1); }
    else if (rm) { remove(rm.getAttribute("data-rm")); }
    else if (co) {
      flash("Demo checkout — connect a payment provider to complete orders.");
    }
  });

  updateBadges();
  renderCart();
})();
