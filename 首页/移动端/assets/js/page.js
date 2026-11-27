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
  const rotate = () => {
    const horizontal = screen.width >= screen.height;
    main.querySelectorAll('.content-wrap,.icon-play-wrap,.swiper-slide-corp,.corp-button-line')
      .forEach(el => el.classList.toggle('is-horizontal', horizontal));
  };
  rotate();
  window.addEventListener('resize', rotate, {signal});
  mountHome(main, 1.14, signal, 12);

  mountFooterGroups(signal);
}

function mountFooterGroups(signal) {
  const groups = document.querySelectorAll('#site-footer .foot-group');
  groups.forEach(group => {
    const button = group.querySelector('h2 button');
    button.addEventListener('click', () => {
      const open = !group.classList.contains('is-open');
      groups.forEach(item => {
        const expanded = item === group && open;
        item.classList.toggle('is-open', expanded);
        item.querySelector('.foot-fold').inert = !expanded;
        item.querySelector('h2 button').setAttribute('aria-expanded', String(expanded));
      });
      if (open) {
        const headerBottom = document.querySelector('.tn-bar').getBoundingClientRect().bottom;
        const offset = button.getBoundingClientRect().top - headerBottom;
        if (offset < 0) window.scrollBy(0, offset);
      }
    });
  });
}

function deviceFolder() {
  const mobile = /mobile|android|iphone|ipod|phone|ipad/i.test(navigator.userAgent);
  return window.innerWidth >= 768 && !mobile ? 'PC' : '移动端';
}

if (new URLSearchParams(location.search).get('adaptive') === '1') {
  window.addEventListener('resize', () => {
    const next = deviceFolder();
    if (next !== '移动端') location.replace('../' + next + '/index.html' + location.search + location.hash);
  });
}
const signal = new AbortController().signal;
mountPage(signal);
mountNavigation(document.getElementById('site-nav'), signal, mountDrawer);
mountFooter(document.getElementById('site-footer'), signal);
