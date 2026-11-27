'use strict';
function mountImageViewer(main) {
  const dialog = main.querySelector('.image-viewer');
  const image = dialog.querySelector('img');
  const stage = dialog.querySelector('.viewer-stage');
  let trigger;


  main.querySelectorAll('[data-image-preview]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      const thumbnail = button.querySelector('img');
      image.src = thumbnail.currentSrc || thumbnail.src;
      image.alt = thumbnail.alt;
      dialog.querySelector('#viewer-title').textContent = button.dataset.imagePreview;
      dialog.showModal();
    });
  });
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog || event.target === stage) dialog.close();
  });
  dialog.addEventListener('close', () => trigger?.focus({preventScroll:true}));
}

function mountConsultDialog(main) {
  const dialog = main.querySelector('#consult-dialog');
  main.querySelectorAll('[aria-controls="consult-dialog"]').forEach(button => {
    button.addEventListener('click', () => dialog.showModal());
  });
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

}

function mountPlatform(main, signal) {
  mountConsultDialog(main);
  mountImageViewer(main);
  const buttons = [...main.querySelectorAll('.vpp-feature-trigger')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const top = button.getBoundingClientRect().top;
      for (const item of buttons) {
        const active = item === button;
        item.setAttribute('aria-expanded', String(active));
        document.getElementById(item.getAttribute('aria-controls')).hidden = !active;
      }
      if (matchMedia('(max-width:700px)').matches && button.getBoundingClientRect().top < 60) {
        window.scrollBy(0, button.getBoundingClientRect().top - Math.max(60, top));
      }
    }, {signal});
  }
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
mountPlatform(document.querySelector('main'), signal);
mountNavigation(document.getElementById('site-nav'), signal, undefined);
mountFooter(document.getElementById('site-footer'), signal);
