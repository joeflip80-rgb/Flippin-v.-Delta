/* PayPal checkout integration (client-side Smart Buttons).
 *
 * SETUP: in cart.html, set your live client ID:
 *     <script>window.PE_PAYPAL_CLIENT_ID = "YOUR_PAYPAL_CLIENT_ID";</script>
 * Until that is a real ID, the cart keeps a disabled "demo" button and shows a
 * setup notice. For production you should ALSO verify/capture orders on a server
 * — client-only capture is fine to start but can be tampered with.
 */
(function () {
  "use strict";

  var CURRENCY = window.PE_PAYPAL_CURRENCY || "USD";
  var CLIENT_ID = window.PE_PAYPAL_CLIENT_ID || "";
  var PLACEHOLDER = !CLIENT_ID || CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID";

  var sdkPromise = null;
  function loadSDK() {
    if (sdkPromise) return sdkPromise;
    sdkPromise = new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = "https://www.paypal.com/sdk/js?client-id=" + encodeURIComponent(CLIENT_ID) +
              "&currency=" + encodeURIComponent(CURRENCY) + "&intent=capture";
      s.onload = function () { resolve(window.paypal); };
      s.onerror = function () { reject(new Error("PayPal SDK failed to load")); };
      document.head.appendChild(s);
    });
    return sdkPromise;
  }

  function money(n) { return n.toFixed(2); }

  function buildOrder() {
    var cart = window.PECart.read();
    var skus = Object.keys(cart);
    var sub = window.PECart.total(cart);
    var shipping = window.PECart.shippingFor(sub);

    var items = skus.map(function (k) {
      var i = cart[k];
      return {
        name: (i.name + (i.size ? " (" + i.size + ")" : "")).slice(0, 127),
        sku: i.sku,
        quantity: String(i.qty),
        unit_amount: { currency_code: CURRENCY, value: money(i.price) },
        category: "PHYSICAL_GOODS"
      };
    });

    return {
      purchase_units: [{
        description: "Research peptides & supplies (research use only)",
        amount: {
          currency_code: CURRENCY,
          value: money(sub + shipping),
          breakdown: {
            item_total: { currency_code: CURRENCY, value: money(sub) },
            shipping: { currency_code: CURRENCY, value: money(shipping) }
          }
        },
        items: items
      }]
    };
  }

  function showSetupNotice(container, fallbackBtn) {
    if (fallbackBtn) {
      fallbackBtn.disabled = true;
      fallbackBtn.textContent = "Checkout (PayPal not configured)";
    }
    container.innerHTML =
      '<p class="hint" style="color:var(--muted)">💳 Live checkout is not configured yet. ' +
      "Add your PayPal client ID in <code>cart.html</code> to enable payments.</p>";
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(function (details) {
      var name = (details.payer && details.payer.name && details.payer.name.given_name) || "there";
      window.PECart.clear();
      var root = document.getElementById("cart-root");
      if (root) {
        root.innerHTML =
          '<div class="empty">' +
            '<h2>Thank you, ' + name + "! 🎉</h2>" +
            "<p>Your order has been received. A confirmation has been sent by PayPal." +
            " Order ID: <strong>" + (details.id || "—") + "</strong>.</p>" +
            '<p class="hint" style="color:var(--muted)">Reminder: products are supplied for laboratory research use only.</p>' +
            '<a class="btn btn--primary mt-2" href="shop.html">Continue shopping →</a>' +
          "</div>";
      }
    });
  }

  function renderButtons() {
    var container = document.getElementById("paypal-buttons");
    var fallbackBtn = document.getElementById("checkout-btn");
    if (!container) return;

    if (PLACEHOLDER) { showSetupNotice(container, fallbackBtn); return; }
    if (fallbackBtn) fallbackBtn.style.display = "none";

    loadSDK().then(function (paypal) {
      container.innerHTML = "";
      paypal.Buttons({
        style: { layout: "vertical", shape: "pill", label: "paypal" },
        createOrder: function (data, actions) { return actions.order.create(buildOrder()); },
        onApprove: onApprove,
        onError: function () {
          window.PECart.flash("Payment could not be completed. Please try again.");
        }
      }).render(container).catch(function () {
        showSetupNotice(container, fallbackBtn);
      });
    }).catch(function () {
      container.innerHTML = '<p class="hint" style="color:var(--muted)">Unable to load PayPal right now. Please refresh.</p>';
    });
  }

  // Re-render whenever the cart view is (re)built.
  document.addEventListener("cart:rendered", renderButtons);
  renderButtons();
})();
