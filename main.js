/* Bailly – comportements communes à toutes les pages */
(function () {
  document.documentElement.classList.add('js');

  /* En-tête : ombre au défilement */
  var entete = document.getElementById('entete');
  function surDefilement() { entete.classList.toggle('defile', window.scrollY > 8); }
  window.addEventListener('scroll', surDefilement, { passive: true });
  surDefilement();

  /* Menu burger (mobile) */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu-mobile');
  function fermerMenu() {
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
  }
  burger.addEventListener('click', function () {
    if (burger.getAttribute('aria-expanded') === 'true') { fermerMenu(); return; }
    menu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    var premier = menu.querySelector('a');
    if (premier) premier.focus();
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) fermerMenu(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { fermerMenu(); burger.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth >= 960) fermerMenu(); });

  /* Apparition douce au défilement */
  var elements = document.querySelectorAll('.apparait');
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduit || !('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    elements.forEach(function (el) { obs.observe(el); });
  }

  /* Page contact : préremplir le message quand on arrive depuis une offre (?offre=...) */
  var form = document.getElementById('formulaire-contact');
  if (form) {
    var offre = new URLSearchParams(location.search).get('offre');
    var message = document.getElementById('message');
    if (offre && message && !message.value) {
      message.value = 'Bonjour, je voudrais en savoir plus sur : ' + offre.slice(0, 80) + '.';
    }
    /* Évite le double envoi */
    form.addEventListener('submit', function () {
      var bouton = form.querySelector('button[type="submit"]');
      setTimeout(function () { bouton.disabled = true; }, 0);
    });
  }

  /* Écran d'entrée : à la 1re visite sur l'accueil seulement (forcer avec ?entree=1) */
  var entree = document.getElementById('entree');
  if (entree) {
    var CLE = 'bailly-entree-vue';
    var dejaVu = false;
    try { dejaVu = localStorage.getItem(CLE) === '1'; } catch (e) {}
    var forcer = /[?&]entree=1/.test(location.search);
    function memoriser() { try { localStorage.setItem(CLE, '1'); } catch (e) {} }
    function fermerEntree() {
      memoriser();
      entree.hidden = true;
      document.body.classList.remove('entree-ouverte');
      var cible = document.getElementById('contenu');
      if (cible) { cible.setAttribute('tabindex', '-1'); cible.focus({ preventScroll: true }); }
    }
    if ((forcer || !dejaVu) && !location.hash) {
      entree.hidden = false;
      document.body.classList.add('entree-ouverte');
      entree.querySelector('.entree-boite').focus();
      entree.querySelectorAll('.choix-carte').forEach(function (a) { a.addEventListener('click', memoriser); });
      document.getElementById('entree-passer').addEventListener('click', fermerEntree);
      entree.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { fermerEntree(); return; }
        if (e.key === 'Tab') {
          var f = entree.querySelectorAll('a, button');
          if (document.activeElement === entree.querySelector('.entree-boite')) { e.preventDefault(); (e.shiftKey ? f[f.length - 1] : f[0]).focus(); return; }
          var debut = f[0], fin = f[f.length - 1];
          if (e.shiftKey && document.activeElement === debut) { e.preventDefault(); fin.focus(); }
          else if (!e.shiftKey && document.activeElement === fin) { e.preventDefault(); debut.focus(); }
        }
      });
    }
  }
})();
