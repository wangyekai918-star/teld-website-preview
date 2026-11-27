'use strict';
function mountHome(preview, slidesPerView, signal, gallerySpacing = 42) {
  const hero = preview.querySelector('.swiper-container-videos');
  const gallery = preview.querySelector('.swiper-container-3');
  const carousels = [
    new Swiper(hero, {
      autoplay: { delay: 10000, disableOnInteraction: false },
      pagination: { el: hero.querySelector('.swiper-pagination'), clickable: true }
    }),
    new Swiper(gallery, {
      slidesPerView,
      spaceBetween: gallerySpacing,
      navigation: {
        prevEl: gallery.querySelector('.swiper-button-prev'),
        nextEl: gallery.querySelector('.swiper-button-next')
      },
      pagination: { el: gallery.querySelector('.swiper-pagination'), clickable: true }
    })
  ];

  signal.addEventListener('abort', () => {
    carousels.forEach(carousel => carousel.destroy());
  }, {once:true});
}


function mountPage(signal) {
  const main = document.querySelector('.home-preview');
  mountHome(main, 3, signal);

  const button = main.querySelector('.back-to-top');
  const syncButton = () => button.toggleAttribute('data-at-top', window.scrollY <= 0);
  syncButton();
  window.addEventListener('scroll', syncButton, {passive:true, signal});
  window.addEventListener('pageshow', syncButton, {signal});
  button.addEventListener('click', () => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({top:0, behavior:reduced ? 'instant' : 'smooth'});
  });
}

function deviceFolder() {
  const mobile = /mobile|android|iphone|ipod|phone|ipad/i.test(navigator.userAgent);
  return window.innerWidth >= 768 && !mobile ? 'PC' : '移动端';
}

if (new URLSearchParams(location.search).get('adaptive') === '1') {
  window.addEventListener('resize', () => {
    const next = deviceFolder();
    if (next !== 'PC') location.replace('../' + next + '/index.html' + location.search + location.hash);
  });
}
const signal = new AbortController().signal;
mountPage(signal);
mountNavigation(document.getElementById('site-nav'), signal, undefined);
mountFooter(document.getElementById('site-footer'), signal);
