'use strict';
function mountScenes(section, signal) {
  const track = section.querySelector('.scene-track');
  const slideCount = track.querySelectorAll('figure').length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const carousel = new window.Swiper(track, {
    loop:true, loopedSlides:slideCount, centeredSlides:true,
    slidesPerView:2.6, spaceBetween:20,
    // Swiper 4 breakpoints apply up to the specified width.
    breakpoints:{650:{slidesPerView:1.22, spaceBetween:12}, 1024:{slidesPerView:1.65, spaceBetween:16}},
    slideToClickedSlide:true, grabCursor:true, a11y:false, speed:reduced.matches ? 0 : 350
  });
  track.querySelectorAll('.swiper-slide-duplicate').forEach(slide => slide.setAttribute('aria-hidden','true'));
  section.querySelector('[data-previous]').addEventListener('click', () => carousel.slidePrev(), {signal});
  section.querySelector('[data-next]').addEventListener('click', () => carousel.slideNext(), {signal});
  section.addEventListener('keydown', event => {
    switch (event.key) {
      case 'ArrowLeft': carousel.slidePrev(); break;
      case 'ArrowRight': carousel.slideNext(); break;
      case 'Home': carousel.slideToLoop(0); break;
      case 'End': carousel.slideToLoop(slideCount-1); break;
      default: return;
    }
    event.preventDefault();
  }, {signal});
  reduced.addEventListener('change', () => { carousel.params.speed = reduced.matches ? 0 : 350; }, {signal});
  signal.addEventListener('abort', () => carousel.destroy(), {once:true});
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
mountScenes(document.getElementById('applications'), signal);
mountNavigation(document.getElementById('site-nav'), signal, undefined);
mountFooter(document.getElementById('site-footer'), signal);
