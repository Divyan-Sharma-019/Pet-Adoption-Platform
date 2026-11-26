/* PawHaven — dynamic pet profile (pet.html?id=bella) */
(function () {
  'use strict';
  var mount = document.getElementById('profile');
  var id = new URLSearchParams(location.search).get('id');
  var pet = PETS.filter(function (p) { return p.id === id; })[0];
  var heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.4-8-11.2A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 2.8C20 15.600 12 21 12 21Z"/></svg>';
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  if (!pet) {
    document.title = 'Pet not found — PawHaven';
    mount.innerHTML = '<div class="empty reveal in"><h3>We couldn’t find that little face.</h3><p>The profile you’re looking for may have found a home already, or the link is a little off.</p><a class="btn btn-primary" href="adopt.html">Meet our other friends</a></div>';
    return;
  }

  document.title = 'Meet ' + pet.name + ' — PawHaven';
  var pronoun = pet.gender === 'Female' ? 'her' : 'him';
  var canAdopt = pet.status === 'Available';
  var crumb = document.getElementById('crumb-name');
  if (crumb) crumb.textContent = pet.name;

  var thumbs = pet.photos.map(function (src, i) {
    return '<button type="button" data-src="' + src + '" aria-current="' + (i === 0) + '" aria-label="Show photo ' + (i + 1) + ' of ' + esc(pet.name) + '"><img src="' + src + '" alt="" loading="lazy"></button>';
  }).join('');

  var facts = [['Age', pet.age], ['Gender', pet.gender], ['Size', pet.size], ['Breed', pet.breed], ['Vaccination', pet.vaccination], ['Location', pet.location]]
    .map(function (f) { return '<div class="fact"><span>' + f[0] + '</span><strong>' + esc(f[1]) + '</strong></div>'; }).join('');

  var others = PETS.filter(function (p) { return p.id !== pet.id && p.type === pet.type; }).concat(PETS.filter(function (p) { return p.id !== pet.id && p.type !== pet.type; })).slice(0, 3);

  mount.innerHTML =
    '<div class="profile">' +
      '<div class="gallery reveal in">' +
        '<div class="main"><img id="main-photo" src="' + pet.photos[0] + '" alt="' + esc(pet.name + ', ' + pet.age.toLowerCase() + ' ' + pet.breed.toLowerCase() + ' looking for a home') + '" width="800" height="640"></div>' +
        (pet.photos.length > 1 ? '<div class="thumbs" role="group" aria-label="More photos of ' + esc(pet.name) + '">' + thumbs + '</div>' : '') +
      '</div>' +
      '<div class="profile-info reveal in">' +
        '<span class="badge badge--' + pet.status.toLowerCase() + '">' + esc(pet.status) + ' for adoption</span>' +
        '<h1>' + esc(pet.name) + '</h1>' +
        '<p class="breed">' + esc(pet.breed) + ' · ' + esc(pet.location) + '</p>' +
        '<p class="lead">' + esc(pet.short) + '</p>' +
        '<div class="facts">' + facts + '</div>' +
        '<ul class="tags" aria-label="Personality">' + pet.personality.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="profile-actions">' +
          (canAdopt
            ? '<a class="btn btn-primary" href="apply.html?pet=' + pet.id + '">Adopt Me</a>'
            : '<span class="btn btn-ghost" aria-disabled="true">Adoption ' + esc(pet.status.toLowerCase()) + '</span><a class="btn btn-soft" href="adopt.html">See friends who are available</a>') +
          '<button class="fav-btn fav-inline" type="button" data-id="' + pet.id + '" data-name="' + esc(pet.name) + '" aria-pressed="false">' + heart + '</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="story">' +
      '<div class="prose reveal"><span class="eyebrow">' + esc(pet.name) + '’s story</span><h2>A little about ' + pronoun + '</h2>' + pet.story.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
      '<div class="side-cards">' +
        '<div class="mini reveal"><h3>Health</h3><p>' + esc(pet.health) + '</p></div>' +
        '<div class="mini reveal"><h3>Vaccination</h3><p>' + esc(pet.vaccination) + '</p></div>' +
        '<div class="mini reveal"><h3>Special requirements</h3><p>' + esc(pet.special) + '</p></div>' +
      '</div>' +
    '</div>' +
    '<section class="section-more" aria-labelledby="more-h" style="margin-top:clamp(3rem,7vw,5rem)">' +
      '<div class="section-head reveal" style="margin-bottom:2rem"><h2 id="more-h">Other friends you might love</h2></div>' +
      '<div class="pet-grid" id="more"></div>' +
    '</section>';

  /* thumbnail swap */
  var main = document.getElementById('main-photo');
  mount.querySelectorAll('.thumbs button').forEach(function (b) {
    b.addEventListener('click', function () {
      main.style.opacity = 0;
      setTimeout(function () { main.src = b.dataset.src; main.style.opacity = 1; }, 180);
      mount.querySelectorAll('.thumbs button').forEach(function (x) { x.setAttribute('aria-current', x === b); });
    });
  });

  /* suggestions */
  var more = document.getElementById('more');
  more.innerHTML = others.map(function (p) {
    return '<article class="pet-card reveal in"><a class="pet-media" href="pet.html?id=' + p.id + '" tabindex="-1" aria-hidden="true"><img src="' + p.img + '" alt="" loading="lazy"><span class="badge badge--' + p.status.toLowerCase() + '">' + esc(p.status) + '</span></a>' +
      '<div class="pet-body"><h3>' + esc(p.name) + '<small>' + esc(p.age) + '</small></h3><p class="pet-breed">' + esc(p.breed) + '</p><p class="pet-desc">' + esc(p.short) + '</p><a class="btn btn-primary btn-sm" href="pet.html?id=' + p.id + '">View Profile</a></div></article>';
  }).join('');

  window.PawHaven.Fav.sync();
  if (window.PawHaven.reveal) window.PawHaven.reveal();
  mount.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
})();
