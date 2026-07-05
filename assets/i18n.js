/* GrowEssential bilingual engine — EN default, ES via phrase dictionary (window.I18N_ES from es.js).
   - Auto-detects Spanish browsers on first visit, remembers the choice in localStorage.
   - Translates static text, placeholders, <option>s, aria-labels, <title>, meta description.
   - Re-translates dynamically injected content (species cards) via MutationObserver.
   - UI is a segmented EN|ES switch ([data-lang-switch] wrapping two [data-lang-set] buttons).
   Non-invasive: pages need no data-i18n attributes; matching is by exact trimmed English text. */
(function () {
  function DICT() { return window.I18N_ES || {}; }
  var KEY = 'ge_lang';
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };
  var lang = 'en';

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function initialLang() {
    var s = saved();
    if (s === 'es' || s === 'en') return s;
    return (navigator.language || navigator.userLanguage || '').toLowerCase().indexOf('es') === 0 ? 'es' : 'en';
  }

  function norm(str) { return str.replace(/\s+/g, ' ').trim(); }

  function translateTextNodes(root, toES) {
    var d = DICT();
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (SKIP[n.parentNode && n.parentNode.nodeName]) return NodeFilter.FILTER_REJECT;
        return n.nodeValue && n.nodeValue.trim().length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var n, nodes = [];
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      if (node.__en == null) node.__en = node.nodeValue;      // remember original once
      var orig = node.__en;
      if (!toES) { if (node.nodeValue !== orig) node.nodeValue = orig; return; }
      var es = d[norm(orig)];
      if (es === undefined) return;
      var lead = (orig.match(/^\s*/) || [''])[0];
      var trail = (orig.match(/\s*$/) || [''])[0];
      node.nodeValue = lead + es + trail;
    });
  }

  function translateAttrs(toES) {
    var d = DICT();
    document.querySelectorAll('[placeholder]').forEach(function (el) {
      if (el.__phEn == null) el.__phEn = el.getAttribute('placeholder');
      var es = d['@ph:' + el.__phEn];
      el.setAttribute('placeholder', toES && es !== undefined ? es : el.__phEn);
    });
    document.querySelectorAll('option').forEach(function (el) {
      if (el.__en == null) el.__en = el.textContent;
      var es = d['@opt:' + el.__en.trim()];
      el.textContent = toES && es !== undefined ? es : el.__en;
    });
    document.querySelectorAll('[aria-label]').forEach(function (el) {
      if (el.hasAttribute('data-lang-toggle')) return; // engine-managed switch
      if (el.__ariaEn == null) el.__ariaEn = el.getAttribute('aria-label');
      var es = d['@aria:' + el.__ariaEn];
      el.setAttribute('aria-label', toES && es !== undefined ? es : el.__ariaEn);
    });
  }

  function translateHead(toES) {
    var d = DICT();
    if (window.__titleEn == null) window.__titleEn = document.title;
    var tEs = d['@title:' + window.__titleEn];
    document.title = toES && tEs !== undefined ? tEs : window.__titleEn;
    var md = document.querySelector('meta[name="description"]');
    if (md) {
      if (md.__en == null) md.__en = md.getAttribute('content');
      var dEs = d['@meta:' + md.__en];
      md.setAttribute('content', toES && dEs !== undefined ? dEs : md.__en);
    }
  }

  function paintToggle() {
    var es = lang === 'es';
    document.querySelectorAll('[data-lang-toggle]').forEach(function (tog) {
      tog.setAttribute('aria-checked', es ? 'true' : 'false');
      var knob = tog.querySelector('[data-knob]');
      if (knob) knob.style.transform = es ? 'translateX(100%)' : 'translateX(0)';
      tog.querySelectorAll('[data-seg]').forEach(function (seg) {
        var active = seg.getAttribute('data-seg') === lang;
        seg.classList.toggle('text-cream', active);
        seg.classList.toggle('text-soil-500', !active);
      });
    });
  }

  function apply(l) {
    lang = l === 'es' ? 'es' : 'en';
    var toES = lang === 'es';
    document.documentElement.setAttribute('lang', toES ? 'es' : 'en');
    translateTextNodes(document.body, toES);
    translateAttrs(toES);
    translateHead(toES);
    paintToggle();
  }

  function wire() {
    document.querySelectorAll('[data-lang-toggle]').forEach(function (tog) {
      if (tog.__wired) return; tog.__wired = 1;
      tog.addEventListener('click', function () {
        apply(lang === 'es' ? 'en' : 'es'); store(lang);
      });
    });
    var obs = new MutationObserver(function (muts) {
      if (lang !== 'es') return;
      muts.forEach(function (m) {
        m.addedNodes && m.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) translateTextNodes(node, true);
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function boot() { wire(); apply(initialLang()); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.GE_I18N = { apply: apply, get lang() { return lang; } };
})();
