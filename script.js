/* Behaviour ported from the design canvas.

   The canvas scrolled each artboard inside its own scroll container; on the web
   the window is the scroller, so anything that read root.scrollTop now reads
   window scroll instead. */

(function () {
  'use strict';

  /* scripting is available, so the burger can take over from the nav links */
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     Nav: transparent over the hero, solid once you start scrolling
     --------------------------------------------------------------- */
  function inkNav() {
    var nav = document.querySelector('[data-inknav]');
    if (!nav) return;

    var on = null;
    var hidden = false;
    /* The bar rides away with the page and stays gone. The two thresholds are
       deliberately different: it leaves once you are properly into the page,
       and comes back only when you are all the way back at the top, so it
       never slides in over what you are reading. */
    var LEAVE = 40;
    var RETURN = 2;

    function paint() {
      var y = window.scrollY;

      var next = y > 40;
      if (next !== on) {
        on = next;
        /* the colours live in the stylesheet so they follow --surface */
        if (next) nav.setAttribute('data-stuck', '');
        else nav.removeAttribute('data-stuck');
      }

      /* Scrolling takes the bar with the page rather than pinning it. Which
         way you are going does not matter — only where you are. */
      var shouldHide = y > (hidden ? RETURN : LEAVE)
        && !document.body.hasAttribute('data-menu-open');
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        if (hidden) nav.setAttribute('data-hidden', '');
        else nav.removeAttribute('data-hidden');
      }
    }

    /* the menu owns the bar while it is open — its close control lives there */
    nav.showAlways = function () {
      hidden = false;
      nav.removeAttribute('data-hidden');
    };

    window.addEventListener('scroll', paint, { passive: true });
    paint();
  }

  /* ---------------------------------------------------------------
     Case-study table of contents
     --------------------------------------------------------------- */
  function spy() {
    var root = document.querySelector('[data-spy-root]');
    if (!root) return;

    var links = [].slice.call(root.querySelectorAll('[data-spy-link]'));
    var secs = [].slice.call(root.querySelectorAll('[data-spy-section]'));
    if (!links.length || !secs.length) return;

    function paint() {
      var line = window.scrollY + window.innerHeight * 0.3;
      var active = 0;
      secs.forEach(function (s, i) {
        if (s.getBoundingClientRect().top + window.scrollY <= line) active = i;
      });
      links.forEach(function (l, i) {
        l.style.color = i === active ? '#14141C' : '#5F5C6B';
        l.setAttribute('aria-current', i === active ? 'true' : 'false');
      });
    }

    function go(i) {
      var s = secs[i];
      if (!s) return;
      var top = s.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    links.forEach(function (l, i) {
      l.style.cursor = 'pointer';
      l.addEventListener('click', function () { go(i); });
      l.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(i); }
      });
    });

    window.addEventListener('scroll', paint, { passive: true });
    paint();
  }

  /* ---------------------------------------------------------------
     Before/after cross-fades

     Each figure loops from the "before" image to the "after" and back; the
     button pauses it so the state on screen can be read properly. There is
     more than one of these on a page, so each button drives its own figure.
     --------------------------------------------------------------- */
  function crossfades() {
    var figures = [].slice.call(document.querySelectorAll('.fade'));
    if (!figures.length) return;

    figures.forEach(function (fig) {
      var btn = fig.querySelector('[data-flowtoggle]');
      if (!btn) return;
      var glyph = btn.querySelector('span');

      function set(paused) {
        if (paused) fig.setAttribute('data-paused', '');
        else fig.removeAttribute('data-paused');
        btn.title = paused ? 'Play' : 'Pause';
        btn.setAttribute('aria-label',
          (paused ? 'Play' : 'Pause') + ' the before and after comparison');
        if (glyph) glyph.textContent = paused ? '\u25B6' : '\u2759\u2759';
      }

      btn.addEventListener('click', function () {
        set(!fig.hasAttribute('data-paused'));
      });

      if (reduceMotion) set(true);
    });
  }

  /* ---------------------------------------------------------------
     Rows of looping clips

     The clips are decoration, not a player: muted, looping, no controls. They
     are also by far the heaviest thing on the site, so they ship as
     preload="none" and nothing is fetched until the observer says a row is
     near the viewport — not even the frame a poster would cost. A visitor who
     never reaches U4RIA's final content downloads none of it, and a row that
     scrolls away is paused again.
     --------------------------------------------------------------- */
  function reels() {
    var items = [].slice.call(document.querySelectorAll('.reel__item'));
    if (!items.length) return;

    var PLAY = '▶', PAUSE = '❙❙';
    var ICON_MUTED = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
    var ICON_SOUND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';

    function clipOf(item) { return item.querySelector('.reel__clip'); }
    /* numbered within its own row, to match the labels the build writes */
    function numberOf(item) {
      return [].indexOf.call(item.parentNode.querySelectorAll('.reel__item'), item) + 1;
    }

    function paintPlay(item) {
      var b = item.querySelector('[data-reel-toggle]');
      if (!b) return;
      var playing = !clipOf(item).paused;
      b.textContent = playing ? PAUSE : PLAY;
      b.title = playing ? 'Pause' : 'Play';
      b.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' clip ' + numberOf(item));
    }
    function paintSound(item) {
      var b = item.querySelector('[data-reel-sound]');
      if (!b) return;
      var on = !clipOf(item).muted;
      b.innerHTML = on ? ICON_SOUND : ICON_MUTED;
      b.title = on ? 'Mute' : 'Sound on';
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.setAttribute('aria-label', (on ? 'Mute' : 'Turn sound on for') + ' clip ' + numberOf(item));
    }
    function play(v) {
      if (v.preload !== 'auto') v.preload = 'auto';
      var p = v.play();
      /* a play() the browser declines is not an error worth surfacing */
      if (p && p.catch) p.catch(function () {});
    }

    items.forEach(function (item) {
      var v = clipOf(item);
      /* the attribute is enough for autoplay, but Safari has historically needed
         the property set as well before play() is allowed without a gesture */
      v.muted = true;
      v.addEventListener('play', function () { paintPlay(item); });
      v.addEventListener('pause', function () { paintPlay(item); });

      var toggle = item.querySelector('[data-reel-toggle]');
      if (toggle) toggle.addEventListener('click', function () {
        if (v.paused) { delete v.dataset.userPaused; play(v); }
        else { v.dataset.userPaused = '1'; v.pause(); }
      });

      var sound = item.querySelector('[data-reel-sound]');
      if (sound) sound.addEventListener('click', function () {
        var turnOn = v.muted;
        /* one voice at a time: turning a track up turns the others down */
        if (turnOn) items.forEach(function (other) {
          var ov = clipOf(other);
          if (ov !== v && !ov.muted) { ov.muted = true; paintSound(other); }
        });
        v.muted = !turnOn;
        paintSound(item);
        /* asking to hear something that is paused means play it */
        if (turnOn && v.paused) { delete v.dataset.userPaused; play(v); }
      });
    });

    /* The clips are by far the heaviest thing on the site, so they ship as
       preload="none" and nothing is fetched until a row is near the viewport.
       Off-screen clips pause; a clip the visitor paused stays paused. */
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { clipOf(item).preload = 'metadata'; });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (!e.isIntersecting) { if (!v.paused) v.pause(); return; }
        /* reduced motion, or paused by hand: show the first frame and wait */
        if (reduceMotion || v.dataset.userPaused) {
          if (v.preload === 'none') v.preload = 'metadata';
          return;
        }
        play(v);
      });
    }, { rootMargin: '200px 0px' });

    items.forEach(function (item) { io.observe(clipOf(item)); });
  }

  /* ---------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------- */
  function mobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-menu]');
    if (!toggle || !menu) return;

    menu.removeAttribute('hidden');

    var open = false;

    function setOpen(next) {
      if (next === open) return;
      open = next;

      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');

      if (open) {
        menu.setAttribute('data-open', '');
        document.body.setAttribute('data-menu-open', '');
        var bar = document.querySelector('[data-inknav]');
        if (bar && bar.showAlways) bar.showAlways();
        /* Focus the panel itself, not its first link: tabbing from here still
           lands on Work, but a tap no longer leaves a focus ring drawn around
           it. The panel takes no ring of its own (see .menu__inner in the
           stylesheet). */
        var panel = menu.querySelector('.menu__inner') || menu;
        panel.focus({ preventScroll: true });
      } else {
        /* hand focus back to the button that owns the panel, but only if it is
           still inside — a tap may never have focused the button at all, and a
           link closing the panel is on its way to another page */
        var inside = menu.contains(document.activeElement);
        menu.removeAttribute('data-open');
        document.body.removeAttribute('data-menu-open');
        if (inside) toggle.focus({ preventScroll: true });
      }
    }

    toggle.addEventListener('click', function () { setOpen(!open); });

    document.addEventListener('keydown', function (ev) {
      if (!open) return;
      if (ev.key === 'Escape') { setOpen(false); return; }
      if (ev.key !== 'Tab') return;

      /* keep tabbing inside the panel and its toggle while it is open */
      var stops = [toggle].concat([].slice.call(menu.querySelectorAll('a')));
      var i = stops.indexOf(document.activeElement);
      if (i === -1) return;
      var next = ev.shiftKey ? i - 1 : i + 1;
      if (next < 0) next = stops.length - 1;
      if (next >= stops.length) next = 0;
      ev.preventDefault();
      stops[next].focus();
    });

    /* a link leaving the page, or the viewport growing past the breakpoint,
       must not leave the body scroll-locked */
    menu.addEventListener('click', function (ev) {
      if (ev.target.closest('a')) setOpen(false);
    });
    /* leaving the burger breakpoint closes the panel and clears its state.
       matchMedia is used rather than resize because it fires off the same
       media query the stylesheet switches on. */
    var narrow = window.matchMedia('(max-width: 620px)');
    var onChange = function (ev) { if (!ev.matches) setOpen(false); };
    if (narrow.addEventListener) narrow.addEventListener('change', onChange);
    else if (narrow.addListener) narrow.addListener(onChange);
    /* belt and braces: some engines resize the viewport without re-evaluating
       the query in time, so a plain resize check runs too */
    window.addEventListener('resize', function () {
      if (open && !narrow.matches) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------
     "Outside design, you can find me..."

     Only touch devices showing the four-across layout need this. A pointer
     device has :hover, and below 900px the row is a 2x2 whose captions are
     always visible, so there is nothing to toggle.
     --------------------------------------------------------------- */
  function outsidePhotos() {
    var row = document.querySelector('[data-outrow]');
    if (!row) return;
    var photos = [].slice.call(row.querySelectorAll('[data-outphoto]'));
    if (!photos.length) return;

    var canHover = window.matchMedia('(hover: hover)');
    var alwaysOn = window.matchMedia('(max-width: 900px)');
    var interactive = function () { return !canHover.matches && !alwaysOn.matches; };

    function clear() {
      photos.forEach(function (p) { p.removeAttribute('data-active'); });
      row.removeAttribute('data-has-active');
    }

    function toggle(photo, ev) {
      if (!interactive()) return;
      var wasActive = photo.hasAttribute('data-active');
      ev.stopPropagation();
      clear();
      if (!wasActive) {
        photo.setAttribute('data-active', '');
        row.setAttribute('data-has-active', '');
      }
    }

    photos.forEach(function (photo) {
      photo.addEventListener('click', function (ev) { toggle(photo, ev); });
      photo.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(photo, ev); }
      });
    });

    /* the photos are only controls while they actually toggle something */
    function sync() {
      var on = interactive();
      photos.forEach(function (p) {
        if (on) {
          p.setAttribute('tabindex', '0');
          p.setAttribute('role', 'button');
        } else {
          p.removeAttribute('tabindex');
          p.removeAttribute('role');
        }
      });
      if (!on) clear();
    }

    [canHover, alwaysOn].forEach(function (mq) {
      if (mq.addEventListener) mq.addEventListener('change', sync);
      else if (mq.addListener) mq.addListener(sync);
    });
    window.addEventListener('resize', sync);

    document.addEventListener('click', clear);
    sync();
  }

  /* Prototype recordings: play while on screen, pause when scrolled away.
     With reduced motion they stay on their first frame. */
  function autoloops() {
    var vids = [].slice.call(document.querySelectorAll('video[data-autoloop]'));
    if (!vids.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    function play(v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
    if (!('IntersectionObserver' in window)) { vids.forEach(play); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) play(e.target); else e.target.pause(); });
    }, { rootMargin: '200px 0px' });
    vids.forEach(function (v) { io.observe(v); });
  }

  function init() { inkNav(); spy(); crossfades(); reels(); autoloops(); mobileMenu(); outsidePhotos(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
