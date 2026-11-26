/* PawHaven — contact form (frontend demo only) */
(function () {
  'use strict';
  var form = document.getElementById('contact-form');
  var box = document.getElementById('contact-box');
  PawForm(form, function (d) {
    var name = String(d.name).split(' ')[0].replace(/[&<>"]/g, '');
    box.innerHTML =
      '<div class="success" role="status" tabindex="-1" id="sent">' +
        '<div class="tick"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7l8 6 8-6M4 7v10h16V7H4Z"/></svg></div>' +
        '<h2>Thank you, ' + name + '.</h2>' +
        '<p class="lead" style="margin-inline:auto">Your message passed validation.</p>' +
        '<div class="demo-banner" style="text-align:left;max-width:520px;margin:1.2rem auto 0"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg><div><strong>This is a website demonstration.</strong> The message was not sent — there is no server behind this form.</div></div>' +
      '</div>';
    document.getElementById('sent').focus();
  });
})();
