import { expect, test, type Frame, type Locator, type Page } from '@playwright/test';

type Role = 'USER' | 'COMPANY' | 'ADMIN';

const stitchPages: Array<{ path: string; title: string; role?: Role }> = [
  { path: '/', title: '项目管理人才库 首页' },
  { path: '/login', title: '项目管理人才库 登录' },
  { path: '/register', title: '项目管理人才库 注册' },
  { path: '/enterprise-center', title: '企业中心 - 资料维护', role: 'COMPANY' },
  { path: '/personal-center', title: '个人中心 - 基础信息', role: 'USER' },
  { path: '/personal-center/work-experience', title: '个人中心 - 工作经历', role: 'USER' },
  { path: '/personal-center/project-experience', title: '个人中心 - 项目经历', role: 'USER' },
  { path: '/personal-center/education-experience', title: '个人中心 - 教育经历', role: 'USER' },
  { path: '/personal-center/professional-skills', title: '个人中心 - 专业技能', role: 'USER' },
  { path: '/personal-center/certificates', title: '个人中心 - 资格证书', role: 'USER' },
  { path: '/talents', title: '人才信息 - 列表', role: 'ADMIN' },
  { path: '/talents/sample', title: '人才信息 - 详情', role: 'ADMIN' },
  { path: '/analytics', title: '数据分析', role: 'ADMIN' },
  { path: '/recruitments/sample', title: '招聘信息 - 详情', role: 'USER' },
  { path: '/recruitments/sample/apply', title: '招聘申请 - 提交申请', role: 'USER' }
];

async function loginAs(page: Page, role: Role) {
  await page.context().addCookies([
    {
      name: 'USER_ROLE',
      value: role,
      url: 'http://127.0.0.1:5173'
    }
  ]);
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('USER_ROLE', userRole);
    document.cookie = `USER_ROLE=${userRole}; path=/`;
  }, role);
}

async function openStitchPage(page: Page, path: string, title: string, role?: Role): Promise<Frame> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      if (role) {
        await loginAs(page, role);
      }
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      const iframe = page.locator(`iframe[title="${title}"]`);
      await expect(iframe).toBeVisible();
      const handle = await iframe.elementHandle();
      const frame = await handle?.contentFrame();
      expect(frame, `找不到 iframe: ${title}`).toBeTruthy();
      await frame!.waitForLoadState('domcontentloaded');
      return frame!;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(150);
    }
  }

  throw lastError;
}

async function closePanelIfOpen(frame: Frame) {
  const closeButton = frame.locator('[data-panel-close]');
  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click();
  }
}

async function expectPanelAfterClick(frame: Frame, control: Locator, title: string) {
  await closePanelIfOpen(frame);
  await control.click();
  await expect(frame.locator('#stitch-action-panel')).toContainText(title);
  await closePanelIfOpen(frame);
}

async function expectModuleRecordManagerWorks(frame: Frame, title: string, fieldName: string, firstValue: string, editedValue: string) {
  await frame.getByRole('button', { name: `添加${title}` }).click();
  const panel = frame.locator('#stitch-action-panel');
  await expect(panel).toContainText(title);

  await panel.locator(`[data-module-field="${fieldName}"]`).fill(firstValue);
  await panel.locator('[data-module-save]').click();
  await expect(panel).toContainText(firstValue);

  await panel.locator('[data-module-edit="0"]').click();
  await panel.locator(`[data-module-field="${fieldName}"]`).fill(editedValue);
  await panel.locator('[data-module-save]').click();
  await expect(panel).toContainText(editedValue);

  await panel.locator('[data-module-delete="0"]').click();
  await expect(panel).toContainText(/暂无|暂无项目经历|暂无教育经历|暂无专业技能|暂无资格证书/);
  await closePanelIfOpen(frame);
}

test.describe('控件矩阵 - 自动巡检', () => {
  test('所有可点击控件都有明确动作，不能落入兜底面板', async ({ page }) => {
    const forbiddenActions = ['feedback', 'details-panel', 'info'];
    const violations: string[] = [];

    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      const pageViolations = await frame.evaluate((forbidden) => {
        return Array.from(document.querySelectorAll('button, a'))
          .filter((control) => control instanceof HTMLElement)
          .filter((control) => Boolean(control.offsetWidth || control.offsetHeight || control.getClientRects().length))
          .map((control) => {
            const element = control as HTMLElement;
            return {
              text: (element.textContent || element.getAttribute('aria-label') || element.outerHTML).replace(/\s+/g, ' ').trim(),
              action: element.dataset.stitchAction || '',
              tag: element.tagName.toLowerCase()
            };
          })
          .filter((control) => !control.action || forbidden.includes(control.action))
          .map((control) => `${control.tag}[${control.action || '未绑定'}] ${control.text}`);
      }, forbiddenActions);

      violations.push(...pageViolations.map((violation) => `${item.path}: ${violation}`));
    }

    expect(violations).toEqual([]);
  });

  test('所有页面可见动作集合与交互清单一致', async ({ page }) => {
    const expectedActionsByPath: Record<string, string[]> = {
      '/': ['apply-recruitment', 'bookmark', 'filter-panel', 'help', 'home', 'login', 'policy-info', 'recruitment-detail', 'recruitments', 'register', 'sort-panel', 'talents'],
      '/login': ['forgot-password', 'help', 'home', 'login', 'policy-info', 'recruitments', 'register', 'start-login', 'talents'],
      '/register': ['help', 'home', 'login', 'policy-info', 'recruitments', 'register', 'register-submit', 'register-tab', 'send-code', 'talents'],
      '/enterprise-center': ['analytics', 'cancel', 'enterprise-center', 'help', 'home', 'logout', 'notifications', 'policy-info', 'recruitments', 'save', 'settings', 'talents', 'upload'],
      '/personal-center': ['certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'save', 'talents', 'upload', 'work-experience'],
      '/personal-center/work-experience': ['add-experience', 'cancel', 'certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'talents', 'work-experience'],
      '/personal-center/project-experience': ['certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'manage-module', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'talents', 'work-experience'],
      '/personal-center/education-experience': ['certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'manage-module', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'talents', 'work-experience'],
      '/personal-center/professional-skills': ['certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'manage-module', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'talents', 'work-experience'],
      '/personal-center/certificates': ['certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'manage-module', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'talents', 'work-experience'],
      '/talents': ['analytics', 'help', 'home', 'invite-cspm', 'logout', 'new-recruitment', 'policy-info', 'recruitments', 'talent-detail', 'talent-page-jump', 'talent-pagination', 'talent-search', 'talent-search-reset', 'talents'],
      '/talents/sample': ['analytics', 'bookmark', 'contact-talent', 'download-resume', 'help', 'home', 'logout', 'new-recruitment', 'policy-info', 'recruitments', 'talents'],
      '/analytics': ['analytics', 'help', 'home', 'logout', 'new-recruitment', 'policy-info', 'recruitments', 'talents'],
      '/recruitments/sample': ['apply-recruitment', 'bookmark', 'certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'talents', 'work-experience'],
      '/recruitments/sample/apply': ['bookmark', 'certificates', 'education-experience', 'help', 'home', 'honors', 'logout', 'personal-center', 'policy-info', 'professional-skills', 'project-experience', 'recruitments', 'submit-application', 'talents', 'work-experience']
    };
    const failures: string[] = [];

    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      const actual = await frame.locator('button, a').evaluateAll((nodes) => {
        return [...new Set(nodes
          .filter((node) => node instanceof HTMLElement)
          .filter((node) => Boolean((node as HTMLElement).offsetWidth || (node as HTMLElement).offsetHeight || (node as HTMLElement).getClientRects().length))
          .map((node) => (node as HTMLElement).dataset.stitchAction || '')
          .filter(Boolean))]
          .sort();
      });
      const expected = [...(expectedActionsByPath[item.path] || [])].sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        failures.push(`${item.path}: expected ${expected.join(',')} actual ${actual.join(',')}`);
      }
    }

    expect(failures).toEqual([]);
  });

  test('所有可见表单控件都可以实际输入、选择或勾选', async ({ page }) => {
    const failures: string[] = [];

    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      const pageFailures = await frame.evaluate(() => {
        const visible = (element: Element) => {
          const html = element as HTMLElement;
          return Boolean(html.offsetWidth || html.offsetHeight || html.getClientRects().length);
        };
        const dispatch = (field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        };

        return Array.from(document.querySelectorAll('input, textarea, select')).flatMap((node, index) => {
          const field = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          const tagName = field.tagName.toLowerCase();
          const type = field instanceof HTMLInputElement ? field.type : '';
          const label = field.id || field.name || field.getAttribute('placeholder') || field.outerHTML.slice(0, 80);
          const prefix = `${tagName}[${type || 'text'}] ${label}`;

          if (!visible(field) || field.disabled || ['file', 'hidden'].includes(type)) {
            return [];
          }

          try {
            if (field instanceof HTMLInputElement && type === 'checkbox') {
              const before = field.checked;
              field.click();
              return field.checked !== before ? [] : [`${prefix}: checked 未变化`];
            }
            if (field instanceof HTMLInputElement && type === 'radio') {
              field.click();
              return field.checked ? [] : [`${prefix}: radio 未选中`];
            }
            if (field instanceof HTMLSelectElement) {
              if (field.options.length > 1) {
                field.selectedIndex = 1;
              } else if (field.options.length === 1) {
                field.selectedIndex = 0;
              }
              dispatch(field);
              return field.value ? [] : [`${prefix}: select 值为空`];
            }

            const values: Record<string, string> = {
              date: '2026-05-01',
              time: '09:00',
              email: 'tester@example.com',
              url: 'https://example.com',
              tel: '13800001111',
              month: '2026-05',
              number: '1'
            };
            const value = values[type] || (tagName === 'textarea' ? `测试内容-${index}` : `测试-${index}`);
            field.value = value;
            dispatch(field);
            return field.value === value ? [] : [`${prefix}: 期望 ${value} 实际 ${field.value}`];
          } catch (error) {
            return [`${prefix}: ${error instanceof Error ? error.message : String(error)}`];
          }
        });
      });

      failures.push(...pageFailures.map((failure) => `${item.path} ${failure}`));
    }

    expect(failures).toEqual([]);
  });

  const currentRouteActions: Record<string, string[]> = {
    '/': ['home'],
    '/login': ['login'],
    '/register': ['register'],
    '/enterprise-center': ['enterprise-center'],
    '/personal-center': ['personal-center'],
    '/personal-center/work-experience': ['work-experience'],
    '/personal-center/project-experience': ['project-experience'],
    '/personal-center/education-experience': ['education-experience'],
    '/personal-center/professional-skills': ['professional-skills'],
    '/personal-center/certificates': ['certificates'],
    '/talents': ['talents'],
    '/talents/sample': ['talent-detail'],
    '/analytics': ['analytics'],
    '/recruitments/sample': [],
    '/recruitments/sample/apply': []
  };

  for (const item of stitchPages) {
    test(`${item.title} 所有可点击控件点击后都有可观察结果`, async ({ page }) => {
      test.setTimeout(180_000);
      const failures: string[] = [];
      const initialFrame = await openStitchPage(page, item.path, item.title, item.role);
      const controls = await initialFrame.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a'))
          .filter((control) => control instanceof HTMLElement)
          .filter((control) => Boolean(control.offsetWidth || control.offsetHeight || control.getClientRects().length))
          .map((control, visibleIndex) => {
            const element = control as HTMLElement;
            return {
              visibleIndex,
              action: element.dataset.stitchAction || '',
              text: (element.textContent || element.getAttribute('aria-label') || element.outerHTML).replace(/\s+/g, ' ').trim()
            };
          });
      });

      for (const control of controls) {
        const frame = await openStitchPage(page, item.path, item.title, item.role);
        const beforeUrl = page.url();
        const target = frame.locator('button, a').filter({ visible: true }).nth(control.visibleIndex);

        try {
          await target.click({ timeout: 5000 });
          await page.waitForTimeout(120);

          const afterUrl = page.url();
          const panelVisible = await frame.locator('#stitch-action-panel').isVisible().catch(() => false);
          const toastText = await frame.locator('#stitch-toast').textContent({ timeout: 300 }).catch(() => '');
          const captchaVisible = await frame.locator('#captcha-modal:not(.hidden)').isVisible().catch(() => false);
          const currentRouteClick = currentRouteActions[item.path]?.includes(control.action) ?? false;
          const registerTabClick = control.action === 'register-tab'
            && await target.getAttribute('aria-selected').catch(() => null) === 'true';

          const hasResult = afterUrl !== beforeUrl
            || panelVisible
            || captchaVisible
            || registerTabClick
            || currentRouteClick
            || Boolean(toastText && !toastText.includes('操作已触发'));

          if (!hasResult) {
            failures.push(`${item.path} [${control.action}] ${control.text}`);
          }
        } catch (error) {
          failures.push(`${item.path} [${control.action}] ${control.text}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      expect(failures).toEqual([]);
    });
  }

  test('运行时主体结构保留 code.html 的核心布局', async ({ page }) => {
    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      await expect(frame.locator('main')).toBeVisible();
      await expect(frame.locator('header.stitch-preserved-header')).toBeVisible();
      await expect(frame.locator('footer.stitch-preserved-footer')).toBeVisible();
      await expect(frame.locator('header.stitch-preserved-header')).toContainText('项目管理人才库');
      await expect(frame.locator('footer.stitch-preserved-footer')).toContainText('项目管理人才库');

      if (item.path === '/register') {
        await expect(frame.locator('main')).toHaveClass(/flex/);
        await expect(frame.locator('main')).toHaveClass(/md:flex-row/);
        await expect(frame.getByRole('heading', { name: '开启您的职业进阶之旅' })).toBeVisible();
      }

      if (item.path === '/login') {
        await expect(frame.locator('main .bg-surface-container-lowest').first()).toBeVisible();
        await expect(frame.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
      }

      if (item.path === '/') {
        await expect(frame.getByText('发现战略性人才')).toBeVisible();
        await expect(frame.getByText('人才洞察')).toBeVisible();
      }

      if (item.path.includes('personal-center')) {
        await expect(frame.locator('aside')).toBeVisible();
      }

      if (item.path === '/enterprise-center') {
        await expect(frame.locator('aside')).toBeVisible();
        await expect(frame.getByText('核心身份')).toBeVisible();
      }

      if (item.path === '/analytics') {
        await expect(frame.locator('aside')).toBeVisible();
        await expect(frame.getByText('行业趋势对比')).toBeVisible();
        await expect(frame.getByText('岗位热度排行榜')).toBeVisible();
      }
    }
  });

  test('登录页和注册页底部保持一致', async ({ page }) => {
    const footerSignature = async (frame: Frame) => {
      return frame.locator('footer').evaluate((footer) => ({
        className: footer.className,
        text: footer.textContent?.replace(/\s+/g, ' ').trim(),
        links: Array.from(footer.querySelectorAll('a')).map((link) => ({
          text: link.textContent?.replace(/\s+/g, ' ').trim(),
          className: link.className
        }))
      }));
    };

    const loginFrame = await openStitchPage(page, '/login', '项目管理人才库 登录');
    const loginFooter = await footerSignature(loginFrame);
    const registerFrame = await openStitchPage(page, '/register', '项目管理人才库 注册');
    const registerFooter = await footerSignature(registerFrame);

    expect(loginFooter).toEqual(registerFooter);
  });

  test('所有 Stitch 页面头部和底部保持同一套旧版外壳', async ({ page }) => {
    test.setTimeout(120_000);

    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      await expect(frame.locator('header.stitch-preserved-header img[alt="项目管理人才库 Logo"]')).toHaveAttribute('src', '/assets/logo.png');
      await expect(frame.locator('header.stitch-preserved-header')).toContainText('首页');
      await expect(frame.locator('header.stitch-preserved-header')).toContainText('招聘信息');
      await expect(frame.locator('header.stitch-preserved-header')).toContainText('人才信息');
      if (item.role === 'ADMIN' || item.role === 'COMPANY') {
        await expect(frame.locator('header.stitch-preserved-header')).toContainText('数据分析');
      } else {
        await expect(frame.locator('header.stitch-preserved-header')).not.toContainText('数据分析');
      }
      await expect(frame.locator('footer.stitch-preserved-footer')).toContainText('帮助中心');
      await expect(frame.locator('footer.stitch-preserved-footer')).toContainText('系统状态');
      await expect(frame.locator('footer.stitch-preserved-footer')).toContainText('Cookie 政策');
    }
  });

  test('所有可见导航和按钮不泄露模板英文入口', async ({ page }) => {
    const forbidden = /\b(Dashboard|Jobs|Talent|Analytics|Messages|Enterprise Portal|Post Job|Help Center|Logout|Basic Info|Work Experience|Project History|Education|Skills|Certifications|Edit Profile)\b/;
    const leaks: string[] = [];

    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      const pageLeaks = await frame.locator('button, a, nav, aside').evaluateAll((nodes) => {
        return nodes
          .filter((node) => node instanceof HTMLElement)
          .filter((node) => Boolean((node as HTMLElement).offsetWidth || (node as HTMLElement).offsetHeight || (node as HTMLElement).getClientRects().length))
          .map((node) => (node.textContent || '').replace(/\s+/g, ' ').trim())
          .filter(Boolean);
      });

      leaks.push(...pageLeaks.filter((text) => forbidden.test(text)).map((text) => `${item.path}: ${text}`));
    }

    expect(leaks).toEqual([]);
  });
});

test.describe('控件矩阵 - 易漏入口点名验证', () => {
  test('登录页辅助链接和记住设备都有明确功能，且不展示 SSO 登录', async ({ page }) => {
    const frame = await openStitchPage(page, '/login', '项目管理人才库 登录');

    await expect(frame.getByText('或通过企业 SSO 登录')).toHaveCount(0);
    await expect(frame.getByRole('button', { name: 'Google' })).toHaveCount(0);
    await expect(frame.getByRole('button', { name: 'Microsoft' })).toHaveCount(0);
    await expect(frame.getByRole('button', { name: '指纹登录' })).toHaveCount(0);
    await expect(frame.getByRole('button', { name: '扫码登录' })).toHaveCount(0);
    await expect(frame.getByText('或者')).toHaveCount(0);
    await expectPanelAfterClick(frame, frame.getByText('忘记密码？'), '找回密码');
    await expectPanelAfterClick(frame, frame.getByRole('link', { name: 'Cookie 政策' }), '平台说明');

    const remember = frame.locator('#remember');
    await expect(remember).not.toBeChecked();
    await frame.getByText('记住设备（30天内）').click();
    await expect(remember).toBeChecked();
  });

  test('个人中心侧栏的每个业务页签都打开对应功能', async ({ page }) => {
    let frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');

    await frame.locator('[data-stitch-action="project-experience"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/project-experience$/);
    frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');
    await frame.locator('[data-stitch-action="education-experience"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/education-experience$/);
    frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');
    await frame.locator('[data-stitch-action="professional-skills"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/professional-skills$/);
    frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');
    await frame.locator('[data-stitch-action="certificates"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/certificates$/);
  });

  test('企业中心侧栏的核心业务入口都打开对应功能', async ({ page }) => {
    let frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');

    await frame.locator('[data-stitch-action="talents"]').first().click();
    await expect(page).toHaveURL(/\/talents$/);
    frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    await frame.locator('[data-stitch-action="recruitments"]').first().click();
    await expect(page).toHaveURL(/\/recruitments$/);
    frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    await frame.locator('[data-stitch-action="analytics"]').first().click();
    await expect(page).toHaveURL(/\/analytics$/);
    frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    await frame.locator('[data-stitch-action="help"]').first().click();
    await expect(frame.locator('#stitch-action-panel')).toContainText('帮助中心');
  });

  test('企业账号点击企业中心所有可见入口不会串到个人中心', async ({ page }) => {
    test.setTimeout(180_000);
    const initialFrame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    const controls = await initialFrame.evaluate(() => {
      return Array.from(document.querySelectorAll('button, a'))
        .filter((control) => control instanceof HTMLElement)
        .filter((control) => Boolean(control.offsetWidth || control.offsetHeight || control.getClientRects().length))
        .map((control, visibleIndex) => {
          const element = control as HTMLElement;
          return {
            visibleIndex,
            action: element.dataset.stitchAction || '',
            text: (element.textContent || element.getAttribute('aria-label') || element.outerHTML).replace(/\s+/g, ' ').trim()
          };
        });
    });
    const failures: string[] = [];

    for (const control of controls) {
      const frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
      await frame.locator('button, a').filter({ visible: true }).nth(control.visibleIndex).click({ timeout: 5000 });
      await page.waitForTimeout(150);
      if (new URL(page.url()).pathname.startsWith('/personal-center')) {
        failures.push(`[${control.action}] ${control.text}`);
      }
    }

    expect(failures).toEqual([]);
  });

  test('左侧导航根据角色显示中文入口且不泄露其他角色信息', async ({ page }) => {
    let frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');
    let asideText = await frame.locator('aside').first().innerText();
    expect(asideText).toContain('个人资料');
    expect(asideText).toContain('基本信息');
    expect(asideText).toContain('工作经历');
    expect(asideText).toContain('资格证书');
    expect(asideText).not.toMatch(/Global Tech|Enterprise|Partner|Dashboard|Overview|Talent Pool|Job Postings|Employee Management/);
    expect(asideText).not.toContain('企业资料');

    frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    asideText = await frame.locator('aside').first().innerText();
    expect(asideText).toContain('企业资料');
    expect(asideText).toContain('招聘信息');
    expect(asideText).toContain('人才信息');
    expect(asideText).toContain('数据分析');
    expect(asideText).not.toContain('工作经历');
    expect(asideText).not.toContain('基本信息');
    expect(asideText).not.toMatch(/Global Tech|Enterprise|Partner|Dashboard|Overview|Talent Pool|Job Postings|Employee Management|Analytics/);

    frame = await openStitchPage(page, '/talents', '人才信息 - 列表', 'ADMIN');
    asideText = await frame.locator('aside').first().innerText();
    expect(asideText).toContain('招聘管理');
    expect(asideText).toContain('新增招聘');
    expect(asideText).toContain('人才信息');
    expect(asideText).toContain('数据分析');
    expect(asideText).not.toContain('个人资料');
    expect(asideText).not.toContain('企业资料');
    expect(asideText).not.toMatch(/Global Tech|Enterprise|Partner|Dashboard|Overview|Talent Pool|Job Postings|Employee Management|Analytics/);

    frame = await openStitchPage(page, '/analytics', '数据分析', 'ADMIN');
    asideText = await frame.locator('aside').first().innerText();
    expect(asideText).toContain('招聘管理');
    expect(asideText).toContain('数据分析');
    expect(asideText).not.toContain('个人资料');
    expect(asideText).not.toContain('企业资料');
    expect(asideText).not.toMatch(/Global Tech|Enterprise|Partner|Dashboard|Overview|Talent Pool|Job Postings|Employee Management|Analytics/);
  });

  test('数据分析页按角色开放入口且普通用户不可见', async ({ page }) => {
    let frame = await openStitchPage(page, '/', '项目管理人才库 首页', 'ADMIN');
    await expect(frame.locator('header.stitch-preserved-header')).toContainText('数据分析');
    await frame.locator('[data-stitch-action="analytics"]').first().click();
    await expect(page).toHaveURL(/\/analytics$/);
    await expect(page.frameLocator('iframe[title="数据分析"]').getByText('人才城市分布')).toBeVisible();

    frame = await openStitchPage(page, '/', '项目管理人才库 首页', 'COMPANY');
    await expect(frame.locator('header.stitch-preserved-header')).toContainText('数据分析');
    await frame.locator('[data-stitch-action="analytics"]').first().click();
    await expect(page).toHaveURL(/\/analytics$/);
    await expect(page.frameLocator('iframe[title="数据分析"]').getByText('人才质量匹配分析')).toBeVisible();

    frame = await openStitchPage(page, '/', '项目管理人才库 首页', 'USER');
    await expect(frame.locator('header.stitch-preserved-header')).not.toContainText('数据分析');
    await expect(frame.locator('[data-stitch-action="analytics"]')).toHaveCount(0);

    await page.goto('/analytics', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/personal-center$/);
  });

  test('工作经历页侧栏的每个业务入口都打开对应功能', async ({ page }) => {
    let frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');

    await frame.locator('[data-stitch-action="project-experience"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/project-experience$/);
    frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');
    await frame.locator('[data-stitch-action="education-experience"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/education-experience$/);
    frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');
    await frame.locator('[data-stitch-action="professional-skills"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/professional-skills$/);
    frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');
    await frame.locator('[data-stitch-action="certificates"]').first().click();
    await expect(page).toHaveURL(/\/personal-center\/certificates$/);
  });

  test('补充页面的添加、编辑、删除形成闭环', async ({ page }) => {
    const projectFrame = await openStitchPage(page, '/personal-center/project-experience', '个人中心 - 项目经历', 'USER');
    await expectModuleRecordManagerWorks(projectFrame, '项目经历', '项目内容', '标准化平台建设', '标准化平台升级');

    const educationFrame = await openStitchPage(page, '/personal-center/education-experience', '个人中心 - 教育经历', 'USER');
    await expectModuleRecordManagerWorks(educationFrame, '教育经历', '毕业院校', '北京大学', '清华大学');

    const skillsFrame = await openStitchPage(page, '/personal-center/professional-skills', '个人中心 - 专业技能', 'USER');
    await expectModuleRecordManagerWorks(skillsFrame, '专业技能', '技能名称', '项目治理', '项目群管理');

    const certificatesFrame = await openStitchPage(page, '/personal-center/certificates', '个人中心 - 资格证书', 'USER');
    await expectModuleRecordManagerWorks(certificatesFrame, '资格证书', '是否具备CSPM认证', '是', '否');
  });
});
