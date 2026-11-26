/* PawHaven — adoption application (frontend demo only: nothing is sent anywhere) */
(function () {
  'use strict';
  var form = document.getElementById('apply-form');
  var sel = form.elements.pet;
  var box = document.getElementById('apply-box');

  // fill pet dropdown from local sample data
  PETS.forEach(function (p) {
    if (p.status !== 'Available') return;
    var o = document.createElement('option');
    o.value = p.id; o.textContent = p.name + ' — ' + p.breed + ' (' + p.location + ')';
    sel.appendChild(o);
  });
  var pre = new URLSearchParams(location.search).get('pet');
  if (pre) sel.value = pre;
  var chosen = function () { return PETS.filter(function (p) { return p.id === sel.value; })[0]; };
  var hint = document.getElementById('pet-hint');
  function showHint() {
    var p = chosen();
    hint.innerHTML = p ? 'You’re applying for <strong>' + p.name + '</strong> · <a href="pet.html?id=' + p.id + '">view profile</a>' : '';
  }
  sel.addEventListener('change', showHint); showHint();

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  PawForm(form, function (d) {
    var p = chosen();
    var ref = 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    box.innerHTML =
      '<div class="success" role="status" tabindex="-1" id="done">' +
        '<div class="tick"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg></div>' +
        '<span class="eyebrow">Thank you, ' + esc(d.name.split(' ')[0]) + '</span>' +
        '<h2>Your application looks wonderful.</h2>' +
        '<p class="lead" style="margin-inline:auto">All of the details passed our checks. ' + (p ? esc(p.name) + ' is lucky to have someone like you thinking of ' + (p.gender === 'Female' ? 'her' : 'him') + '.' : '') + '</p>' +
        '<div class="demo-banner" style="text-align:left;max-width:520px;margin:1.4rem auto 0"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.500v.01"/></svg><div><strong>This is a website demonstration.</strong> No application was sent to a shelter and no data left your browser. A real platform would now forward this to a shelter’s adoption team.</div></div>' +
        '<div class="summary"><dl>' +
          '<dt>Reference</dt><dd>' + ref + ' (demo)</dd>' +
          '<dt>Pet</dt><dd>' + (p ? esc(p.name) : '—') + '</dd>' +
          '<dt>Email</dt><dd>' + esc(d.email) + '</dd>' +
          '<dt>Home</dt><dd>' + esc(d.housing) + '</dd>' +
        '</dl></div>' +
        '<div class="form-actions" style="justify-content:center"><a class="btn btn-primary" href="adopt.html">Keep browsing</a><a class="btn btn-ghost" href="index.html">Back home</a></div>' +
      '</div>';
    var done = document.getElementById('done');
    done.focus(); done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
