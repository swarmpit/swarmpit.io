// swarmpit.io — vanilla JS, no dependencies

(function () {
  'use strict';

  // ── current year in footer
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // ── mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('primary-nav');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ── install tabs
  var tabs = document.querySelectorAll('.tab');
  var panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.dataset.tab;
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      panels.forEach(function (p) {
        p.classList.toggle('is-active', p.dataset.panel === name);
      });
    });
  });

  // ── copy-to-clipboard for code blocks
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pre = btn.closest('.code-block');
      if (!pre) return;
      var text = pre.querySelector('code').innerText.replace(/^\$\s/gm, '').trim();
      var done = function () {
        var orig = btn.textContent;
        btn.textContent = 'copied ✓';
        btn.classList.add('is-copied');
        setTimeout(function () {
          btn.textContent = orig;
          btn.classList.remove('is-copied');
        }, 1600);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
        document.body.removeChild(ta);
      }
    });
  });

  // ── contact form → existing AWS endpoint
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof window.fetch === 'undefined') return;
      var data = {};
      new FormData(form).forEach(function (val, key) { data[key] = val; });
      fetch('https://fokgz5bqh2.execute-api.eu-central-1.amazonaws.com/swarmpit/contact-form', {
        method: 'POST',
        body: JSON.stringify(data)
      }).then(function () {
        var msg = document.createElement('p');
        msg.className = 'form-success';
        msg.textContent = 'thanks — we\'ll be in touch shortly.';
        form.replaceWith(msg);
      }).catch(function () {
        var msg = document.createElement('p');
        msg.className = 'form-success';
        msg.style.borderColor = 'var(--warm)';
        msg.style.color = 'var(--warm)';
        msg.textContent = 'something went wrong. mail us at team@swarmpit.io.';
        form.appendChild(msg);
      });
    });
  }

})();
