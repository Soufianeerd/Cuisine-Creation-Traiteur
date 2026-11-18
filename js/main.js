/* ==========================================================================
   CUISINE CRÉATION TRAITEUR — main.js
   --------------------------------------------------------------------------
   Tout le comportement interactif du site.

   Dépendances (chargées dans index.html AVANT ce fichier, depuis un CDN) :
     - GSAP 3 + ScrollTrigger : animations liées au défilement
     - Lenis                   : défilement « doux » à la molette
   Si l'une d'elles ne charge pas (CDN bloqué, hors ligne…), le site reste
   utilisable : les animations avancées sont simplement désactivées.

   Sommaire :
     0. Réglages et détection
     1. Écran de chargement
     2. Défilement doux + liens d'ancre (#section)
     3. En-tête qui change au scroll + barre mobile « Appeler / Devis »
     4. Menu mobile plein écran
     5. Diaporama du hero (photos en fondu)
     6. Texte « manifeste » qui s'éclaire mot par mot
     7. Apparitions au scroll (classes .rv, .reveal-clip, .steps li)
     8. Animations GSAP (parallaxe, cartes empilées, galerie horizontale…)
     9. Accordéon des formats
    10. Galerie des lieux à faire glisser à la souris
    11. Formulaire de devis en 3 étapes (front-end uniquement)

   Astuce dépannage : ouvrir la console du navigateur (F12 › Console).
   Une erreur rouge indique le numéro de ligne de ce fichier à regarder.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     0. RÉGLAGES ET DÉTECTION
     ------------------------------------------------------------------------ */

  // Ajoute la classe "js" sur <html> : le CSS s'en sert pour masquer les
  // éléments qui doivent apparaître en fondu. Sans JS, tout reste visible.
  document.documentElement.classList.add('js');

  // L'utilisateur a demandé « moins d'animations » dans son système ?
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // GSAP et ScrollTrigger sont-ils bien chargés ?
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  // Durées réglables (en millisecondes)
  var LOADER_DURATION = 1500;   // temps d'affichage de l'écran de chargement
  var SLIDE_INTERVAL  = 6000;   // temps entre deux photos du hero


  /* ------------------------------------------------------------------------
     1. ÉCRAN DE CHARGEMENT (.loader)
     Affiche le logo, puis glisse vers le haut. La classe "ready" sur <body>
     déclenche ensuite l'apparition du titre du hero (voir style.css).
     ------------------------------------------------------------------------ */
  var loader = document.querySelector('.loader');

  function startSite() {
    loader.classList.add('done');
    setTimeout(function () { document.body.classList.add('ready'); }, 250);
  }

  if (reduce) {
    document.body.classList.add('ready');
  } else {
    setTimeout(startSite, LOADER_DURATION);
  }


  /* ------------------------------------------------------------------------
     2. DÉFILEMENT DOUX (Lenis) + LIENS D'ANCRE
     Lenis lisse le scroll à la molette. Il est synchronisé avec GSAP pour
     que les animations au scroll restent parfaitement calées.
     ------------------------------------------------------------------------ */
  var lenis = null;

  if (!reduce && typeof window.Lenis !== 'undefined') {
    try {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      if (hasGsap) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      } else {
        (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
      }
    } catch (e) {
      lenis = null; // en cas de souci, on revient au scroll natif
    }
  }

  // Tous les liens du type href="#devis" défilent en douceur jusqu'à la section
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (id.length < 2) return;                 // lien "#" vide : on ignore
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();                                 // ferme le menu mobile s'il est ouvert
      if (lenis) {
        lenis.scrollTo(target, { offset: id === '#top' ? 0 : -10, duration: 1.6 });
      } else {
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      }
    });
  });


  /* ------------------------------------------------------------------------
     3. EN-TÊTE + BARRE MOBILE
     - .scrolled : fond sombre dès qu'on a défilé de 40 px
     - .hide     : l'en-tête se cache quand on descend, revient quand on remonte
     - #mcta.on  : la barre « Appeler / Devis » apparaît après le hero (mobile)
     ------------------------------------------------------------------------ */
  var header = document.getElementById('hdr');
  var mobileCta = document.getElementById('mcta');
  var lastY = 0;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > lastY && y > 600 && !document.body.classList.contains('menu-open'));
    mobileCta.classList.toggle('on', y > window.innerHeight * 0.7);
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ------------------------------------------------------------------------
     4. MENU MOBILE (bouton .burger → panneau #mmenu)
     La classe "menu-open" sur <body> ouvre le panneau (animation en CSS).
     La touche Échap ferme le menu.
     ------------------------------------------------------------------------ */
  var burger = document.querySelector('.burger');
  var mobileMenu = document.getElementById('mmenu');

  function openMenu() {
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    mobileMenu.setAttribute('aria-hidden', 'false');
    if (lenis) lenis.stop();                      // bloque le scroll derrière le menu
  }

  function closeMenu() {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (lenis) lenis.start();
  }

  burger.addEventListener('click', function () {
    if (document.body.classList.contains('menu-open')) closeMenu();
    else openMenu();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });


  /* ------------------------------------------------------------------------
     5. DIAPORAMA DU HERO
     Les photos sont les <div class="slide"> dans index.html. La classe "on"
     affiche la photo active. Les boutons à droite (.hero-index) permettent
     de choisir une photo. Pour ajouter une photo : ajouter un .slide ET un
     bouton dans le HTML, avec data-i = son numéro (à partir de 0).
     ------------------------------------------------------------------------ */
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var slideButtons = [].slice.call(document.querySelectorAll('.hero-index button'));
  var current = 0;
  var slideTimer;

  function showSlide(i) {
    slides[current].classList.remove('on');
    slideButtons[current].classList.remove('on');
    current = i;
    slides[current].classList.add('on');
    slideButtons[current].classList.add('on');
  }

  function autoPlay() {
    clearInterval(slideTimer);
    if (!reduce) {
      slideTimer = setInterval(function () {
        showSlide((current + 1) % slides.length);
      }, SLIDE_INTERVAL);
    }
  }

  slideButtons.forEach(function (btn, i) {
    btn.addEventListener('click', function () { showSlide(i); autoPlay(); });
  });
  autoPlay();


  /* ------------------------------------------------------------------------
     6. TEXTE MANIFESTE (#mani)
     Découpe le paragraphe en mots (<span class="w">) pour pouvoir les
     éclairer un par un au scroll (animation dans la partie 8).
     ------------------------------------------------------------------------ */
  var manifesto = document.getElementById('mani');

  (function splitWords(node) {
    [].slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType === 3) {                 // nœud texte
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function (word) {
          if (!word) return;
          if (/^\s+$/.test(word)) {
            frag.appendChild(document.createTextNode(word));
          } else {
            var span = document.createElement('span');
            span.className = 'w';
            span.textContent = word;
            frag.appendChild(span);
          }
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1) {          // élément (ex. <em>) : on descend dedans
        splitWords(child);
      }
    });
  })(manifesto);

  var words = [].slice.call(manifesto.querySelectorAll('.w'));


  /* ------------------------------------------------------------------------
     7. APPARITIONS AU SCROLL
     Quand un élément .rv / .reveal-clip / .steps li entre à l'écran, on lui
     ajoute la classe "in" : le CSS gère le fondu ou le dévoilement.
     Pour faire apparaître un nouvel élément en fondu : lui ajouter class="rv".
     ------------------------------------------------------------------------ */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);   // une seule fois
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });

  document.querySelectorAll('.rv, .reveal-clip, .steps li').forEach(function (el) {
    revealObserver.observe(el);
  });


  /* ------------------------------------------------------------------------
     8. ANIMATIONS GSAP (seulement si GSAP est chargé et animations permises)
     ------------------------------------------------------------------------ */
  if (hasGsap && !reduce) {

    // 8a. Les mots du manifeste passent de transparent à opaque au scroll
    gsap.to(words, {
      opacity: 1, stagger: 0.05, ease: 'none',
      scrollTrigger: { trigger: manifesto, start: 'top 80%', end: 'bottom 45%', scrub: true }
    });

    // 8b. Parallaxe douce sur les images marquées data-par dans le HTML
    //     (l'image glisse légèrement à l'intérieur de son cadre)
    document.querySelectorAll('[data-par]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -5 }, {
        yPercent: 5, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    // 8c. Cartes « Nos réceptions » : chaque carte rétrécit quand la suivante
    //     vient la recouvrir (l'empilement lui-même est en CSS : position sticky)
    var cards = gsap.utils.toArray('.card');
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      gsap.to(card, {
        scale: 0.92, opacity: 0.55, ease: 'none',
        scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 20%', scrub: true }
      });
    });

    // 8d. Hero : les photos descendent un peu et le texte s'efface au scroll
    gsap.to('.slides', {
      yPercent: 18, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.hero-inner', {
      opacity: 0, y: -60, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '30% top', end: '85% top', scrub: true }
    });

    // 8e. Galerie « Savoir-faire » qui défile à l'horizontale (ordinateur
    //     uniquement, au-dessus de 900 px). Sur mobile/tablette, c'est un
    //     simple carrousel à faire glisser au doigt (géré en CSS).
    var media = gsap.matchMedia();
    media.add('(min-width: 901px)', function () {
      var track = document.querySelector('.sig-track');
      var distance = function () { return track.scrollWidth - window.innerWidth; };

      var horizontal = gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: '.sig-pin',
          start: 'top top',
          end: function () { return '+=' + distance(); },
          pin: true,               // la section reste fixée pendant le défilement
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: function (self) { gsap.set('.sig-progress i', { scaleX: self.progress }); }
        }
      });

      // Petite parallaxe horizontale des photos à l'intérieur de leur cadre
      gsap.utils.toArray('.sig-item img').forEach(function (img) {
        gsap.fromTo(img, { xPercent: -8 }, {
          xPercent: 8, ease: 'none',
          scrollTrigger: {
            trigger: img.closest('.sig-item'),
            containerAnimation: horizontal,
            start: 'left right', end: 'right left', scrub: true
          }
        });
      });

      return function () { gsap.set(track, { x: 0 }); }; // remise à zéro en passant sous 900 px
    });

    // 8f. Ligne dorée de la frise « La Maison » qui se remplit au scroll
    gsap.to('.tlw .prog', {
      height: 'calc(100% - 16px)', ease: 'none',
      scrollTrigger: { trigger: '.tl', start: 'top 70%', end: 'bottom 60%', scrub: true }
    });

    // 8g. Grand texte du pied de page qui monte en fondu
    gsap.from('.foot .big', {
      yPercent: 40, opacity: 0, ease: 'none',
      scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'top 40%', scrub: true }
    });

    // Recalcule toutes les positions une fois les images chargées
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });

  } else {
    // Sans GSAP : le manifeste s'affiche directement en entier
    words.forEach(function (w) { w.style.opacity = 1; });
  }


  /* ------------------------------------------------------------------------
     9. ACCORDÉON DES FORMATS (#formats)
     Un clic sur un titre ouvre son panneau (photo + texte) et ferme les
     autres. Le lien « Choisir ce format » pré-remplit le champ « Format
     souhaité » du formulaire de devis (data-format doit correspondre
     exactement au texte d'une <option> de #f-format).
     ------------------------------------------------------------------------ */
  var formatItems = [].slice.call(document.querySelectorAll('.fitem'));

  formatItems.forEach(function (item) {
    item.querySelector('.frow').addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      formatItems.forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.frow').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        this.setAttribute('aria-expanded', 'true');
      }
      // La hauteur de la page change : on prévient ScrollTrigger après l'animation
      if (hasGsap) setTimeout(function () { ScrollTrigger.refresh(); }, 850);
    });
  });

  document.querySelectorAll('.flink').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = document.getElementById('f-format');
      [].forEach.call(select.options, function (opt) {
        if (opt.text === link.dataset.format) select.value = opt.value || opt.text;
      });
    });
  });


  /* ------------------------------------------------------------------------
     10. GALERIE DES LIEUX (.drag)
     Sur ordinateur, on peut la faire glisser en maintenant le clic.
     Au doigt et au pavé tactile, c'est le défilement horizontal natif.
     ------------------------------------------------------------------------ */
  var drag = document.querySelector('.drag');
  var isDown = false, startX = 0, startScroll = 0;

  drag.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    isDown = true;
    startX = e.clientX;
    startScroll = drag.scrollLeft;
    drag.classList.add('down');
  });
  window.addEventListener('pointerup', function () {
    isDown = false;
    drag.classList.remove('down');
  });
  drag.addEventListener('pointermove', function (e) {
    if (!isDown) return;
    drag.scrollLeft = startScroll - (e.clientX - startX);
  });
  // Empêche Lenis d'intercepter le défilement horizontal de cette galerie
  drag.setAttribute('data-lenis-prevent-horizontal', '');


  /* ------------------------------------------------------------------------
     11. FORMULAIRE DE DEVIS (#form) — FRONT-END UNIQUEMENT
     Étape 0 : type d'événement → 1 : détails → 2 : coordonnées → 3 : merci.
     RIEN N'EST ENVOYÉ pour l'instant. Pour brancher le back-end, remplacer le
     bloc marqué « ENVOI » plus bas par un fetch() vers votre API.
     ------------------------------------------------------------------------ */
  var steps = [].slice.call(document.querySelectorAll('.fstep'));
  var progressBars = [].slice.call(document.querySelectorAll('.fsteps i'));
  var step = 0;
  var nextBtn = document.getElementById('next');
  var backBtn = document.getElementById('back');
  var errorBox = document.getElementById('err');

  // Affiche l'étape i et met à jour boutons et barre de progression
  function goTo(i) {
    steps[step].classList.remove('on');
    step = i;
    steps[step].classList.add('on');
    progressBars.forEach(function (bar, k) { bar.classList.toggle('on', k <= Math.min(step, 2)); });
    backBtn.hidden = (step === 0 || step === 3);
    nextBtn.hidden = (step === 3);
    nextBtn.innerHTML = (step === 2 ? 'Envoyer ma demande' : 'Continuer') + ' <span class="arr">→</span>';
    errorBox.textContent = '';
    var firstField = steps[step].querySelector('input, select, textarea');
    if (firstField && step > 0) {
      setTimeout(function () { try { firstField.focus({ preventScroll: true }); } catch (e) {} }, 300);
    }
  }

  // Vérifie l'étape en cours. Renvoie un message d'erreur, ou '' si tout va bien.
  function validate() {
    if (step === 0 && !document.querySelector('input[name=type]:checked')) {
      return 'Choisissez un type d’événement.';
    }
    if (step === 1 && !document.getElementById('f-guests').value) {
      return 'Indiquez un nombre approximatif d’invités.';
    }
    if (step === 2) {
      if (!document.getElementById('f-name').value.trim()) return 'Indiquez votre nom.';
      if (!/^\S+@\S+\.\S+$/.test(document.getElementById('f-email').value)) return 'Indiquez une adresse e-mail valide.';
      if (!document.getElementById('f-ok').checked) return 'Merci d’accepter le traitement de vos données.';
    }
    return '';
  }

  nextBtn.addEventListener('click', function () {
    var message = validate();
    if (message) { errorBox.textContent = message; return; }

    if (step === 2) {
      /* ---- ENVOI : à remplacer par l'appel au back-end ----
         Données disponibles :
           type     → document.querySelector('input[name=type]:checked').value
           date     → #f-date      invités → #f-guests   lieu    → #f-place
           format   → #f-format    message → #f-msg
           nom      → #f-name      société → #f-company
           e-mail   → #f-email     tél.    → #f-tel
      ------------------------------------------------------ */
      var type = document.querySelector('input[name=type]:checked').value;
      var guests = document.getElementById('f-guests').value;
      var firstName = document.getElementById('f-name').value.trim().split(' ')[0];
      document.getElementById('recap').textContent =
        'Merci ' + firstName + '. Votre demande « ' + type + ' » pour ' + guests +
        ' invités est prête. Version de démonstration : l’envoi sera activé à la mise en ligne.';
    }
    goTo(step + 1);
  });

  backBtn.addEventListener('click', function () { goTo(step - 1); });

  // À l'étape 1, choisir un type d'événement passe automatiquement à la suite
  document.querySelectorAll('input[name=type]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      setTimeout(function () { if (step === 0) goTo(1); }, 350);
    });
  });

  // Sécurité : la touche Entrée ne recharge jamais la page
  document.getElementById('form').addEventListener('submit', function (e) { e.preventDefault(); });

})();
