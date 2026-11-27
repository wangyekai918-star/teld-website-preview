'use strict';
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
  const gallery = main.querySelector('.architecture');
  const track = gallery.querySelector('.architecture-track');
  const figures = [...track.querySelectorAll('figure')];
  const thumbs = gallery.querySelectorAll('.architecture-thumbs button');
  let current = 0;

  function updateGallery() {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    if (!figures[index] || index === current) return;
    current = index;
    figures.forEach((figure, i) => { figure.inert = i !== index; });
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-pressed', String(i === index)));
  }

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => track.scrollTo({left: index * track.clientWidth}), {signal});
  });
  track.addEventListener('scroll', updateGallery, {signal, passive:true});

  for (const group of main.querySelectorAll('[data-switch]')) {
    const buttons = [...group.querySelectorAll('[role=tab]')];
    const list = group.querySelector('[role=tablist]');
    const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
    const sceneTabs = list.classList.contains('scene-tabs');
    const container = group.querySelector('.ability-panels');
    let heightAnimation;
    function select(index) {
      if (buttons[index].getAttribute('aria-selected') === 'true') return;
      const startHeight = container?.getBoundingClientRect().height;
      heightAnimation?.cancel();
      list.style.setProperty(sceneTabs ? '--scene-index' : '--switch-index', index);
      buttons.forEach((button, i) => {
        const active = i === index;
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
        if (sceneTabs) panels[i].inert = !active;
        else panels[i].hidden = !active;
      });
      if (container && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const endHeight = panels[index].getBoundingClientRect().height;
        if (Math.abs(endHeight - startHeight) >= 1) {
          heightAnimation = container.animate(
            [{height: startHeight + 'px'}, {height: endHeight + 'px'}],
            {duration: 320, easing: 'ease-out'}
          );
        }
      }
      const edge = list.getBoundingClientRect();
      const selected = buttons[index].getBoundingClientRect();
      if (list.scrollWidth > list.clientWidth && (selected.left < edge.left || selected.right > edge.right)) {
        list.scrollBy({left:selected.left - edge.left - (edge.width - selected.width) / 2});
      }
    }
    buttons.forEach((button, i) => {
      button.addEventListener('click', () => select(i), {signal});
      button.addEventListener('keydown', event => {
        const jumps = {ArrowLeft:i-1, ArrowRight:i+1, Home:0, End:buttons.length-1};
        if (!Object.hasOwn(jumps, event.key)) return;
        event.preventDefault();
        const target = (jumps[event.key] + buttons.length) % buttons.length;
        select(target);
        buttons[target].focus({preventScroll:true});
      }, {signal});
    });
  }
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
mountFooterGroups(signal);
mountPlatform(document.querySelector('main'), signal);
mountNavigation(document.getElementById('site-nav'), signal, mountDrawer);
mountFooter(document.getElementById('site-footer'), signal);
