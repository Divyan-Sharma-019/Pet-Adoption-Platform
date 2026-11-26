/* PawHaven — tiny form validation helper.
   Rules live in the HTML (required, type, pattern, minlength + data-msg-* attributes). */
(function () {
  'use strict';

  function message(el) {
    var v = el.validity, d = el.dataset;
    if (v.valueMissing) return d.msgRequired || 'Please fill this in.';
    if (v.typeMismatch) return d.msgType || 'That doesn’t look quite right.';
    if (v.patternMismatch) return d.msgPattern || 'Please check the format.';
    if (v.tooShort) return d.msgShort || 'Please add a little more detail (at least ' + el.minLength + ' characters).';
    return 'Please check this field.';
  }

  function check(el) {
    var wrap = el.closest('.field');
    if (!wrap) return true;
    var err = wrap.querySelector('.error');
    // trim whitespace-only text values so " " doesn't pass "required"
    if (/^(text|email|tel|search)$/.test(el.type) || el.tagName === 'TEXTAREA') {
      if (el.value && !el.value.trim()) el.value = '';
    }
    // minlength is only checked by browsers on user edits, so enforce it ourselves
    var tooShort = el.minLength > 0 && el.value && el.value.trim().length < el.minLength;
    var ok = el.checkValidity() && !tooShort;
    wrap.classList.toggle('invalid', !ok);
    if (el.type === 'radio' || el.type === 'checkbox') {
      /* aria-invalid goes on the whole group's inputs */
      wrap.querySelectorAll('input').forEach(function (i) { i.setAttribute('aria-invalid', !ok); });
    } else {
      el.setAttribute('aria-invalid', !ok);
    }
    if (err) {
      if (!ok) {
        if (tooShort && !el.validity.valueMissing) { err.textContent = el.dataset.msgShort || 'Please add a little more detail (at least ' + el.minLength + ' characters).'; }
        else { err.textContent = message(el); }
      } else { err.textContent = ''; }
    }
    return ok;
  }

  window.PawForm = function (form, onValid) {
    form.setAttribute('novalidate', '');
    var controls = function () { return Array.prototype.filter.call(form.elements, function (e) { return e.name && e.type !== 'submit' && e.type !== 'button' && e.type !== 'reset'; }); };

    controls().forEach(function (el) {
      var evt = (el.type === 'radio' || el.type === 'checkbox' || el.tagName === 'SELECT') ? 'change' : 'blur';
      el.addEventListener(evt, function () { check(el); });
      // once a field was flagged, re-check live as the user fixes it
      el.addEventListener('input', function () { if (el.closest('.field.invalid')) check(el); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      controls().forEach(function (el) { if (!check(el) && !firstBad) firstBad = el; });
      if (firstBad) { firstBad.focus({ preventScroll: false }); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      onValid(data, form);
    });
    form.addEventListener('reset', function () {
      form.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
    });
  };
})();
