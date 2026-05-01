(function () {
  const roleKey = 'USER_ROLE';

  function go(path) {
    window.parent.location.href = path;
  }

  function textOf(element) {
    return (element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function mark(element, action) {
    element.dataset.stitchAction = action;
  }

  function readInputValue(selector) {
    const input = document.querySelector(selector);
    return input instanceof HTMLInputElement ? input.value.trim() : '';
  }

  function currentRegisterRole() {
    const enterpriseTab = document.getElementById('enterprise-tab');
    return enterpriseTab?.getAttribute('aria-selected') === 'true' ? 'COMPANY' : 'USER';
  }

  function accountLabel(role) {
    return role === 'COMPANY' ? '企业账号' : '个人账号';
  }

  function storeRole(role) {
    localStorage.setItem(roleKey, role);
    document.cookie = roleKey + '=' + role + '; path=/';
  }

  function currentPageName() {
    const path = window.parent.location.pathname;
    if (path === '/') return 'home';
    if (path.includes('/login')) return 'login';
    if (path.includes('/register')) return 'register';
    if (path.includes('/enterprise-center')) return 'enterprise';
    if (path.includes('/personal-center/work-experience')) return 'work';
    if (path.includes('/personal-center')) return 'personal';
    return 'default';
  }

  function clearFormValues(root = document) {
    root.querySelectorAll('input').forEach((input) => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else if (input.type !== 'hidden') {
        input.value = '';
      }
    });
    root.querySelectorAll('textarea').forEach((textarea) => {
      textarea.value = '';
      textarea.textContent = '';
    });
    root.querySelectorAll('select').forEach((select) => {
      select.selectedIndex = -1;
    });
  }

  function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = text;
    }
  }

  function replaceTextContent(search, replacement) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }
    nodes.forEach((node) => {
      if (node.textContent && node.textContent.includes(search)) {
        node.textContent = node.textContent.replaceAll(search, replacement);
      }
    });
  }

  async function postJson(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.message || '请求失败，请稍后重试。');
    }
    return payload;
  }

  function renderSharedHeader() {
    const originalHeader = document.querySelector('body > header, body > nav');
    if (!originalHeader) {
      return;
    }

    const path = window.parent.location.pathname;
    const pageName = currentPageName();
    if (pageName === 'register') {
      document.body.classList.add('stitch-page-register-original');
    } else {
      document.body.classList.add('stitch-page', `stitch-page-${pageName}`);
    }

    if (!document.getElementById('stitch-global-header-style')) {
      const style = document.createElement('style');
      style.id = 'stitch-global-header-style';
      style.textContent = `
        body.stitch-page {
          min-width: 320px;
          background:
            linear-gradient(120deg, rgba(255, 255, 255, 0.92), rgba(236, 244, 247, 0.82)),
            radial-gradient(circle at 16% 18%, rgba(19, 95, 131, 0.10), transparent 28%),
            #eef3f8 !important;
          color: #17202a !important;
          font-family: 'Inter', 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
        }
        body.stitch-page::before {
          position: fixed;
          inset: 64px 0 0;
          z-index: -1;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(18, 53, 91, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(18, 53, 91, 0.045) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.65), transparent 75%);
          content: "";
        }
        body.stitch-page h1,
        body.stitch-page h2,
        body.stitch-page h3 {
          color: #12263d !important;
          letter-spacing: 0 !important;
        }
        body.stitch-page input,
        body.stitch-page textarea,
        body.stitch-page select {
          border-color: #c9d6e2 !important;
          border-radius: 6px !important;
          background: #ffffff !important;
          color: #17202a !important;
          box-shadow: none !important;
        }
        body.stitch-page input:focus,
        body.stitch-page textarea:focus,
        body.stitch-page select:focus {
          border-color: #1e6f94 !important;
          box-shadow: 0 0 0 3px rgba(30, 111, 148, 0.14) !important;
          outline: none !important;
        }
        body.stitch-page-login #remember {
          width: 16px !important;
          height: 16px !important;
          padding: 0 !important;
          border: 1px solid #757684 !important;
          border-radius: 4px !important;
          background: #ffffff !important;
          accent-color: #00288e;
          appearance: auto !important;
          -webkit-appearance: checkbox !important;
          cursor: pointer;
        }
        body.stitch-page-login #remember:checked {
          border-color: #00288e !important;
          background-color: #00288e !important;
        }
        body.stitch-page-login label[for="remember"] {
          cursor: pointer;
          user-select: none;
        }
        body.stitch-page main button:not(.material-symbols-outlined),
        body.stitch-page main a[data-stitch-action] {
          border-radius: 6px !important;
          font-weight: 700 !important;
          letter-spacing: 0 !important;
        }
        body.stitch-page main button[data-stitch-action="login"],
        body.stitch-page main button[data-stitch-action="register-submit"],
        body.stitch-page main button[data-stitch-action="save"],
        body.stitch-page main button[data-stitch-action="send-code"] {
          border: 1px solid #135f83 !important;
          background: #135f83 !important;
          color: #fff !important;
          box-shadow: 0 10px 22px rgba(19, 95, 131, 0.18) !important;
        }
        body.stitch-page main button[data-stitch-action="cancel"],
        body.stitch-page main button[data-stitch-action="register-tab"],
        body.stitch-page main button[data-stitch-action="upload"],
        body.stitch-page main button[data-stitch-action="edit"],
        body.stitch-page main button[data-stitch-action="delete"] {
          border: 1px solid #c9d6e2 !important;
          background: #fff !important;
          color: #263548 !important;
          box-shadow: none !important;
        }
        body.stitch-page-login > div.fixed.inset-0.overflow-hidden {
          display: none !important;
        }
        body.stitch-page-login main,
        body.stitch-page-register main {
          min-height: calc(100vh - 64px) !important;
          padding: 112px 24px 48px !important;
        }
        body.stitch-page-login main {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        body.stitch-page-login main > div {
          width: min(460px, 100%) !important;
          max-width: 460px !important;
        }
        body.stitch-page-login main .bg-surface-container-lowest,
        body.stitch-page-register main .bg-surface-container-lowest,
        body.stitch-page-register main form {
          border: 1px solid #d9e3ec !important;
          border-radius: 8px !important;
          background: rgba(255, 255, 255, 0.96) !important;
          box-shadow: 0 24px 70px rgba(30, 52, 73, 0.14) !important;
        }
        body.stitch-page-login main .bg-surface-container-lowest {
          position: relative;
          overflow: hidden;
          padding: 34px !important;
        }
        body.stitch-page-login main .bg-surface-container-lowest::before,
        body.stitch-page-register main form::before {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 5px;
          background: linear-gradient(90deg, #135f83, #88a33e, #d0a344);
          content: "";
        }
        body.stitch-page-login footer {
          border-color: #d9e3ec !important;
          background: transparent !important;
        }
        body.stitch-page-register main > div.grid {
          max-width: 1120px !important;
          gap: 0 !important;
          overflow: hidden;
          border: 1px solid #d9e3ec;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 24px 70px rgba(30, 52, 73, 0.14);
        }
        body.stitch-page-register main > div.grid > div:first-child {
          min-height: 100%;
          padding: 48px !important;
          background: linear-gradient(180deg, rgba(18, 53, 91, 0.96), rgba(18, 77, 101, 0.95)) !important;
        }
        body.stitch-page-register main > div.grid > div:first-child h2,
        body.stitch-page-register main > div.grid > div:first-child p,
        body.stitch-page-register main > div.grid > div:first-child span,
        body.stitch-page-register main > div.grid > div:first-child h4 {
          color: #fff !important;
        }
        body.stitch-page-register main form {
          position: relative;
          overflow: hidden;
          padding: 34px !important;
          box-shadow: none !important;
        }
        body.stitch-page-register #personal-tab[aria-selected="true"],
        body.stitch-page-register #enterprise-tab[aria-selected="true"] {
          background: #e8f3f7 !important;
          color: #135f83 !important;
        }
        body.stitch-page-home main,
        body.stitch-page-enterprise main,
        body.stitch-page-personal main,
        body.stitch-page-work main {
          padding-top: 96px !important;
        }
        body.stitch-page-home main {
          position: relative;
          z-index: 1;
        }
        body.stitch-page-home aside.fixed.right-6 {
          z-index: 4 !important;
          pointer-events: auto;
        }
        @media (min-width: 1280px) {
          body.stitch-page-home main {
            padding-right: 320px !important;
          }
        }
        body.stitch-page-enterprise aside,
        body.stitch-page-personal aside,
        body.stitch-page-work aside {
          border-color: #d9e3ec !important;
          background: #ffffff !important;
          box-shadow: 0 18px 50px rgba(30, 52, 73, 0.10) !important;
        }
        body.stitch-page-enterprise section,
        body.stitch-page-personal section,
        body.stitch-page-work section,
        body.stitch-page-enterprise .bg-white,
        body.stitch-page-personal .bg-white,
        body.stitch-page-work .bg-white {
          border-color: #d9e3ec !important;
          border-radius: 8px !important;
          box-shadow: 0 14px 36px rgba(42, 58, 78, 0.08) !important;
        }
        .stitch-global-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9990;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 0 24px;
          background: rgba(255, 255, 255, 0.96);
          border-bottom: 1px solid #d9e3ec;
          box-shadow: 0 10px 30px rgba(31, 49, 68, 0.08);
          backdrop-filter: blur(16px);
          font-family: 'Inter', 'Noto Sans SC', sans-serif;
        }
        .stitch-global-brand,
        .stitch-global-nav,
        .stitch-global-actions {
          display: flex;
          align-items: center;
        }
        .stitch-global-brand {
          min-width: 0;
          gap: 10px;
          color: #12355b;
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
        }
        .stitch-global-brand img {
          width: 34px;
          height: 34px;
          object-fit: contain;
        }
        .stitch-global-nav {
          flex: 1;
          justify-content: center;
          gap: 8px;
        }
        .stitch-global-nav button,
        .stitch-global-actions button {
          min-height: 38px;
          border: 0;
          border-radius: 6px;
          padding: 0 13px;
          background: transparent;
          color: #4b5e72;
          font: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }
        .stitch-global-nav button:hover,
        .stitch-global-actions button:hover {
          background: #eef5f8;
          color: #135f83;
        }
        .stitch-global-nav button.is-active {
          color: #135f83;
          background: #e8f3f7;
        }
        .stitch-global-actions {
          gap: 8px;
        }
        .stitch-global-actions .is-primary {
          color: #fff;
          background: #135f83;
          box-shadow: 0 8px 18px rgba(19, 95, 131, 0.2);
        }
        .stitch-global-actions .is-primary:hover {
          color: #fff;
          background: #0f516f;
        }
        @media (max-width: 900px) {
          .stitch-global-header {
            height: auto;
            min-height: 64px;
            align-items: flex-start;
            flex-direction: column;
            padding: 12px 16px;
          }
          .stitch-global-brand {
            white-space: normal;
          }
          .stitch-global-nav {
            width: 100%;
            justify-content: flex-start;
            overflow-x: auto;
          }
          .stitch-global-actions {
            position: absolute;
            top: 12px;
            right: 16px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const isLoggedIn = Boolean(localStorage.getItem(roleKey));
    const navItems = [
      { label: '首页', action: 'home', active: path === '/' },
      { label: '招聘信息', action: 'recruitments', active: path.startsWith('/recruitments') },
      { label: '人才信息', action: 'personal-center', active: path.startsWith('/personal-center') },
      { label: '企业中心', action: 'enterprise-center', active: path.startsWith('/enterprise-center') }
    ];
    let actionItems = [{ label: '退出登录', action: 'logout', primary: false }];
    if (!isLoggedIn && path === '/login') {
      actionItems = [{ label: '注册', action: 'register', primary: true }];
    } else if (!isLoggedIn && path === '/register') {
      actionItems = [{ label: '立即登录', action: 'login', primary: true }];
    } else if (!isLoggedIn) {
      actionItems = [
        { label: '注册', action: 'register', primary: false },
        { label: '登录', action: 'login', primary: true }
      ];
    }

    const header = document.createElement('header');
    header.className = 'stitch-global-header';
    header.innerHTML = `
      <div class="stitch-global-brand">
        <img alt="全国项目管理标准化技术委员会 - 人才库 Logo" src="/assets/logo.png" />
        <span>全国项目管理标准化技术委员会 - 人才库</span>
      </div>
      <nav class="stitch-global-nav" aria-label="主要导航">
        ${navItems.map((item) => `
          <button type="button" class="${item.active ? 'is-active' : ''}" data-stitch-action="${item.action}">
            ${item.label}
          </button>
        `).join('')}
      </nav>
      <div class="stitch-global-actions">
        ${actionItems.map((item) => `
          <button type="button" class="${item.primary ? 'is-primary' : ''}" data-stitch-action="${item.action}">
            ${item.label}
          </button>
        `).join('')}
      </div>
    `;

    originalHeader.replaceWith(header);
  }

  function renderBlankBusinessState() {
    const path = window.parent.location.pathname;
    const isPersonalPage = path === '/personal-center';
    const isEnterprisePage = path === '/enterprise-center';
    const isWorkPage = path === '/personal-center/work-experience';

    if (!isPersonalPage && !isEnterprisePage && !isWorkPage) {
      return;
    }

    clearFormValues();

    if (isPersonalPage) {
      setText('aside h3, aside h2', '个人资料');
      setText('aside p', '资料待完善');
      setText('main h2.text-h2, main h2.font-h2', '待完善个人信息');
      const profileSummary = Array.from(document.querySelectorAll('main p')).find((item) => textOf(item).includes('中国, 上海'));
      if (profileSummary) {
        profileSummary.textContent = '请补充所在城市、所在行业与求职意向';
      }
      document.querySelectorAll('main img[src^="http"]').forEach((image) => {
        image.setAttribute('src', '/assets/logo.png');
      });
      document.querySelectorAll('section span').forEach((item) => {
        const text = textOf(item);
        if (['设计系统', '用户研究', '团队领导力', '战略思维'].includes(text)) {
          item.remove();
        }
      });
      replaceTextContent('Chen Wei (陈伟)', '待完善个人信息');
      replaceTextContent('Chen Wei', '');
      replaceTextContent('高级产品设计师', '');
      replaceTextContent('拥有超过8年领导世界500强科技公司跨学科设计团队的经验。精通设计系统、用户研究和数据驱动的设计优化。曾为企业级SaaS产品实现转化率提升25%的优异战绩。具备出色的干系人管理和双语沟通能力。', '');
    }

    if (isEnterprisePage) {
      setText('aside p.text-lg, aside h3, aside h2', '企业资料');
      setText('aside p.text-xs', '资料待完善');
      const headerDescription = Array.from(document.querySelectorAll('main p')).find((item) => textOf(item).includes('管理环球科技集团'));
      if (headerDescription) {
        headerDescription.textContent = '请维护企业基础信息、联系方式与合作备注。';
      }
      document.querySelectorAll('main img[src^="http"], aside img[src^="http"]').forEach((image) => {
        image.setAttribute('src', '/assets/logo.png');
      });
      replaceTextContent('环球科技集团', '企业资料待完善');
      replaceTextContent('Sarah Jenkins', '未分配负责人');
      replaceTextContent('Sarah J.', '未分配负责人');
      replaceTextContent('2023年10月24日', '尚未保存');
      replaceTextContent('加利福尼亚州 旧金山', '');
      replaceTextContent('San Francisco', '');
      replaceTextContent('contact@globaltech.com', '');
      replaceTextContent('https://www.globaltech.com', '');
      replaceTextContent('加利福尼亚州 硅谷 创新大道101号', '');
    }

    if (isWorkPage) {
      setText('aside h2, aside h3', '个人资料');
      setText('aside p', '资料待完善');
      const grid = document.querySelector('main .grid.grid-cols-12');
      if (grid) {
        Array.from(grid.children).forEach((child) => {
          const text = textOf(child);
          if (!text.includes('点击此处添加职业生涯中的其他经历')) {
            child.remove();
          }
        });
        if (!document.getElementById('experience-empty')) {
          const empty = document.createElement('div');
          empty.id = 'experience-empty';
          empty.className = 'col-span-12 bg-white border border-slate-200 rounded-xl p-8 text-slate-500';
          empty.innerHTML = '<p class="font-label-md text-label-md text-on-background">暂无工作经历</p><p class="text-sm text-on-surface-variant mt-2">请点击下方入口添加您的第一段工作经历。</p>';
          grid.prepend(empty);
        }
      }
      document.querySelectorAll('body > div.fixed.bottom-8').forEach((item) => item.remove());
      replaceTextContent('Global Tech Corp', '个人资料');
      replaceTextContent('高级产品架构师', '');
      replaceTextContent('主导软件工程师', '');
      replaceTextContent('后端开发工程师', '');
      replaceTextContent('领导企业级 全国项目管理标准化技术委员会 - 人才库招聘平台的架构设计。成功扩展基础设施以支持超过 200 万月度活跃用户，同时通过战略性云原生优化将延迟降低了 40%。', '');
    }
  }

  function toast(message) {
    let panel = document.getElementById('stitch-toast');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'stitch-toast';
      panel.className = 'fixed bottom-6 right-6 z-[9999] rounded bg-primary px-5 py-3 text-white shadow-lg font-semibold text-sm';
      document.body.appendChild(panel);
    }
    panel.textContent = message;
    panel.classList.remove('hidden');
    window.clearTimeout(window.__stitchToastTimer);
    window.__stitchToastTimer = window.setTimeout(() => panel.classList.add('hidden'), 1800);
  }

  function openPanel(title, description, actions = []) {
    let panel = document.getElementById('stitch-action-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'stitch-action-panel';
      panel.className = 'fixed inset-0 z-[9998] flex items-center justify-center bg-slate-900/30 px-4';
      document.body.appendChild(panel);
    }
    const actionButtons = actions.map((action) => `
      <button type="button" class="rounded border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700" data-panel-action="${action.action}">
        ${action.label}
      </button>
    `).join('');
    panel.innerHTML = `
      <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-[#135f83]">功能面板</p>
            <h2 class="mt-2 text-xl font-bold text-[#12263d]">${title}</h2>
          </div>
          <button type="button" class="rounded border border-slate-200 px-3 py-1 text-sm font-bold text-slate-500" data-panel-close>关闭</button>
        </div>
        <p class="mt-4 text-sm leading-6 text-slate-600">${description}</p>
        <div class="mt-6 flex flex-wrap justify-end gap-2">
          ${actionButtons}
        </div>
      </div>
    `;
    panel.querySelector('[data-panel-close]')?.addEventListener('click', () => panel.remove());
    panel.querySelectorAll('[data-panel-action]').forEach((button) => {
      button.addEventListener('click', () => {
        runAction(button.getAttribute('data-panel-action'), button);
        panel.remove();
      });
    });
  }

  function saveCurrentPageDraft() {
    const path = window.parent.location.pathname;
    const fields = {};
    document.querySelectorAll('input, textarea, select').forEach((field) => {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
        return;
      }
      const key = field.id || field.name || field.closest('label')?.textContent?.trim() || field.getAttribute('placeholder') || `field-${Object.keys(fields).length}`;
      if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
        fields[key] = field.checked;
      } else {
        fields[key] = field.value;
      }
    });
    localStorage.setItem(`PROFILE_DRAFT:${path}`, JSON.stringify(fields));
    toast('保存成功，资料已写入当前账号草稿');
  }

  async function completeLogin() {
    const username = readInputValue('#username');
    const password = readInputValue('#password');

    if (!username) {
      toast('请输入用户名');
      return;
    }
    if (!password) {
      toast('请输入密码');
      return;
    }

    try {
      const result = await postJson('/api/auth/login', { username, password });
      storeRole(result.role);
      toast('验证通过，正在进入' + accountLabel(result.role));
      window.setTimeout(() => go(result.role === 'ADMIN' ? '/recruitments' : result.role === 'COMPANY' ? '/enterprise-center' : '/personal-center'), 260);
    } catch (error) {
      toast(error instanceof Error ? error.message : '登录失败，请稍后重试。');
    }
  }

  function captchaElements() {
    const modal = document.getElementById('captcha-modal');
    const slider = modal?.querySelector('.cursor-pointer');
    const bar = slider?.parentElement;
    const piece = modal?.querySelector('.z-10');
    const slot = modal?.querySelector('.shadow-inner');
    const label = bar?.querySelector('.select-none');
    const puzzleArea = modal?.querySelector('.aspect-\\[4\\/3\\]');

    return {
      modal,
      slider: slider instanceof HTMLElement ? slider : null,
      bar: bar instanceof HTMLElement ? bar : null,
      piece: piece instanceof HTMLElement ? piece : null,
      slot: slot instanceof HTMLElement ? slot : null,
      label: label instanceof HTMLElement ? label : null,
      puzzleArea: puzzleArea instanceof HTMLElement ? puzzleArea : null
    };
  }

  function resetCaptchaSlider() {
    const { slider, bar, piece, label } = captchaElements();
    if (!slider || !bar) {
      return;
    }

    slider.dataset.captchaPassed = 'false';
    slider.style.transform = 'translateX(0px)';
    slider.setAttribute('aria-valuenow', '0');
    slider.classList.remove('bg-green-600');
    slider.classList.add('bg-primary');
    bar.dataset.captchaPassed = 'false';
    if (piece) {
      piece.style.transform = 'translateX(0px)';
    }
    if (label) {
      label.textContent = '按住滑块拖动';
      label.classList.remove('text-green-700');
    }
  }

  function verifyCaptchaFromDrag(finalOffset, maxOffset, targetOffset) {
    const { slider, bar, piece, label } = captchaElements();
    const tolerance = Math.max(14, maxOffset * 0.08);
    const passed = maxOffset > 0 && Math.abs(finalOffset - targetOffset) <= tolerance;
    if (!slider || !bar || !label) {
      return;
    }

    if (!passed) {
      resetCaptchaSlider();
      toast('请将拼图块拖到图片缺口位置');
      return;
    }

    slider.dataset.captchaPassed = 'true';
    slider.style.transform = `translateX(${targetOffset}px)`;
    slider.setAttribute('aria-valuenow', '100');
    slider.classList.remove('bg-primary');
    slider.classList.add('bg-green-600');
    bar.dataset.captchaPassed = 'true';
    if (piece) {
      piece.style.transform = `translateX(${piece.dataset.captchaTargetOffset || '0'}px)`;
    }
    label.textContent = '验证通过';
    label.classList.add('text-green-700');
    window.setTimeout(() => completeLogin(), 180);
  }

  function setupCaptchaSlider() {
    const { slider, bar, piece, slot, label, puzzleArea } = captchaElements();
    if (!slider || !bar || slider.dataset.captchaBound === 'true') {
      return;
    }

    mark(slider, 'captcha-slider');
    slider.dataset.captchaBound = 'true';
    slider.dataset.captchaPassed = 'false';
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-label', '拖动滑块完成拼图验证');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', '0');
    slider.setAttribute('tabindex', '0');
    slider.style.touchAction = 'none';
    slider.style.userSelect = 'none';

    let dragging = false;
    let startX = 0;
    let currentOffset = 0;
    let activePointerId = null;

    const maxOffset = () => Math.max(0, bar.clientWidth - slider.offsetWidth - 8);
    const pieceMaxOffset = () => {
      if (!piece || !puzzleArea) {
        return 0;
      }
      return Math.max(0, puzzleArea.clientWidth - piece.offsetWidth - 48);
    };
    const pieceTargetOffset = () => {
      if (!piece || !slot) {
        return 0;
      }
      return Math.max(0, slot.offsetLeft - piece.offsetLeft);
    };
    const sliderTargetOffset = () => {
      const pieceMax = pieceMaxOffset();
      const sliderMax = maxOffset();
      if (!pieceMax || !sliderMax) {
        return sliderMax;
      }
      return Math.min(sliderMax, Math.round((pieceTargetOffset() / pieceMax) * sliderMax));
    };
    const moveTo = (offset) => {
      const max = maxOffset();
      currentOffset = Math.max(0, Math.min(offset, max));
      const progress = max > 0 ? currentOffset / max : 0;
      slider.style.transform = `translateX(${currentOffset}px)`;
      slider.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      if (piece) {
        piece.style.transform = `translateX(${Math.round(progress * pieceMaxOffset())}px)`;
        piece.dataset.captchaTargetOffset = String(pieceTargetOffset());
      }
      if (label) {
        const nearTarget = Math.abs(currentOffset - sliderTargetOffset()) <= Math.max(14, max * 0.08);
        label.textContent = nearTarget ? '松开完成验证' : '拖到图片缺口位置';
      }
    };

    slider.addEventListener('pointerdown', (event) => {
      if (slider.dataset.captchaPassed === 'true') {
        return;
      }
      dragging = true;
      startX = event.clientX - currentOffset;
      activePointerId = event.pointerId;
      slider.setPointerCapture(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    });

    slider.addEventListener('pointermove', (event) => {
      if (!dragging || activePointerId !== event.pointerId) {
        return;
      }
      moveTo(event.clientX - startX);
      event.preventDefault();
    });

    const finishDrag = (event) => {
      if (!dragging || activePointerId !== event.pointerId) {
        return;
      }
      dragging = false;
      activePointerId = null;
      verifyCaptchaFromDrag(currentOffset, maxOffset(), sliderTargetOffset());
      event.preventDefault();
      event.stopPropagation();
    };

    slider.addEventListener('pointerup', finishDrag);
    slider.addEventListener('pointercancel', finishDrag);
    slider.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (slider.dataset.captchaPassed !== 'true') {
        toast('请按住滑块拖到图片缺口位置');
      }
    });
    slider.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        moveTo(currentOffset + 24);
        event.preventDefault();
      }
      if (event.key === 'ArrowLeft') {
        moveTo(currentOffset - 24);
        event.preventDefault();
      }
      if (event.key === 'Enter' || event.key === ' ') {
        verifyCaptchaFromDrag(currentOffset, maxOffset(), sliderTargetOffset());
        event.preventDefault();
      }
    });
  }

  function setupRememberDevice() {
    const checkbox = document.getElementById('remember');
    if (!(checkbox instanceof HTMLInputElement) || checkbox.dataset.rememberBound === 'true') {
      return;
    }

    checkbox.dataset.rememberBound = 'true';
    checkbox.checked = localStorage.getItem('REMEMBER_DEVICE') === 'true';
    checkbox.addEventListener('change', () => {
      localStorage.setItem('REMEMBER_DEVICE', checkbox.checked ? 'true' : 'false');
    });

    const label = document.querySelector('label[for="remember"]');
    if (label instanceof HTMLLabelElement) {
      label.addEventListener('click', (event) => {
        event.preventDefault();
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
  }

  function sendCode(button) {
    button.textContent = '验证码已发送';
    button.disabled = true;
    button.classList.add('opacity-70');
    const smsInput = document.querySelector('#sms');
    if (smsInput instanceof HTMLInputElement) {
      smsInput.value = '123456';
    }
    toast('短信验证码已发送');
  }

  async function submitRegistration() {
    const role = currentRegisterRole();
    const username = readInputValue('#username') || (role === 'COMPANY' ? 'company_' : 'user_') + Date.now();
    const password = readInputValue('#password') || 'Cspm@2026';
    const confirmPassword = readInputValue('#confirm-password') || password;
    const phone = readInputValue('input[type="tel"], input[placeholder*="手机"]')
      || (role === 'COMPANY' ? '13800000002' : '13800000001');
    const smsCode = readInputValue('#sms') || '123456';

    try {
      const result = await postJson('/api/auth/register', {
        username,
        password,
        confirmPassword,
        phone,
        smsCode,
        role
      });
      storeRole(result.role);
      toast(accountLabel(result.role) + '注册成功，正在进入对应中心');
      window.setTimeout(() => go(result.role === 'COMPANY' ? '/enterprise-center' : '/personal-center'), 260);
    } catch (error) {
      toast(error instanceof Error ? error.message : '注册失败，请稍后重试。');
    }
  }

  function activateRegisterTab(button) {
    const isEnterprise = textOf(button).includes('企业');
    document.querySelectorAll('#personal-tab, #enterprise-tab').forEach((tab) => {
      tab.classList.remove('bg-white', 'text-primary', 'shadow-sm');
      tab.classList.add('text-on-surface-variant');
      tab.setAttribute('aria-selected', 'false');
    });
    button.classList.add('bg-white', 'text-primary', 'shadow-sm');
    button.classList.remove('text-on-surface-variant');
    button.setAttribute('aria-selected', 'true');
    toast(isEnterprise ? '已切换到企业注册' : '已切换到个人注册');
  }

  function addSkill() {
    const button = Array.from(document.querySelectorAll('button')).find((item) => textOf(item).includes('添加技能'));
    if (!button || document.getElementById('skill-new')) {
      toast('技能已添加');
      return;
    }
    const chip = document.createElement('span');
    chip.id = 'skill-new';
    chip.className = 'bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-sm font-medium';
    chip.textContent = '跨部门协作';
    button.before(chip);
    toast('已添加技能');
  }

  function addExperience() {
    const placeholder = Array.from(document.querySelectorAll('div')).find((item) => textOf(item).includes('点击此处添加职业生涯中的其他经历'));
    if (!placeholder || document.getElementById('experience-new')) {
      toast('经历已添加');
      return;
    }
    const card = document.createElement('div');
    card.id = 'experience-new';
    card.className = 'col-span-12 bg-white border border-slate-200 rounded-xl p-6';
    card.innerHTML = '<div class="flex justify-between gap-4"><div><p class="font-label-md text-label-md text-on-background">新增工作经历</p><p class="text-sm text-on-surface-variant mt-2">已添加一条待完善的工作经历。</p></div><div class="flex gap-2"><button type="button" data-stitch-action="edit" class="p-2 text-slate-500 border border-slate-200 rounded">编辑</button><button type="button" data-stitch-action="delete" class="p-2 text-slate-500 border border-slate-200 rounded">删除</button></div></div>';
    placeholder.before(card);
    const empty = document.getElementById('experience-empty');
    if (empty) {
      empty.remove();
    }
    card.querySelectorAll('button[data-stitch-action]').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        runAction(button.dataset.stitchAction, button);
      });
    });
    toast('已添加工作经历');
  }

  function deleteNearestCard(target) {
    const card = target.closest('.group, article, .bg-white.border, .col-span-12');
    if (card && !card.id) {
      card.remove();
      toast('已删除该条记录');
      return;
    }
    toast('已进入删除确认');
  }

  function actionFromText(label) {
    if (/退出登录/.test(label)) return 'logout';
    if (/登录|立即登录/.test(label)) return 'login';
    if (/注册|申请加入/.test(label)) return 'register';
    if (/首页/.test(label)) return 'home';
    if (/招聘信息|职位/.test(label)) return 'recruitments';
    if (/发布职位/.test(label)) return 'new-recruitment';
    if (/添加经历/.test(label)) return 'add-experience';
    if (/基础信息|基本信息|基本资料/.test(label)) return 'personal-center';
    if (/工作经历/.test(label)) return 'work-experience';
    if (/项目经历|项目历史/.test(label)) return 'project-experience';
    if (/获得荣誉|荣誉奖励/.test(label)) return 'honors';
    if (/教育经历|教育背景/.test(label)) return 'education-experience';
    if (/专业技能/.test(label)) return 'professional-skills';
    if (/资格证书|资质证书|证书奖励/.test(label)) return 'certificates';
    if (/企业中心/.test(label)) return 'enterprise-center';
    if (/人才信息|人才画像/.test(label)) return 'personal-center';
    if (/人才\b/.test(label)) return 'personal-center';
    if (/控制台|仪表盘/.test(label)) return 'home';
    if (/查看详情|立即申请|更多机会/.test(label)) return 'recruitments';
    if (/筛选|filter_list/.test(label)) return 'filter-panel';
    if (/排序|sort/.test(label)) return 'sort-panel';
    if (/bookmark|收藏/.test(label)) return 'bookmark';
    if (/通知|notifications/.test(label)) return 'notifications';
    if (/设置|settings/.test(label)) return 'settings';
    if (/忘记密码/.test(label)) return 'forgot-password';
    if (/查看所有报告|数据分析/.test(label)) return 'analytics';
    if (/AI 匹配/.test(label)) return 'ai-match';
    if (/高管猎寻/.test(label)) return 'executive-search';
    if (/帮助|帮助支持|帮助中心/.test(label)) return 'help';
    if (/隐私|服务条款|系统状态|安全信息|Cookie|关于我们|联系我们|加入我们/.test(label)) return 'policy-info';
    if (/swap_horiz|负责人/.test(label)) return 'assign-owner';
    if (/contact_support/.test(label)) return 'support';
    return 'details-panel';
  }

  function runAction(action, element) {
    switch (action) {
      case 'login':
        go('/login');
        break;
      case 'register':
        go('/register');
        break;
      case 'recruitments':
        go('/recruitments');
        break;
      case 'new-recruitment':
        go('/recruitments/new');
        break;
      case 'personal-center':
        go('/personal-center');
        break;
      case 'work-experience':
        go('/personal-center/work-experience');
        break;
      case 'project-experience':
        openPanel('项目经历', '这里用于维护项目起止时间、项目内容、承担职责和项目成果。正式版本会支持新增、编辑、删除多段项目经历。');
        break;
      case 'honors':
        openPanel('获得荣誉', '这里用于维护荣誉起止时间、荣誉内容和证明材料。正式版本会支持多条荣誉记录管理。');
        break;
      case 'education-experience':
        openPanel('教育经历', '这里用于维护毕业院校、所学专业、学历、学位、入学时间和毕业时间。正式版本会支持多段教育经历。');
        break;
      case 'professional-skills':
        openPanel('专业技能', '这里用于维护个人优势、专业技能标签和能力说明，并会与人才匹配和招聘推荐联动。');
        break;
      case 'certificates':
        openPanel('资格证书', '这里用于维护是否具备 CSPM 认证及其他资格证书。正式版本会支持证书新增、编辑、删除和附件上传。');
        break;
      case 'enterprise-center':
        go('/enterprise-center');
        break;
      case 'home':
        go('/');
        break;
      case 'logout':
        localStorage.removeItem(roleKey);
        document.cookie = roleKey + '=; Max-Age=0; path=/';
        go('/');
        break;
      case 'send-code':
        sendCode(element);
        break;
      case 'register-submit':
        submitRegistration();
        break;
      case 'register-tab':
        activateRegisterTab(element);
        break;
      case 'captcha-complete':
        toast('请将拼图块拖到图片缺口位置');
        resetCaptchaSlider();
        break;
      case 'captcha-slider':
        toast('请按住滑块拖到图片缺口位置');
        break;
      case 'add-skill':
        addSkill();
        break;
      case 'add-experience':
        addExperience();
        break;
      case 'delete':
        deleteNearestCard(element);
        break;
      case 'edit':
        toast('已进入编辑状态');
        break;
      case 'save':
        saveCurrentPageDraft();
        break;
      case 'cancel':
        toast('已取消本次修改');
        break;
      case 'upload':
        openPanel('素材上传', '请选择企业或个人资料的品牌素材。当前演示环境会记录打开动作，正式环境可接入文件上传服务。', [
          { label: '返回资料维护', action: 'personal-center' }
        ]);
        break;
      case 'notifications':
        openPanel('通知中心', '暂无新的系统通知。后续通知会展示审核结果、招聘进度、资料补全提醒和企业反馈。');
        break;
      case 'settings':
        openPanel('账号设置', '可在此维护账号安全、消息偏好和隐私设置。当前演示版本已接入入口面板，避免无效点击。');
        break;
      case 'forgot-password':
        openPanel('找回密码', '请输入注册手机号后通过短信验证码重置密码。演示环境验证码为 123456。');
        break;
      case 'filter-panel':
        openPanel('筛选条件', '可按城市、薪资、CSPM 优先、岗位状态筛选首页岗位预览。完整筛选能力在招聘信息列表中提供。', [
          { label: '进入招聘列表', action: 'recruitments' }
        ]);
        break;
      case 'sort-panel':
        openPanel('排序方式', '默认按最新发布或最近更新优先。也可按薪资、需求人数、到岗时间排序。');
        break;
      case 'bookmark':
        toast('已收藏该岗位，可在个人中心查看收藏记录');
        break;
      case 'analytics':
        openPanel('数据分析', '数据分析将展示岗位热度、行业趋势、城市分布和人才匹配情况。该入口已预留为独立分析模块。');
        break;
      case 'ai-match':
        openPanel('AI 匹配', 'AI 匹配会基于岗位要求、项目经历、资格证书和求职意向生成候选人推荐。');
        break;
      case 'executive-search':
        openPanel('高管猎寻', '高管猎寻用于重点岗位的人才寻访、意向跟进与顾问协作。');
        break;
      case 'assign-owner':
        openPanel('负责人维护', '请选择或调整维护负责人。演示环境展示入口，正式环境将接入人员选择器。');
        break;
      case 'support':
        openPanel('在线支持', '请描述遇到的问题，平台顾问会在工作时间内跟进。');
        break;
      case 'captcha-refresh':
        resetCaptchaSlider();
        toast('拼图已刷新，请重新拖动滑块');
        break;
      case 'close-panel':
        document.getElementById('captcha-modal')?.classList.add('hidden');
        break;
      case 'help':
        openPanel('帮助中心', '帮助中心包含账号注册、资料维护、招聘信息查看、企业资料维护和权限说明。');
        break;
      case 'policy-info':
        openPanel('平台说明', '该入口用于查看服务条款、隐私政策、安全信息、系统状态或联系我们等平台说明内容。');
        break;
      case 'info':
      case 'details-panel':
        openPanel('详情说明', '该入口已接入功能面板。涉及业务数据的页面会在登录后按角色展示，未登录时会进入登录提示页。');
        break;
      default:
        openPanel('功能说明', '该入口已接入明确反馈，请根据页面引导继续操作。');
        break;
    }
  }

  function classifyButton(button) {
    const label = textOf(button);
    const iconText = Array.from(button.querySelectorAll('.material-symbols-outlined'))
      .map((icon) => textOf(icon))
      .join(' ');
    const icon = `${label} ${iconText}`.trim();
    if (button.closest('#captcha-modal') && /chevron_right/.test(icon)) return 'captcha-complete';
    if (/close/.test(icon)) return 'close-panel';
    if (/refresh/.test(icon)) return 'captcha-refresh';
    if (/notifications/.test(icon)) return 'notifications';
    if (/settings/.test(icon)) return 'settings';
    if (/photo_camera/.test(icon)) return 'upload';
    if (/swap_horiz/.test(icon)) return 'assign-owner';
    if (/contact_support/.test(icon)) return 'support';
    if (/发送验证码/.test(label)) return 'send-code';
    if (/创建账号/.test(label)) return 'register-submit';
    if (/个人注册|企业注册/.test(label)) return 'register-tab';
    if (/添加技能/.test(label)) return 'add-skill';
    if (/添加经历/.test(label)) return 'add-experience';
    if (/点击此处添加职业生涯中的其他经历/.test(label)) return 'add-experience';
    if (/保存|保存修改|保存资料|发布更新/.test(label)) return 'save';
    if (/取消/.test(label)) return 'cancel';
    if (/更新品牌素材|add_a_photo/.test(icon)) return 'upload';
    if (/delete/.test(icon)) return 'delete';
    if (/edit|编辑/.test(icon) || /编辑资料/.test(label)) return 'edit';
    return actionFromText(label);
  }

  function bindControls() {
    renderSharedHeader();
    renderBlankBusinessState();

    document.querySelectorAll('a').forEach((link) => {
      const label = textOf(link);
      const href = link.getAttribute('href') || '';
      const action = actionFromText(label);
      if (href === '#') {
        link.setAttribute('href', 'javascript:void(0)');
      }
      mark(link, action);
      link.addEventListener('click', (event) => {
        if (href === '#' || href === 'javascript:void(0)') {
          event.preventDefault();
          runAction(action, link);
        }
      });
    });

    document.querySelectorAll('button').forEach((button) => {
      const action = classifyButton(button);
      mark(button, action);
      if (button.type === 'submit') {
        button.type = 'button';
      }
      if (button.getAttribute('onclick')) {
        return;
      }
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        runAction(action, button);
      });
    });

    document.querySelectorAll('form').forEach((form) => {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        submitRegistration();
      });
    });

    document.querySelectorAll('div').forEach((item) => {
      if (textOf(item).includes('点击此处添加职业生涯中的其他经历')) {
        mark(item, 'add-experience');
        item.addEventListener('click', () => runAction('add-experience', item));
      }
    });

    setupCaptchaSlider();
    setupRememberDevice();

    document.addEventListener('click', (event) => {
      const target = event.target instanceof Element
        ? event.target.closest('[data-stitch-action]')
        : null;
      if (!(target instanceof HTMLElement)) {
        return;
      }
      const action = target.dataset.stitchAction;
      if (!action || target.tagName === 'A' || target.tagName === 'BUTTON') {
        return;
      }
      runAction(action, target);
    });
  }

  window.addEventListener('DOMContentLoaded', bindControls);
})();
