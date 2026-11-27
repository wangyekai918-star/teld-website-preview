function mountDrawer(host, signal) {
  const drawer = host.querySelector('.tn-drawer');
  const menu = drawer.querySelector('.tn-menu-root');
  const panel = drawer.querySelector('.tn-panel');
  const toggle = host.querySelector('.tn-toggle');
  const logo = host.querySelector('.tn-logo');
  const language = host.querySelector('.tn-lang');
  const phoneZone = host.querySelector('.tn-phone-zone');
  const heading = host.querySelector('.tn-mobile-heading');
  const back = heading.querySelector('.tn-dismiss');
  const menuScroll = menu.querySelector('.tn-menu-scroll');
  const background = [document.querySelector('main'), document.querySelector('#site-footer')];

  const about = menu.querySelector('[data-about-toggle]');
  const folds = [...menu.querySelectorAll('.tn-menu-fold')];
  let requestedButton = null;
  let revision = 0;

  async function selectFold(button = null) {
    const request = ++revision;
    requestedButton = button;
    const target = button && document.getElementById(button.getAttribute('aria-controls'));
    const closing = [];
    for (const fold of folds) {
      const trigger = menu.querySelector('[aria-controls="' + fold.id + '"]');
      trigger?.setAttribute('aria-expanded', String(fold === target));
      if (fold === target) continue;
      fold.inert = true;
      if (target) closing.push(...fold.getAnimations().map(animation => animation.finished));
    }
    if (closing.length) await Promise.allSettled(closing);
    if (request === revision && target) target.inert = false;
  }
  function toggleFold(button) {
    selectFold(requestedButton === button ? null : button);
  }
  about.addEventListener('click', () => toggleFold(about), {signal});

  function lockPage(locked) {
    document.documentElement.classList.toggle('mobile-menu-open', locked);
    background.forEach(el => { el.inert = locked; });
  }
  signal.addEventListener('abort', () => lockPage(false), {once:true});
  drawer.hidden = false;
  panel.hidden = false;
  return {
    selectFold,
    toggleFold,
    setHeading(title) {
      back.querySelector('span').textContent = title;
      back.setAttribute('aria-label', title + '，返回主导航');
    },
    update(open, active) {
      if (!open && (drawer.contains(document.activeElement) || back === document.activeElement || language === document.activeElement)) toggle.focus({preventScroll:true});
      logo.hidden = open;
      phoneZone.hidden = open;
      language.hidden = !open || Boolean(active);
      heading.hidden = !open || !active;
      if (open && drawer.inert) {
        menuScroll.scrollTop = 0;
        selectFold();
      }
      if (!open || active) selectFold();
      // Animate only navigation within an already open drawer.
      drawer.toggleAttribute('data-level-motion', open && !drawer.inert);
      drawer.inert = !open;
      lockPage(open);
      // Keep both levels mounted so returning restores the same scroll position.
      if (open) {
        menu.inert = Boolean(active);
        panel.inert = !active;
        if (active) back.focus({preventScroll:true});
      }
    }
  };
}
