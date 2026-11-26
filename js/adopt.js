/* PawHaven — search + filters for the Adopt page (uses local sample data in pets.js) */
(function () {
  'use strict';
  var grid = document.getElementById('pet-grid');
  var count = document.getElementById('result-count');
  var empty = document.getElementById('empty-state');
  var form = document.getElementById('filters');
  var favOnly = document.getElementById('fav-only');
  var Fav = window.PawHaven.Fav;
  var els = {
    q: form.elements.q, type: form.elements.type, gender: form.elements.gender,
    age: form.elements.age, size: form.elements.size, breed: form.elements.breed
  };

  var pin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.800 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  var heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.4-8-11.2A4.800 4.800 0 0 1 12 7a4.800 4.800 0 0 1 8 2.800C20 15.600 12 21 12 21Z"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function card(p) {
    var st = p.status.toLowerCase();
    return '<article class="pet-card reveal in" data-id="' + p.id + '">' +
      '<a class="pet-media" href="pet.html?id=' + p.id + '" tabindex="-1" aria-hidden="true">' +
        '<img src="' + p.img + '" alt="" loading="lazy" width="800" height="640">' +
        '<span class="badge badge--' + st + '">' + esc(p.status) + '</span></a>' +
      '<button class="fav-btn" type="button" data-id="' + p.id + '" data-name="' + esc(p.name) + '" aria-pressed="false" aria-label="Save ' + esc(p.name) + ' to favourites">' + heart + '</button>' +
      '<div class="pet-body">' +
        '<h3>' + esc(p.name) + '<small>' + esc(p.age) + '</small></h3>' +
        '<p class="pet-breed">' + esc(p.breed) + '</p>' +
        '<ul class="pet-meta"><li>' + esc(p.gender) + '</li><li>' + esc(p.size) + '</li><li class="loc">' + pin + esc(p.location) + '</li></ul>' +
        '<p class="pet-desc">' + esc(p.short) + '</p>' +
        '<a class="btn btn-primary btn-sm" href="pet.html?id=' + p.id + '">View Details</a>' +
      '</div></article>';
  }

  function fillBreeds() {
    var t = els.type.value, cur = els.breed.value;
    var breeds = {};
    PETS.forEach(function (p) { if (!t || p.type === t) breeds[p.breed] = 1; });
    els.breed.innerHTML = '<option value="">All breeds</option>' + Object.keys(breeds).sort().map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('');
    if (breeds[cur]) els.breed.value = cur;
  }

  function render() {
    var q = els.q.value.trim().toLowerCase();
    var list = PETS.filter(function (p) {
      return (!q || p.name.toLowerCase().indexOf(q) > -1) &&
        (!els.type.value || p.type === els.type.value) &&
        (!els.gender.value || p.gender === els.gender.value) &&
        (!els.age.value || p.ageGroup === els.age.value) &&
        (!els.size.value || p.size === els.size.value) &&
        (!els.breed.value || p.breed === els.breed.value) &&
        (!favOnly.checked || Fav.has(p.id));
    });
    grid.innerHTML = list.map(card).join('');
    Fav.sync(grid);
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    count.innerHTML = '<strong>' + list.length + '</strong> ' + (list.length === 1 ? 'friend' : 'friends') + ' waiting for you';
  }

  function clear() {
    form.reset();
    favOnly.checked = false;
    fillBreeds();
    render();
    history.replaceState(null, '', location.pathname);
  }

  els.type.addEventListener('change', function () { fillBreeds(); render(); });
  ['q'].forEach(function (k) { els[k].addEventListener('input', render); });
  ['gender', 'age', 'size', 'breed'].forEach(function (k) { els[k].addEventListener('change', render); });
  favOnly.addEventListener('change', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
  document.querySelectorAll('[data-clear]').forEach(function (b) { b.addEventListener('click', clear); });
  document.addEventListener('favs-changed', function () { if (favOnly.checked) render(); });

  // allow links like adopt.html?type=Cat
  var params = new URLSearchParams(location.search);
  if (params.get('type')) els.type.value = params.get('type');
  fillBreeds();
  render();
})();
