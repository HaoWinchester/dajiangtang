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

    if (!document.getElementById('stitch-global-header-style')) {
      const style = document.createElement('style');
      style.id = 'stitch-global-header-style';
      style.textContent = `
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

    const path = window.parent.location.pathname;
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
    card.innerHTML = '<p class="font-label-md text-label-md text-on-background">新增工作经历</p><p class="text-sm text-on-surface-variant mt-2">已添加一条待完善的工作经历。</p>';
    placeholder.before(card);
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
    if (/基础信息|基本信息/.test(label)) return 'personal-center';
    if (/工作经历/.test(label)) return 'work-experience';
    if (/企业中心/.test(label)) return 'enterprise-center';
    if (/人才信息|人才画像/.test(label)) return 'personal-center';
    if (/人才\b/.test(label)) return 'personal-center';
    if (/控制台|仪表盘/.test(label)) return 'home';
    if (/查看详情|立即申请|更多机会/.test(label)) return 'recruitments';
    if (/查看所有报告|数据分析|AI 匹配|高管猎寻/.test(label)) return 'enterprise-center';
    if (/帮助|隐私|服务条款|系统状态|安全信息|Cookie|关于我们|联系我们|加入我们/.test(label)) return 'info';
    return 'feedback';
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
        completeLogin();
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
        toast('保存成功');
        break;
      case 'cancel':
        toast('已取消本次修改');
        break;
      case 'upload':
        toast('已打开素材上传入口');
        break;
      case 'info':
        toast('该内容为演示信息入口');
        break;
      default:
        toast('操作已触发');
        break;
    }
  }

  function classifyButton(button) {
    const label = textOf(button);
    const icon = label || button.querySelector('.material-symbols-outlined')?.textContent || '';
    if (button.closest('#captcha-modal') && /chevron_right/.test(icon)) return 'captcha-complete';
    if (/发送验证码/.test(label)) return 'send-code';
    if (/创建账号/.test(label)) return 'register-submit';
    if (/个人注册|企业注册/.test(label)) return 'register-tab';
    if (/添加技能/.test(label)) return 'add-skill';
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

    const captchaSlider = document.querySelector('#captcha-modal .cursor-pointer');
    if (captchaSlider instanceof HTMLElement) {
      mark(captchaSlider, 'captcha-complete');
      captchaSlider.addEventListener('click', (event) => {
        event.stopPropagation();
        runAction('captcha-complete', captchaSlider);
      });
    }

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
