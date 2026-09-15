/* ============================================================
   Tracking for thanksgiving.hotelsaintlouis.com
   Google Analytics 4 + Meta Pixel. The two IDs are the same ones
   hotelsaintlouis.com already uses.

   Events sent:
     every page ....... GA4 page_view (automatic) + Meta PageView
     Continue button .. GA4 begin_checkout + Meta InitiateCheckout
     /thank-you.html . GA4 purchase + Meta Purchase
                        (Square sends buyers there after they pay)

   Add ?test=1 to the thank-you.html address to check the wiring
   without recording a sale (sends a test event instead).
   ============================================================ */
(function () {
  'use strict';

  var GA_ID = 'G-YLVZ0STN38';
  var META_PIXEL_ID = '4046498412058963';
  var CURRENCY = 'USD';

  /* ---------- Google Analytics 4 ---------- */
  var ga = document.createElement('script');
  ga.async = true;
  ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(ga);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());

  var config = {};
  if (window.TG_PAGE === 'thank-you') {
    // Buyers arrive here straight from Square's checkout. Treat the visit as a
    // continuation of our own page so the sale keeps its original source
    // (lobby screen, flyer, ad...) instead of being credited to Square.
    config.page_referrer = window.location.origin + '/';
  }
  gtag('config', GA_ID, config);

  /* ---------- Meta Pixel ---------- */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');

  /* ---------- helpers used by the pages ---------- */
  function slug(size, pie) {
    return (size + '-' + pie).toLowerCase().replace(/ pie$/, '').replace(/[^a-z0-9]+/g, '-');
  }

  function item(size, pie, price) {
    return {
      item_id: 'tg26-' + slug(size, pie),
      item_name: 'Thanksgiving To-Go',
      item_variant: size + ' | ' + pie,
      price: price,
      quantity: 1
    };
  }

  window.tgTrack = {
    // Fires when the guest presses Continue. Calls done() once the events are
    // sent, or after 1.2 seconds at most, so checkout is never held up.
    beginCheckout: function (size, pie, price, done) {
      var called = false;
      function go() { if (!called) { called = true; done(); } }
      try {
        window.fbq('track', 'InitiateCheckout', {
          value: price, currency: CURRENCY, num_items: 1,
          content_name: 'Thanksgiving To-Go', content_category: size + ' | ' + pie
        });
        gtag('event', 'begin_checkout', {
          currency: CURRENCY, value: price, items: [item(size, pie, price)],
          event_callback: go, event_timeout: 1000
        });
      } catch (e) { /* tracking must never block an order */ }
      window.setTimeout(go, 1200);
    },

    purchase: function (size, pie, price, eventId, isTest) {
      try {
        if (isTest) {
          gtag('event', 'tg_test_purchase', { value: price, item_variant: size + ' | ' + pie });
          window.fbq('trackCustom', 'TestPurchase', { value: price, currency: CURRENCY });
          return;
        }
        gtag('event', 'purchase', {
          transaction_id: eventId, currency: CURRENCY, value: price,
          items: [item(size, pie, price)]
        });
        window.fbq('track', 'Purchase', {
          value: price, currency: CURRENCY, num_items: 1,
          content_name: 'Thanksgiving To-Go', content_category: size + ' | ' + pie
        }, { eventID: eventId });
      } catch (e) { /* ignore */ }
    }
  };
})();
