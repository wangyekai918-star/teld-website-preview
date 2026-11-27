function mountFooter(footer, signal) {
  const wechat = footer.querySelector('.foot-wechat');
  const wechatButton = wechat.querySelector('button');
  const qr = footer.querySelector('#foot-qr');
  const film = footer.querySelector('.foot-film');
  footer.querySelector('[data-foot-year]').textContent = new Date().getFullYear();

  function showQr(open) {
    qr.hidden = !open;
    wechatButton.setAttribute('aria-expanded', String(open));
  }
  wechat.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') showQr(true);
  });
  wechat.addEventListener('pointerleave', () => showQr(false));
  wechatButton.addEventListener('click', event => showQr(event.detail ? true : qr.hidden));
  wechat.addEventListener('focusout', event => {
    if (!wechat.contains(event.relatedTarget)) showQr(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !qr.hidden) showQr(false);
  }, {signal});

  footer.querySelector('[data-foot-video]').addEventListener('click', () => {
    film.showModal();
  });
  film.querySelector('button').addEventListener('click', () => film.close());
  film.addEventListener('click', event => {
    if (event.target === film) film.close();
  });
}
