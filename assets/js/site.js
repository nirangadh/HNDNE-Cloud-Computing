/* Cloud Computing portal. MIT licence.
   Progressive enhancement only: every page reads correctly without this file.
   Nothing leaves the device. Storage keys all start with "hndne-cc:". */
(function () {
  "use strict";
  var KEY = "hndne-cc:done:";

  /* ---- storage guard: a blocked or full store must never break a page ---- */
  function store(fn, fallback) { try { return fn(window.localStorage); } catch (e) { return fallback; } }
  function isDone(c) { return store(function (s) { return s.getItem(KEY + c) === "1"; }, false); }
  function setDone(c, v) { store(function (s) { if (v) { s.setItem(KEY + c, "1"); } else { s.removeItem(KEY + c); } }); }
  function each(sel, fn, root) { Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn); }
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) { n.className = cls; } if (text) { n.textContent = text; } return n; }

  /* ---- progress: "Mark as done" buttons and the done marks on day cards ---- */
  function paintSlots() {
    each("[data-slot]", function (n) { n.classList.toggle("is-done", isDone(n.getAttribute("data-slot"))); });
  }
  each("[data-progress]", function (b) {
    var c = b.getAttribute("data-progress"), base = b.textContent;
    function paint() {
      var d = isDone(c);
      b.classList.toggle("done", d);
      b.textContent = d ? "Done on this device (press to undo)" : base;
      b.setAttribute("aria-pressed", d ? "true" : "false");
    }
    b.addEventListener("click", function () { setDone(c, !isDone(c)); paint(); paintSlots(); });
    paint();
  });
  paintSlots();

  /* ---- quick checks: answer and reason at once, not scored, not stored ---- */
  each(".qc", function (qc, i) {
    var list = qc.querySelector(".qc-opts"), why = qc.querySelector(".qc-why");
    if (!list || !why) { return; }
    var live = el("p", "sr");
    live.setAttribute("aria-live", "polite");
    qc.appendChild(live);
    why.id = "qc-why-" + i;
    var buttons = [];
    each("li", function (li) {
      var right = li.hasAttribute("data-right");
      var key = li.querySelector(".qc-key");
      if (key) { key.parentNode.removeChild(key); }
      var b = el("button", "qc-opt");
      b.type = "button";
      var text = el("span");
      while (li.firstChild) { text.appendChild(li.firstChild); }
      b.appendChild(text);
      li.appendChild(b);
      buttons.push(b);
      b.addEventListener("click", function () {
        buttons.forEach(function (o) {
          o.disabled = true;
          if (o !== b && !o.parentNode.hasAttribute("data-right")) { o.classList.add("dim"); }
        });
        buttons.forEach(function (o) {
          if (o.parentNode.hasAttribute("data-right")) { o.classList.add("right"); o.appendChild(el("span", "verdict", "✓ RIGHT ANSWER")); }
        });
        if (!right) { b.classList.add("wrong"); b.classList.remove("dim"); b.appendChild(el("span", "verdict", "✗ YOUR ANSWER")); }
        qc.classList.add("answered");
        live.textContent = (right ? "Right. " : "Not quite. ") + why.textContent;
      });
    }, list);
  });

  /* ---- glossary terms: tooltip on hover and focus, bottom sheet on a phone ---- */
  var dataNode = document.getElementById("glossary-data"), terms = {}, tip = null, owner = null;
  if (dataNode) { try { terms = JSON.parse(dataNode.textContent); } catch (e) { terms = {}; } }
  function narrow() { return window.matchMedia("(max-width: 43.99rem)").matches; }
  function hide() {
    if (tip) { tip.parentNode.removeChild(tip); tip = null; }
    if (owner) { owner.removeAttribute("aria-describedby"); owner = null; }
  }
  function show(a) {
    var t = terms[a.getAttribute("data-term")];
    if (!t) { return; }
    hide();
    owner = a;
    tip = el("div", "tip");
    tip.id = "term-tip";
    tip.setAttribute("role", "tooltip");
    var close = el("button", "close", "Close");
    close.type = "button";
    close.addEventListener("click", function () { var o = owner; hide(); if (o) { o.focus(); } });
    tip.appendChild(close);
    tip.appendChild(el("b", "", t.t));
    var d = el("span"); d.innerHTML = t.d; tip.appendChild(d);
    if (t.x) { var x = el("span", "ex"); x.innerHTML = t.x; tip.appendChild(x); }
    var more = el("a", "more", "Open the glossary");
    more.href = a.getAttribute("href");
    tip.appendChild(more);
    document.body.appendChild(tip);
    a.setAttribute("aria-describedby", "term-tip");
    if (!narrow()) {
      var r = a.getBoundingClientRect(), w = tip.offsetWidth;
      var left = Math.max(8, Math.min(r.left + window.pageXOffset, window.pageXOffset + document.documentElement.clientWidth - w - 8));
      tip.style.left = left + "px";
      tip.style.top = (r.bottom + window.pageYOffset + 8) + "px";
    }
  }
  each("a.term", function (a) {
    a.addEventListener("mouseenter", function () { if (!narrow()) { show(a); } });
    a.addEventListener("mouseleave", function () {
      if (!narrow()) { window.setTimeout(function () { if (tip && !tip.matches(":hover") && owner === a && document.activeElement !== a) { hide(); } }, 250); }
    });
    a.addEventListener("focus", function () { if (!narrow()) { show(a); } });
    a.addEventListener("blur", function () { if (!narrow()) { window.setTimeout(function () { if (tip && !tip.contains(document.activeElement)) { hide(); } }, 150); } });
    a.addEventListener("click", function (ev) {            /* on a phone the first tap opens the sheet */
      if (narrow() && owner !== a) { ev.preventDefault(); show(a); }
    });
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && tip) { var o = owner; hide(); if (o) { o.focus(); } } });
  document.addEventListener("click", function (ev) {
    if (tip && !tip.contains(ev.target) && !(ev.target.closest && ev.target.closest("a.term"))) { hide(); }
  });
})();
