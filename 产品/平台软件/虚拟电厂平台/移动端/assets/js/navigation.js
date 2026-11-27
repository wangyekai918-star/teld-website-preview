function mountNavigation(host, signal, mountDrawer) {
  'use strict';
  const base = host.dataset.base || '';
  const sourcePage = host.hasAttribute('data-source-home');
  if (sourcePage) {
    const updateScrollState = () => host.classList.toggle('tn-at-top', window.scrollY <= 0);
    updateScrollState();
    window.addEventListener('scroll', updateScrollState, {passive:true,signal});
  }
  const catalog = window.teldCatalog;
  const mouse = matchMedia('(hover: hover) and (pointer: fine)');
  const names = { products: '产品', solutions: '解决方案', partners: '合作', network: '充电网络', app: '手机专区', about: '关于特来电' };
  const entry = (label, description = '', artwork = '') =>
    '<a class="tn-entry" aria-disabled="true">' + artwork + '<span>' + label + '</span>' +
    (description ? '<small>' + description + '</small>' : '') + '</a>';
  const icon = shape => '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + shape + '</svg>';
  const avatar = '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="16" fill="#e6e9ed"/><circle cx="16" cy="12.5" r="5.4" fill="#7c8793"/><path d="M4 27a12.8 12.8 0 0 1 24 0 16 16 0 0 1-24 0Z" fill="#7c8793"/></svg>';
  const accountItems = [
    ['个人中心', '<circle cx="12" cy="8" r="3.4"/><path d="M5 20v-1a7 7 0 0 1 14 0v1"/>'],
    ['企业中心', '<path d="M4 20h16M6 20V5.5L15 3v17m0-12h4v12M9 8h2m-2 4h2m-2 4h2"/>'],
    ['退出登录', '<path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4m-1-8h12m-4-4 4 4-4 4"/>']
  ];
  const accountItemsHtml = accountItems.map(([label, shape], i) =>
    '<button type="button" ' + (mountDrawer ? 'class="tn-entry" ' : '') + (i === 2 ? 'data-sign-out' : 'disabled') + '>' + (mountDrawer ? '' : icon(shape)) + label + '</button>'
  ).join('');
  const categories = ['充电网设备', '平台软件'];
  const aboutLinks = ['企业简介','生态党建','企业文化','加入我们','企业资讯'].map(label => entry(label)).join('');
  function trigger([key, name]) {
    const label = '<span class="tn-tab-label">' + name + '</span>';
    const arrow = '<i aria-hidden="true"></i>';
    if (mountDrawer && key === 'about') {
      return '<button type="button" class="tn-first" data-about-toggle aria-controls="tn-about-fold" aria-expanded="false">' + label + arrow + '</button>' +
        '<div id="tn-about-fold" class="tn-about-fold tn-menu-fold" inert><div class="tn-about-links">' + aboutLinks + '</div></div>';
    }
    if (key === 'network' || key === 'app') {
      return '<a class="tn-first" aria-disabled="true">' + label + (mountDrawer ? arrow : '') + '</a>';
    }
    return '<button type="button" class="tn-first" data-menu="' + key + '" aria-expanded="false" aria-controls="tn-panel">' + label + arrow + '</button>';
  }
  const navItems = Object.entries(names).map(trigger).join('');
  host.querySelector('[data-nav-items]').insertAdjacentHTML('afterbegin', navItems);
  const panel = host.querySelector('.tn-panel');
  const drawer = host.querySelector('.tn-drawer');
  const scrim = host.querySelector('.tn-scrim');
  const toggle = host.querySelector('.tn-toggle');
  const mobileView = mountDrawer?.(host, signal);
  const familyOffsets = [0, 0];
  let active = '', family = 0, opener = null, timer, drawerOpen = false;

  const accountWrap = host.querySelector('.tn-account-wrap');
  const account = host.querySelector('[data-account]');
  const popover = host.querySelector('.tn-account-popover, [data-account-items]');
  popover.innerHTML = accountItemsHtml;
  const accountFold = host.querySelector('.tn-account-fold');
  const previewKey = 'teld.preview.signedIn';
  let signedIn = false;
  try { signedIn = sessionStorage.getItem(previewKey) === '1'; } catch {}

  function renderAccount() {
    popover.hidden = !mobileView;
    if (accountFold && account.getAttribute('aria-expanded') === 'true') mobileView.selectFold();
    if (accountFold) {
      account.classList.toggle('tn-first', signedIn);
      account.classList.toggle('tn-login-pill', !signedIn);
      if (signedIn) accountFold.before(account);
      else drawer.querySelector('.tn-menu-root').append(account);
    }
    account.classList.toggle('tn-profile', signedIn && !mobileView);
    if (signedIn) {
      const identity = mobileView ? '<span class="tn-tab-label">我的账号</span>' : avatar + '<span>小特</span>';
      account.innerHTML = identity + '<i aria-hidden="true"></i>';
      account.setAttribute('aria-label', mobileView ? '我的账号' : '小特，账号菜单');
      account.setAttribute('aria-controls', (accountFold || popover).id);
      account.setAttribute('aria-expanded', 'false');
    } else {
      account.textContent = '登录';
      account.setAttribute('aria-label', '登录');
      account.removeAttribute('aria-controls');
      account.removeAttribute('aria-expanded');
    }
  }

  function setSignedIn(value) {
    signedIn = value;
    try {
      if (value) sessionStorage.setItem(previewKey, '1');
      else sessionStorage.removeItem(previewKey);
    } catch {}
    renderAccount();
  }

  function showAccount(show) {
    if (!signedIn) return;
    if (accountFold) {
      if (show || account.getAttribute('aria-expanded') === 'true') mobileView.selectFold(show ? account : null);
      return;
    }
    if (show && (active || drawerOpen)) closeAll();
    popover.hidden = !show;
    account.setAttribute('aria-expanded', String(show));
  }

  renderAccount();
  if (!mobileView) {
    accountWrap.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse' && mouse.matches) showAccount(true);
    }, {signal});
    accountWrap.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse' && !popover.contains(document.activeElement)) showAccount(false);
    }, {signal});
    accountWrap.addEventListener('focusout', e => {
      if (!accountWrap.contains(e.relatedTarget)) showAccount(false);
    }, {signal});
    document.addEventListener('pointerdown', e => {
      if (!popover.hidden && !accountWrap.contains(e.target)) showAccount(false);
    }, {signal});
  }

  const art = window.teldNavigationArt;
  const huaweiPlaceholders = new Set(art.huaweiPlaceholders);
  const sourceDot = file => huaweiPlaceholders.has(file)
    ? '<span class="tn-source-dot" role="img" aria-label="华为占位图" title="华为占位图"></span>' : '';
  const cardArt = new Map([...art.hw,...art.sw]);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const motion = new WeakMap();
  function animate(el, frames, duration, finish, delay = 0) {
    motion.get(el)?.cancel();
    motion.delete(el);
    if (reduce.matches) { finish?.(); return; }
    const animation = el.animate(frames,{duration,delay,fill:finish ? 'both' : 'backwards',easing:'cubic-bezier(.4,0,.6,1)'});
    motion.set(el,animation);
    animation.onfinish = () => {
      if (motion.get(el) !== animation) return;
      motion.delete(el);
      finish?.();
      animation.cancel();
    };
  }
  const groupNames = catalog.groups.map(([title]) => title);
  const productPages = new Map([
    ["products/g3-80", "../../../充电网设备/一体式直流/G3-80kW/index.html"],
    ["products/solar-storage", "../../光储充放一体化平台/index.html"],
    ["products/vpp", "../index.html"]
  ]);
  function modelCard(name) {
    const file = cardArt.get(name);
    const badge = name === '充电运营平台' ? '<small class="tn-demo">演示产品</small>' : '';
    const productUrl = productPages.get(file);
    const link = productUrl ? 'href="' + productUrl + '"' : 'aria-disabled="true"';
    return '<a class="tn-model" '+link+'><div class="tn-picture"><img src="'+base+'assets/nav-photos/'+file+'.webp" alt="">'+sourceDot(file)+badge+'</div>'+
      '<span class="tn-caption"><strong>'+name+'</strong></span></a>';
  }
  function productContent() {
    if (family === 1) {
      return '<div class="tn-cards">'+catalog.platforms.map(modelCard).join('')+'</div>';
    }
    return '<div class="tn-equipment-groups">'+catalog.groups.map(([title, items], i) =>
      '<section class="tn-equipment-group" aria-labelledby="tn-group-'+i+'">'+
        '<h2 id="tn-group-'+i+'" data-group-start="'+i+'">'+title+'</h2>'+
        '<div class="tn-cards">'+items.map(modelCard).join('')+'</div>'+
      '</section>'
    ).join('')+'</div>';
  }
  function directoryCard(name, desc, iconName) {
    const artwork = '<svg class="tn-solution-icon" aria-hidden="true" focusable="false"><use href="#'+iconName+'"></use></svg>';
    return entry(name, desc, artwork);
  }
  function solutionContent() {
    return '<div class="tn-directory">' + catalog.solutions.map(([name, desc, iconName], i) => {
      if ((i < 6) === Boolean(family)) return '';
      return directoryCard(name, desc, iconName);
    }).join('') + '</div>';
  }
  function content() {
    if (active === 'products') return productContent();
    if (active === 'solutions') return solutionContent();
    if (active === 'partners') {
      return art.coop.map(({name, items}) => {
        const cards = items.map(([label, desc, iconName]) => directoryCard(label, desc, iconName));
        return '<section class="tn-partner-group"><h3>'+name+'</h3><div class="tn-partner-cards">'+cards.join('')+'</div></section>';
      }).join('');
    }
    return '<nav class="tn-about-links" aria-label="关于特来电">' +
      aboutLinks + '</nav>';
  }
  let refreshDirectory;
  function drawPanel() {
    refreshDirectory = null;
    const title=names[active];
    panel.dataset.kind=active;
    panel.setAttribute('aria-label',title);
    const grouped = active === 'products' || active === 'solutions';
    if (grouped) {
      const hasDirectory = !mobileView && active === 'products' && family === 0;
      const directory = hasDirectory ? '<nav class="tn-index" aria-label="设备目录">'+groupNames.map((name,i) =>
        '<button type="button" data-index="'+i+'" aria-controls="tn-group-'+i+'" aria-current="'+(i===0?'location':'false')+'">'+name+'</button>'
      ).join('')+'</nav>' : '';
      const tabs = categories.map((name,i) =>
        '<button type="button" data-family="'+i+'" aria-pressed="'+(i===family)+'"><span class="tn-tab-label">'+name+'</span></button>'
      ).join('');
      const picker = hasDirectory ? '<label class="tn-group-select"><select aria-label="跳转至设备目录">'+groupNames.map((name,i) =>
        '<option value="'+i+'">'+name+'</option>'
      ).join('')+'</select></label>' : '';
      panel.innerHTML='<div class="tn-mega"><div class="tn-rail"><div class="tn-families" aria-label="'+title+'分类">'+tabs+'</div>'+picker+'</div>'+
        '<div id="tn-catalog" class="tn-main" tabindex="0" aria-label="'+categories[family]+'目录">'+content()+'</div>'+directory+'</div>';
      if (hasDirectory) refreshDirectory = bindDirectory();
    } else {
      panel.innerHTML='<div class="tn-flat">'+content()+'</div>';
    }
    if (mobileView) {
      mobileView.setHeading(title);
    } else {
      panel.insertAdjacentHTML('afterbegin','<button type="button" class="tn-dismiss" aria-label="返回主导航"><i aria-hidden="true"></i>'+title+'</button>');
    }
    if (!mobileView && (grouped || active === 'partners')) {
      panel.insertAdjacentHTML('afterbegin','<button type="button" class="tn-panel-close" aria-label="关闭'+title+'菜单">'+icon('<path d="m5 5 14 14M19 5 5 19"/>')+'</button>');
    }
  }
  function revealSurface(el, from, open) {
    motion.get(el)?.cancel();
    el.hidden = false;
    el.inert = !open;
    const to = open ? el.getBoundingClientRect().height : 0;
    if (open && Math.abs(to - from) < 0.5) return;
    animate(el, [
      {height:from+'px',overflow:'hidden'},
      {height:to+'px',overflow:'hidden'}
    ], open ? 252 : 210, () => {
      el.hidden = el.inert;
    });
  }
  function revealItems(items) {
    Array.from(items).slice(0,18).forEach((el,i) => {
      animate(el,[{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],
        224,undefined,56 + Math.min(i,7)*14);
    });
  }
  function sync(previousHeight = panel.getBoundingClientRect().height) {
    const wasOpen = !panel.hidden && !panel.inert;
    host.querySelectorAll('[data-menu]').forEach(b=>b.setAttribute('aria-expanded',String(b.dataset.menu===active)));
    if (mobileView) {
      mobileView.update(drawerOpen, active);
    } else if (active) {
      revealSurface(panel, previousHeight, true);
    } else if (wasOpen) {
      revealSurface(panel, previousHeight, false);
    }
    if (scrim) scrim.inert = !active && !drawerOpen;
    toggle?.setAttribute('aria-expanded',String(drawerOpen || !!active));
    toggle?.setAttribute('aria-label',drawerOpen || active ? '关闭导航' : '打开导航');
  }
  function closeAll(restore = false) {
    clearTimeout(timer);
    const previous = opener;
    active=''; drawerOpen=false; opener=null;
    if (accountFold) showAccount(false);
    sync();
    if (restore) (drawer && previous?.closest('.tn-drawer') ? toggle : previous)?.focus();
  }
  function openMenu(key, button) {
    clearTimeout(timer);
    showAccount(false);
    if (active === key) return;
    if (mobileView) { drawerOpen = true; familyOffsets.fill(0); }
    const previousHeight = panel.getBoundingClientRect().height;
    active=key; family=0; opener=button;
    drawPanel(); sync(previousHeight);
    panel.scrollTop=0;
    if (mobileView) return;
    revealItems(panel.querySelectorAll('.tn-index button'));
    revealItems(panel.querySelectorAll('.tn-families button,.tn-main h2,.tn-model,.tn-entry'));

  }
  function selectFamily(button, focus) {
    const next=Number(button.dataset.family);
    if (next === family) return;
    const previousHeight = panel.getBoundingClientRect().height;
    const gallery = panel.querySelector('.tn-main');
    if (mobileView) familyOffsets[family] = gallery.scrollTop;
    family=next;
    panel.querySelectorAll('[data-family]').forEach(tab => {
      tab.setAttribute('aria-pressed', String(tab === button));
    });
    gallery.innerHTML = content();
    gallery.setAttribute('aria-label', categories[next]+'目录');
    gallery.scrollTop = 0;
    if (refreshDirectory) {
      panel.querySelector('.tn-group-select').hidden = next !== 0;
      panel.querySelector('.tn-index').hidden = next !== 0;
      refreshDirectory();
    }
    if (mobileView) gallery.scrollTop = familyOffsets[next];
    else revealSurface(panel, previousHeight, true);
    if (focus) button.focus({preventScroll:true});
  }
  function bindDirectory() {
    const gallery = panel.querySelector('.tn-main');
    let starts = [...gallery.querySelectorAll('[data-group-start]')];
    const buttons = [...panel.querySelectorAll('[data-index]')];
    const picker = panel.querySelector('.tn-group-select select');
    let anchorPosition = null;
    function mark(index) {
      buttons.forEach((button,i) => button.setAttribute('aria-current', i === index ? 'location' : 'false'));
      picker.value = String(index);
    }
    function jump(index) {
      const offset = starts[index].getBoundingClientRect().top - gallery.getBoundingClientRect().top;
      gallery.scrollTop = index === 0 ? 0 : gallery.scrollTop + offset;
      anchorPosition = gallery.scrollTop;
      mark(index);
    }
    buttons.forEach((button,i) => button.addEventListener('click', () => jump(i)));
    picker.addEventListener('change', () => jump(Number(picker.value)));
    gallery.addEventListener('scroll', () => {
      if (!starts.length) return;
      if (anchorPosition !== null && Math.abs(gallery.scrollTop - anchorPosition) < 1) return;
      anchorPosition = null;
      const top = gallery.getBoundingClientRect().top + 6;
      let index = 0;
      starts.forEach((item,i) => { if (item.getBoundingClientRect().top <= top) index = i; });
      if (gallery.scrollTop > 0 && gallery.scrollTop + gallery.clientHeight >= gallery.scrollHeight - 2) index = starts.length-1;
      mark(index);
    }, {passive:true});
    return () => {
      starts = [...gallery.querySelectorAll('[data-group-start]')];
      anchorPosition = null;
      mark(0);
    };
  }
  const bar = host.querySelector('.tn-bar');
  bar.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse') bar.classList.add('tn-mouse-inside');
  }, {signal});
  bar.addEventListener('pointerleave', () => bar.classList.remove('tn-mouse-inside'), {signal});
  host.addEventListener('pointerover', e => {
    if (drawer || !mouse.matches || e.pointerType === 'touch' || e.target === scrim) return;
    clearTimeout(timer);
    const b=e.target.closest('[data-menu]');
    if (b) openMenu(b.dataset.menu,b);
    else if (e.target.closest('.tn-first,.tn-logo')) closeAll();
  });
  host.addEventListener('pointerout', e => {
    if (drawer || !mouse.matches || !active) return;
    if (!host.contains(e.relatedTarget) || e.relatedTarget === scrim) {
      clearTimeout(timer); timer=setTimeout(()=>{if(!panel.contains(document.activeElement))closeAll();},140);
    }
  });
  host.addEventListener('click', e => {
    const b=e.target.closest('button,a'); if(!b)return;
    if (b === account) {
      if (!signedIn) {
        if (!mobileView) closeAll();
        setSignedIn(true);
        if (mobileView) account.focus({preventScroll:true});
      } else if (accountFold) {
        mobileView.toggleFold(account);
      } else {
        showAccount(e.pointerType === 'mouse' && mouse.matches ? true : popover.hidden);
      }
    } else if (b.hasAttribute('data-sign-out')) {
      setSignedIn(false);
      account.focus({preventScroll:true});
    } else if (b === toggle) {
      showAccount(false);
      if(drawerOpen || active) closeAll();
      else { drawerOpen=true; opener=b; sync(); }
    } else if (b === scrim) closeAll(true);
    else if (b.matches('.tn-panel-close')) closeAll(true);
    else if (b.matches('.tn-dismiss') && drawer && drawerOpen) {
      const last=opener; active=''; sync(); last?.focus({preventScroll:true});
    } else if (b.matches('.tn-dismiss')) closeAll(true);
    else if (b.dataset.menu) {
      if(drawer && active===b.dataset.menu) {active='';sync();}
      else openMenu(b.dataset.menu,b);
    }
    else if (b.hasAttribute('data-family')) selectFamily(b,true);
    else if (b.matches('a[href]')) closeAll();
  });
  document.addEventListener('keydown',e => {
    if (e.key === 'Escape' && account.getAttribute('aria-expanded') === 'true') {
      e.preventDefault();
      showAccount(false);
      account.focus({preventScroll:true});
    } else if (e.key === 'Escape' && mobileView && active) {
      e.preventDefault();
      host.querySelector('.tn-dismiss').click();
    } else if (e.key === 'Escape' && (active || drawerOpen)) {e.preventDefault();closeAll(true);}
    else if (panel.contains(e.target) && e.target.hasAttribute('data-family') && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      e.preventDefault();
      const count = categories.length;
      const step = ['ArrowDown','ArrowRight'].includes(e.key) ? 1 : -1;
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? count - 1 : (family + step + count) % count;
      selectFamily(panel.querySelector('[data-family="'+next+'"]'),true);
    }
    else if (e.key === 'ArrowDown' && host.contains(e.target) && e.target.dataset.menu) {
      e.preventDefault();openMenu(e.target.dataset.menu,e.target);
      panel.querySelector('[data-family],.tn-entry')?.focus();
    }
  },{signal});
  host.addEventListener('focusout',e=>{if(e.relatedTarget && !host.contains(e.relatedTarget))closeAll();});
  sync();
  const preview=new URLSearchParams(location.search).get('menu');
  if (!location.hash && ['products','solutions','partners','about'].includes(preview)) {
    drawerOpen = Boolean(drawer);
    const menu = host.querySelector(drawerOpen ? '.tn-drawer' : '.tn-desktop');
    if (mobileView && preview === 'about') {
      opener = toggle;
      sync();
      menu.querySelector('[data-about-toggle]').click();
    } else {
      openMenu(preview,menu.querySelector('[data-menu="'+preview+'"]'));
    }
  }
  signal.addEventListener('abort', () => clearTimeout(timer), {once:true});
}
