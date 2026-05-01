import { expect, test, type Frame, type Locator, type Page } from '@playwright/test';

type Role = 'USER' | 'COMPANY';

const stitchPages: Array<{ path: string; title: string; role?: Role }> = [
  { path: '/', title: '全国项目管理标准化技术委员会 - 人才库 首页' },
  { path: '/login', title: '全国项目管理标准化技术委员会 - 人才库 登录' },
  { path: '/register', title: '全国项目管理标准化技术委员会 - 人才库 注册' },
  { path: '/enterprise-center', title: '企业中心 - 资料维护', role: 'COMPANY' },
  { path: '/personal-center', title: '个人中心 - 基础信息', role: 'USER' },
  { path: '/personal-center/work-experience', title: '个人中心 - 工作经历', role: 'USER' },
  { path: '/personal-center/project-experience', title: '个人中心 - 项目经历', role: 'USER' },
  { path: '/personal-center/education-experience', title: '个人中心 - 教育经历', role: 'USER' },
  { path: '/personal-center/professional-skills', title: '个人中心 - 专业技能', role: 'USER' },
  { path: '/personal-center/certificates', title: '个人中心 - 资格证书', role: 'USER' }
];

test.beforeEach(async ({ page }) => {
  await page.route('https://lh3.googleusercontent.com/**', async (route) => {
    await route.abort();
  });
});

async function loginAs(page: Page, role: Role) {
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('USER_ROLE', userRole);
    document.cookie = `USER_ROLE=${userRole}; path=/`;
  }, role);
}

async function openStitchPage(page: Page, path: string, title: string, role?: Role): Promise<Frame> {
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

  test('所有可见表单控件都可以实际输入、选择或勾选', async ({ page }) => {
    const failures: string[] = [];

    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      const fields = frame.locator('input, textarea, select');
      const count = await fields.count();

      for (let index = 0; index < count; index += 1) {
        const field = fields.nth(index);
        if (!(await field.isVisible().catch(() => false)) || await field.isDisabled().catch(() => false)) {
          continue;
        }

        const tagName = await field.evaluate((node) => node.tagName.toLowerCase());
        const type = (await field.getAttribute('type')) || '';
        const label = await field.evaluate((node) => {
          const element = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
          return element.id || element.name || element.getAttribute('placeholder') || element.outerHTML.slice(0, 80);
        });

        try {
          if (type === 'checkbox') {
            const before = await field.isChecked();
            await field.click();
            await expect(field).toBeChecked({ checked: !before });
          } else if (type === 'radio') {
            await field.check();
            await expect(field).toBeChecked();
          } else if (tagName === 'select') {
            await field.selectOption({ index: 1 });
            await expect.poll(() => field.inputValue()).not.toBe('');
          } else if (tagName === 'textarea') {
            await field.fill(`测试内容-${index}`);
            await expect(field).toHaveValue(`测试内容-${index}`);
          } else if (type === 'date') {
            await field.fill('2026-05-01');
            await expect(field).toHaveValue('2026-05-01');
          } else if (type === 'time') {
            await field.fill('09:00');
            await expect(field).toHaveValue('09:00');
          } else if (type === 'email') {
            await field.fill('tester@example.com');
            await expect(field).toHaveValue('tester@example.com');
          } else if (type === 'url') {
            await field.fill('https://example.com');
            await expect(field).toHaveValue('https://example.com');
          } else if (type === 'tel') {
            await field.fill('13800001111');
            await expect(field).toHaveValue('13800001111');
          } else {
            await field.fill(`测试-${index}`);
            await expect(field).toHaveValue(`测试-${index}`);
          }
        } catch (error) {
          failures.push(`${item.path} ${tagName}[${type || 'text'}] ${label}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
    }

    expect(failures).toEqual([]);
  });

  test('所有可点击控件点击后都有可观察结果', async ({ page }) => {
    test.setTimeout(360_000);
    const failures: string[] = [];
    const currentRouteActions: Record<string, string[]> = {
      '/': ['home'],
      '/login': ['login'],
      '/register': ['register'],
      '/enterprise-center': ['enterprise-center', 'personal-center'],
      '/personal-center': ['personal-center'],
      '/personal-center/work-experience': ['work-experience'],
      '/personal-center/project-experience': ['project-experience'],
      '/personal-center/education-experience': ['education-experience'],
      '/personal-center/professional-skills': ['professional-skills'],
      '/personal-center/certificates': ['certificates']
    };

    for (const item of stitchPages) {
      const initialFrame = await openStitchPage(page, item.path, item.title, item.role);
      const controls = await initialFrame.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a'))
          .filter((control) => control instanceof HTMLElement)
          .filter((control) => Boolean(control.offsetWidth || control.offsetHeight || control.getClientRects().length))
          .map((control, index) => {
            const element = control as HTMLElement;
            return {
              index,
              action: element.dataset.stitchAction || '',
              text: (element.textContent || element.getAttribute('aria-label') || element.outerHTML).replace(/\s+/g, ' ').trim()
            };
          });
      });

      for (const control of controls) {
        const frame = await openStitchPage(page, item.path, item.title, item.role);
        const beforeUrl = page.url();
        const target = frame.locator('button, a').nth(control.index);

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
    }

    expect(failures).toEqual([]);
  });

  test('运行时主体结构保留 code.html 的核心布局', async ({ page }) => {
    for (const item of stitchPages) {
      const frame = await openStitchPage(page, item.path, item.title, item.role);
      await expect(frame.locator('main')).toBeVisible();

      if (item.path === '/register') {
        await expect(frame.locator('main > div.grid')).toHaveClass(/grid-cols-1/);
        await expect(frame.locator('main > div.grid')).toHaveClass(/lg:grid-cols-12/);
        await expect(frame.locator('main > div.grid > div').first()).toHaveClass(/lg:col-span-5/);
        await expect(frame.locator('main > div.grid > div').last()).toHaveClass(/lg:col-span-7/);
        await expect(frame.getByRole('heading', { name: '释放企业潜能' })).toBeVisible();
      }

      if (item.path === '/login') {
        await expect(frame.locator('main .bg-surface-container-lowest')).toBeVisible();
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
        await expect(frame.getByText('核心标识')).toBeVisible();
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

    const loginFrame = await openStitchPage(page, '/login', '全国项目管理标准化技术委员会 - 人才库 登录');
    const loginFooter = await footerSignature(loginFrame);
    const registerFrame = await openStitchPage(page, '/register', '全国项目管理标准化技术委员会 - 人才库 注册');
    const registerFooter = await footerSignature(registerFrame);

    expect(loginFooter).toEqual(registerFooter);
  });
});

test.describe('控件矩阵 - 易漏入口点名验证', () => {
  test('登录页辅助链接和记住设备都有明确功能，且不展示 SSO 登录', async ({ page }) => {
    const frame = await openStitchPage(page, '/login', '全国项目管理标准化技术委员会 - 人才库 登录');

    await expect(frame.getByText('或通过企业 SSO 登录')).toHaveCount(0);
    await expect(frame.getByRole('button', { name: 'Google' })).toHaveCount(0);
    await expect(frame.getByRole('button', { name: 'Microsoft' })).toHaveCount(0);
    await expectPanelAfterClick(frame, frame.getByText('忘记密码？'), '找回密码');
    await expectPanelAfterClick(frame, frame.getByRole('link', { name: '服务条款' }), '平台说明');

    const remember = frame.locator('#remember');
    await expect(remember).not.toBeChecked();
    await frame.getByText('记住设备（30天内）').click();
    await expect(remember).toBeChecked();
  });

  test('个人中心侧栏的每个业务页签都打开对应功能', async ({ page }) => {
    let frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');

    await frame.locator('a').filter({ hasText: '项目经历' }).click();
    await expect(page).toHaveURL(/\/personal-center\/project-experience$/);
    frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');
    await frame.locator('a').filter({ hasText: '教育经历' }).click();
    await expect(page).toHaveURL(/\/personal-center\/education-experience$/);
    frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');
    await frame.locator('a').filter({ hasText: '专业技能' }).click();
    await expect(page).toHaveURL(/\/personal-center\/professional-skills$/);
    frame = await openStitchPage(page, '/personal-center', '个人中心 - 基础信息', 'USER');
    await frame.locator('a').filter({ hasText: '资格证书' }).click();
    await expect(page).toHaveURL(/\/personal-center\/certificates$/);
  });

  test('企业中心侧栏的每个业务入口都打开对应功能', async ({ page }) => {
    let frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');

    await frame.locator('a').filter({ hasText: '项目历史' }).click();
    await expect(page).toHaveURL(/\/personal-center\/project-experience$/);
    frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    await frame.locator('a').filter({ hasText: '教育背景' }).click();
    await expect(page).toHaveURL(/\/personal-center\/education-experience$/);
    frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    await frame.locator('a').filter({ hasText: '专业技能' }).click();
    await expect(page).toHaveURL(/\/personal-center\/professional-skills$/);
    frame = await openStitchPage(page, '/enterprise-center', '企业中心 - 资料维护', 'COMPANY');
    await frame.locator('a').filter({ hasText: '资质证书' }).click();
    await expect(page).toHaveURL(/\/personal-center\/certificates$/);
  });

  test('工作经历页侧栏的每个业务入口都打开对应功能', async ({ page }) => {
    let frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');

    await frame.locator('a').filter({ hasText: '项目历史' }).click();
    await expect(page).toHaveURL(/\/personal-center\/project-experience$/);
    frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');
    await frame.locator('a').filter({ hasText: '教育背景' }).click();
    await expect(page).toHaveURL(/\/personal-center\/education-experience$/);
    frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');
    await frame.locator('a').filter({ hasText: '专业技能' }).click();
    await expect(page).toHaveURL(/\/personal-center\/professional-skills$/);
    frame = await openStitchPage(page, '/personal-center/work-experience', '个人中心 - 工作经历', 'USER');
    await frame.locator('a').filter({ hasText: '证书奖励' }).click();
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
