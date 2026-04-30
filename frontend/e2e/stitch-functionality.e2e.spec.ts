import { expect, test, type Frame, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://lh3.googleusercontent.com/**', async (route) => {
    await route.abort();
  });
});

const stitchPages = [
  { path: '/', title: '全国项目管理标准化技术委员会 - 人才库 首页' },
  { path: '/login', title: '全国项目管理标准化技术委员会 - 人才库 登录' },
  { path: '/register', title: '全国项目管理标准化技术委员会 - 人才库 注册' },
  { path: '/enterprise-center', title: '企业中心 - 资料维护' },
  { path: '/personal-center', title: '个人中心 - 基础信息' },
  { path: '/personal-center/work-experience', title: '个人中心 - 工作经历' }
];

async function frameByTitle(page: Page, title: string): Promise<Frame> {
  const iframe = page.locator(`iframe[title="${title}"]`);
  await expect(iframe).toBeVisible();
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  expect(frame, `找不到 iframe: ${title}`).toBeTruthy();
  await frame!.waitForLoadState('domcontentloaded');
  return frame!;
}

async function mockRecruitments(page: Page) {
  await page.route('**/api/recruitments**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'rec-001',
            position: '项目经理',
            salary: '15k-25k',
            companyName: '北京示例科技有限公司',
            city: '北京市',
            owner: '赵义民',
            headcount: 3
          }
        ],
        page: 1,
        pageSize: 10,
        totalItems: 1,
        totalPages: 1,
        canCreate: route.request().headers()['x-user-role'] === 'ADMIN'
      })
    });
  });
}

async function loginAs(page: Page, role: 'ADMIN' | 'USER' | 'COMPANY' = 'USER') {
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('USER_ROLE', userRole);
    document.cookie = `USER_ROLE=${userRole}; path=/`;
  }, role);
}

async function authorizeProtectedStitchPage(page: Page, path: string) {
  if (path.startsWith('/personal-center') || path.startsWith('/enterprise-center')) {
    await loginAs(page, path.startsWith('/enterprise-center') ? 'COMPANY' : 'USER');
  }
}

async function gotoStitchPage(page: Page, path: string) {
  await authorizeProtectedStitchPage(page, path);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
}

test.describe('单点功能 - Stitch 页面控件', () => {
  for (const item of stitchPages) {
    test(`${item.title} 没有未绑定按钮或空链接`, async ({ page }) => {
      await gotoStitchPage(page, item.path);
      const frame = await frameByTitle(page, item.title);

      const unboundControls = await frame.evaluate(() => {
        return Array.from(document.querySelectorAll('button, a')).filter((control) => {
          return !(control instanceof HTMLElement)
            || !control.dataset.stitchAction
            || control.dataset.stitchAction === 'feedback';
        }).map((control) => (control.textContent || control.outerHTML).replace(/\s+/g, ' ').trim());
      });

      expect(unboundControls).toEqual([]);
    });
  }

  test('所有 Stitch 页面都使用本地 assets logo', async ({ page }) => {
    for (const item of stitchPages) {
      await gotoStitchPage(page, item.path);
      const frame = await frameByTitle(page, item.title);
      const logoSources = await frame.locator('img[alt*="Logo"], img[alt*="logo"]').evaluateAll((images) => {
        return images.map((image) => image.getAttribute('src'));
      });

      if (logoSources.length > 0) {
        expect(logoSources.every((src) => src === '/assets/logo.png')).toBe(true);
      }
    }
  });

  test('所有 Stitch 页面使用一致的系统表头', async ({ page }) => {
    for (const item of stitchPages) {
      await gotoStitchPage(page, item.path);
      const frame = await frameByTitle(page, item.title);
      const header = frame.locator('.stitch-global-header');

      await expect(header.getByText('全国项目管理标准化技术委员会 - 人才库')).toBeVisible();
      await expect(header.getByRole('button', { name: '首页' })).toBeVisible();
      await expect(header.getByRole('button', { name: '招聘信息' })).toBeVisible();
      await expect(header.getByRole('button', { name: '人才信息' })).toBeVisible();
      await expect(header.getByRole('button', { name: '企业中心' })).toBeVisible();
    }
  });

  test('注册页个人注册和企业注册标签可以切换', async ({ page }) => {
    await page.goto('/register');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 注册');

    await frame.getByRole('button', { name: '企业注册' }).click();
    await expect(frame.locator('#stitch-toast')).toContainText('已切换到企业注册');
    await expect(frame.locator('#enterprise-tab')).toHaveAttribute('aria-selected', 'true');

    await frame.getByRole('button', { name: '个人注册' }).click();
    await expect(frame.locator('#personal-tab')).toHaveAttribute('aria-selected', 'true');
  });

  test('注册页发送验证码按钮会给出明确反馈', async ({ page }) => {
    await page.goto('/register');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 注册');

    await frame.getByRole('button', { name: '发送验证码' }).click();

    await expect(frame.getByRole('button', { name: '验证码已发送' })).toBeDisabled();
    await expect(frame.locator('#stitch-toast')).toContainText('短信验证码已发送');
  });

  test('常见工具入口打开明确功能面板，不再显示兜底提示', async ({ page }) => {
    await page.goto('/');
    let frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 首页');

    await frame.getByRole('button', { name: /筛选/ }).click();
    await expect(frame.locator('#stitch-action-panel')).toContainText('筛选条件');
    await expect.poll(() => frame.locator('body').innerText()).not.toContain('操作已触发');
    await frame.locator('[data-panel-close]').click();

    await page.goto('/login');
    frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');
    await frame.getByText('忘记密码？').click();
    await expect(frame.locator('#stitch-action-panel')).toContainText('找回密码');
    await expect.poll(() => frame.locator('body').innerText()).not.toContain('操作已触发');
  });

  test('登录后的资料中心不展示设计稿测试数据', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center');
    let frame = await frameByTitle(page, '个人中心 - 基础信息');

    await expect(frame.getByText('待完善个人信息')).toBeVisible();
    await expect(frame.getByText('Chen Wei')).toHaveCount(0);
    await expect(frame.getByText('Global Tech Corp')).toHaveCount(0);
    await expect(frame.getByText('拥有超过8年')).toHaveCount(0);

    await page.goto('/personal-center/work-experience');
    frame = await frameByTitle(page, '个人中心 - 工作经历');
    await expect(frame.getByText('暂无工作经历')).toBeVisible();
    await expect(frame.getByText('Global Tech Corp')).toHaveCount(0);
    await expect(frame.getByText('领导企业级')).toHaveCount(0);

    await loginAs(page, 'COMPANY');
    await page.goto('/enterprise-center');
    frame = await frameByTitle(page, '企业中心 - 资料维护');
    await expect(frame.getByText('资料待完善')).toBeVisible();
    await expect(frame.getByText('环球科技集团')).toHaveCount(0);
    await expect(frame.getByText('Sarah Jenkins')).toHaveCount(0);
  });

  test('企业中心保存、取消、更新品牌素材都有反馈', async ({ page }) => {
    await loginAs(page, 'COMPANY');
    await page.goto('/enterprise-center');
    const frame = await frameByTitle(page, '企业中心 - 资料维护');

    await frame.getByRole('button', { name: '保存修改' }).click();
    await expect(frame.locator('#stitch-toast')).toContainText('保存成功');

    await frame.getByRole('button', { name: '取消' }).click();
    await expect(frame.locator('#stitch-toast')).toContainText('已取消本次修改');

    await frame.getByRole('button', { name: '更新品牌素材' }).click();
    await expect(frame.locator('#stitch-action-panel')).toContainText('素材上传');
  });

  test('个人中心添加技能、保存资料、取消更改都有反馈', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center');
    const frame = await frameByTitle(page, '个人中心 - 基础信息');

    await frame.getByRole('button', { name: '+ 添加技能' }).click();
    await expect(frame.getByText('跨部门协作')).toBeVisible();

    await frame.getByRole('button', { name: '保存资料' }).click();
    await expect(frame.locator('#stitch-toast')).toContainText('保存成功');

    await frame.getByRole('button', { name: '取消更改' }).click();
    await expect(frame.locator('#stitch-toast')).toContainText('已取消本次修改');
  });

  test('工作经历页添加、编辑、删除工作经历都有反馈', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center/work-experience');
    const frame = await frameByTitle(page, '个人中心 - 工作经历');

    await frame.getByText('点击此处添加职业生涯中的其他经历').click();
    await expect(frame.getByText('新增工作经历')).toBeVisible();

    await frame.locator('button[data-stitch-action="edit"]').first().click();
    await expect(frame.locator('#stitch-toast')).toContainText('已进入编辑状态');

    await frame.locator('button[data-stitch-action="delete"]').first().click();
    await expect(frame.locator('#stitch-toast')).toContainText(/已删除该条记录|已进入删除确认/);
  });
});

test.describe('工作流程功能 - 页面跳转', () => {
  test('首页登录按钮跳转到登录页', async ({ page }) => {
    await page.goto('/');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 首页');

    await frame.getByRole('button', { name: '登录' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('首页招聘信息导航进入受保护招聘流程', async ({ page }) => {
    await page.goto('/');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 首页');

    await frame.getByText('招聘信息').click();

    await expect(page).toHaveURL(/\/login-required$/);
  });

  test('注册页立即登录按钮跳转登录页', async ({ page }) => {
    await page.goto('/register');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 注册');

    await frame.getByRole('button', { name: '立即登录' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('个人中心工作经历菜单跳转到工作经历页', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center');
    const frame = await frameByTitle(page, '个人中心 - 基础信息');

    await frame.getByText('工作经历').click();

    await expect(page).toHaveURL(/\/personal-center\/work-experience$/);
  });

  test('工作经历页基本信息菜单跳回个人中心', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center/work-experience');
    const frame = await frameByTitle(page, '个人中心 - 工作经历');

    await frame.getByText('基本信息').click();

    await expect(page).toHaveURL(/\/personal-center$/);
  });

  test('退出登录会清理角色并回到公开首页', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('USER_ROLE', 'ADMIN');
      document.cookie = 'USER_ROLE=ADMIN; path=/';
    });
    await page.goto('/personal-center');
    const frame = await frameByTitle(page, '个人中心 - 基础信息');

    await frame.locator('.stitch-global-header button[data-stitch-action="logout"]').click();

    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('USER_ROLE'))).toBeNull();
  });

  test('未登录点击首页人才信息会进入登录提示页', async ({ page }) => {
    await page.goto('/');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 首页');

    await frame.getByRole('button', { name: '人才信息' }).click();

    await expect(page).toHaveURL(/\/login-required$/);
    await expect(page.getByRole('heading', { name: '请先登录后查看招聘信息' })).toBeVisible();
  });
});

test.describe('流程间数据交互 - 角色与接口', () => {
  test('登录滑块验证后进入招聘列表，并把 ADMIN 角色传给接口', async ({ page }) => {
    await mockRecruitments(page);
    const requestPromise = page.waitForRequest((request) => {
      return new URL(request.url()).pathname === '/api/recruitments'
        && request.headers()['x-user-role'] === 'ADMIN';
    });

    await page.goto('/login');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');
    await frame.locator('#username').fill('admin');
    await frame.locator('#password').fill('Admin@2026');
    await frame.locator('main').getByRole('button', { name: '登录' }).click();
    await expect(frame.locator('#captcha-modal')).toBeVisible();
    await frame.locator('#captcha-modal [data-stitch-action="captcha-complete"]').click();

    await requestPromise;
    await expect(page).toHaveURL(/\/recruitments$/);
    await expect(page.getByRole('link', { name: '新增' })).toBeVisible();
  });

  test('注册成功后写入 USER 角色并进入个人中心', async ({ page }) => {
    const username = `e2e_user_${Date.now()}`;
    const authRequest = page.waitForRequest((request) => {
      return new URL(request.url()).pathname === '/api/auth/register';
    });
    await page.goto('/register');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 注册');

    await frame.locator('#username').fill(username);
    await frame.locator('#password').fill('Cspm@2026');
    await frame.locator('#confirm-password').fill('Cspm@2026');
    await frame.locator('#phone').fill('13800001010');
    await frame.getByRole('button', { name: '发送验证码' }).click();
    await frame.getByRole('button', { name: '创建账号' }).click();

    await authRequest;
    await expect(page).toHaveURL(/\/personal-center$/);
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('USER_ROLE'))).toBe('USER');
  });

  test('企业注册成功后写入 COMPANY 角色并进入企业中心', async ({ page }) => {
    const username = `e2e_company_${Date.now()}`;
    await page.goto('/register');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 注册');

    await frame.getByRole('button', { name: '企业注册' }).click();
    await frame.locator('#username').fill(username);
    await frame.locator('#password').fill('Cspm@2026');
    await frame.locator('#confirm-password').fill('Cspm@2026');
    await frame.locator('#phone').fill('13800001011');
    await frame.getByRole('button', { name: '发送验证码' }).click();
    await frame.getByRole('button', { name: '创建账号' }).click();

    await expect(page).toHaveURL(/\/enterprise-center$/);
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('USER_ROLE'))).toBe('COMPANY');
  });

  test('未登录直访发布职位入口会被路由守卫拦截', async ({ page }) => {
    await page.goto('/recruitments/new');

    await expect(page).toHaveURL(/\/login-required$/);
  });
});

test.describe('E2E - 最新页面完整链路', () => {
  test('公开首页到登录验证到招聘列表再到新增入口', async ({ page }) => {
    await mockRecruitments(page);
    await page.goto('/');
    await expect(await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 首页')).toBeTruthy();

    let frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 首页');
    await frame.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/\/login$/);

    frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');
    await frame.locator('#username').fill('admin');
    await frame.locator('#password').fill('Admin@2026');
    await frame.locator('main').getByRole('button', { name: '登录' }).click();
    await frame.locator('#captcha-modal [data-stitch-action="captcha-complete"]').click();
    await expect(page).toHaveURL(/\/recruitments$/);

    await page.getByRole('link', { name: '新增' }).click();
    await expect(page).toHaveURL(/\/recruitments\/new$/);
    await expect(page.getByRole('heading', { name: '招聘新增入口' })).toBeVisible();
  });

  test('注册到个人中心再到工作经历并新增经历', async ({ page }) => {
    const username = `flow_user_${Date.now()}`;
    await page.goto('/register');
    let frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 注册');
    await frame.locator('#username').fill(username);
    await frame.locator('#password').fill('Cspm@2026');
    await frame.locator('#confirm-password').fill('Cspm@2026');
    await frame.locator('#phone').fill('13800001012');
    await frame.getByRole('button', { name: '发送验证码' }).click();
    await frame.getByRole('button', { name: '创建账号' }).click();
    await expect(page).toHaveURL(/\/personal-center$/);

    frame = await frameByTitle(page, '个人中心 - 基础信息');
    await frame.getByText('工作经历').click();
    await expect(page).toHaveURL(/\/personal-center\/work-experience$/);

    frame = await frameByTitle(page, '个人中心 - 工作经历');
    await frame.getByText('点击此处添加职业生涯中的其他经历').click();
    await expect(frame.getByText('新增工作经历')).toBeVisible();
  });
});
