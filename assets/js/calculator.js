/* Peptide reconstitution calculator.
   Inputs: peptide in vial (mg), bacteriostatic water (mL), desired dose (mcg), syringe size.
   Outputs: concentration, volume to draw, units on a U-100 insulin syringe, doses per vial.
   Educational tool only — not medical or dosing advice. */
(function () {
  "use strict";

  var form = document.getElementById("calc-form");
  if (!form) return;

  var elPeptide = document.getElementById("c-peptide");   // mg in vial
  var elWater = document.getElementById("c-water");       // mL added
  var elDose = document.getElementById("c-dose");         // desired dose in mcg
  var elSyringe = document.getElementById("c-syringe");   // total mL of insulin syringe

  var outDrawMl = document.getElementById("o-draw-ml");
  var outUnits = document.getElementById("o-units");
  var outConc = document.getElementById("o-conc");
  var outDoses = document.getElementById("o-doses");
  var outNote = document.getElementById("o-note");
  var fillRect = document.getElementById("syringe-fill");
  var fillLabel = document.getElementById("syringe-units-label");

  function num(el) {
    var v = parseFloat(el.value);
    return isFinite(v) ? v : 0;
  }

  function fmt(n, dp) {
    if (!isFinite(n)) return "—";
    return Number(n.toFixed(dp == null ? 2 : dp)).toLocaleString();
  }

  function calc() {
    var peptideMg = num(elPeptide);
    var waterMl = num(elWater);
    var doseMcg = num(elDose);
    var syringeMl = parseFloat(elSyringe.value) || 1; // 0.3, 0.5 or 1 mL

    if (peptideMg <= 0 || waterMl <= 0 || doseMcg <= 0) {
      outDrawMl.textContent = "—";
      outUnits.textContent = "—";
      outConc.textContent = "—";
      outDoses.textContent = "—";
      outNote.textContent = "Enter your vial amount, water volume and desired dose to see results.";
      if (fillRect) fillRect.setAttribute("width", "0");
      if (fillLabel) fillLabel.textContent = "0 units";
      return;
    }

    var peptideMcg = peptideMg * 1000;
    var concMcgPerMl = peptideMcg / waterMl;          // mcg per mL
    var drawMl = doseMcg / concMcgPerMl;              // mL to draw for one dose
    var units = drawMl * 100;                         // U-100: 100 units = 1 mL
    var unitsCapacity = syringeMl * 100;             // capacity of chosen syringe in units
    var doses = Math.floor(peptideMcg / doseMcg);

    outConc.textContent = fmt(concMcgPerMl, 0) + " mcg/mL";
    outDrawMl.textContent = fmt(drawMl, 3) + " mL";
    outUnits.textContent = fmt(units, 1) + " units";
    outDoses.textContent = doses + " doses";

    // Syringe visual (scaled to chosen syringe capacity)
    if (fillRect && fillLabel) {
      var pct = Math.max(0, Math.min(1, units / unitsCapacity));
      fillRect.setAttribute("width", (pct * 300).toFixed(1));
      fillLabel.textContent = fmt(units, 1) + " units";
    }

    if (units > unitsCapacity) {
      outNote.innerHTML = "⚠️ This dose needs <strong>" + fmt(units, 1) +
        " units</strong>, which exceeds a " + syringeMl +
        " mL (" + unitsCapacity + "-unit) syringe. Use a larger syringe or add more water.";
    } else {
      outNote.innerHTML = "Draw to the <strong>" + fmt(units, 1) +
        "-unit</strong> mark on a U-100 insulin syringe for one " + fmt(doseMcg, 0) + " mcg dose.";
    }
  }

  form.addEventListener("input", calc);
  form.addEventListener("submit", function (e) { e.preventDefault(); calc(); });
  calc();
})();
