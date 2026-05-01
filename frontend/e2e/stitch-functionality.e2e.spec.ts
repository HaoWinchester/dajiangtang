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
  { path: '/personal-center/work-experience', title: '个人中心 - 工作经历' },
  { path: '/personal-center/project-experience', title: '个人中心 - 项目经历' },
  { path: '/personal-center/education-experience', title: '个人中心 - 教育经历' },
  { path: '/personal-center/professional-skills', title: '个人中心 - 专业技能' },
  { path: '/personal-center/certificates', title: '个人中心 - 资格证书' }
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

async function dragCaptchaToGap(frame: Frame) {
  const slider = frame.locator('#captcha-modal [data-stitch-action="captcha-slider"]');
  const bar = slider.locator('xpath=..');
  const piece = frame.locator('#captcha-modal .z-10');
  const slot = frame.locator('#captcha-modal .shadow-inner');
  await expect(slider).toBeVisible();

  const sliderBox = await slider.boundingBox();
  const barBox = await bar.boundingBox();
  const pieceBox = await piece.boundingBox();
  const slotBox = await slot.boundingBox();
  expect(sliderBox, '找不到滑块位置').toBeTruthy();
  expect(barBox, '找不到滑轨位置').toBeTruthy();
  expect(pieceBox, '找不到拼图块位置').toBeTruthy();
  expect(slotBox, '找不到拼图缺口位置').toBeTruthy();

  const startX = sliderBox!.x + sliderBox!.width / 2;
  const startY = sliderBox!.y + sliderBox!.height / 2;
  const sliderMaxOffset = barBox!.width - sliderBox!.width - 8;
  const pieceMaxOffset = frame.locator('#captcha-modal .aspect-\\[4\\/3\\]');
  const puzzleBox = await pieceMaxOffset.boundingBox();
  expect(puzzleBox, '找不到拼图区域位置').toBeTruthy();
  const maxPieceTravel = puzzleBox!.width - pieceBox!.width - 48;
  const targetPieceTravel = slotBox!.x - pieceBox!.x;
  const targetSliderTravel = Math.round((targetPieceTravel / maxPieceTravel) * sliderMaxOffset);
  const endX = startX + targetSliderTravel;
  const mouse = frame.page().mouse;

  await mouse.move(startX, startY);
  await mouse.down();
  await mouse.move(endX, startY, { steps: 12 });
  await mouse.up();
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

  test('所有 Stitch 页面保留 code.html 原始头部', async ({ page }) => {
    for (const item of stitchPages) {
      await gotoStitchPage(page, item.path);
      const frame = await frameByTitle(page, item.title);
      const sourceHeader = frame.locator('body > header, body > nav').first();

      await expect(sourceHeader).toBeVisible();
      await expect(frame.locator('.stitch-global-header')).toHaveCount(0);
      await expect(sourceHeader).toContainText(/全国项目管理标准化技术委员会 - 人才库|仪表盘|控制台|Talent Pool/i);
    }
  });

  test('固定顶部栏在宽屏下铺满视口右侧不留缺口', async ({ page }) => {
    await page.setViewportSize({ width: 1680, height: 900 });
    const fixedHeaderPages = stitchPages.filter((item) => item.path !== '/login');

    for (const item of fixedHeaderPages) {
      await gotoStitchPage(page, item.path);
      const frame = await frameByTitle(page, item.title);
      const metrics = await frame.locator('body > header, body > nav').first().evaluate((header) => {
        const rect = header.getBoundingClientRect();
        return {
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          viewport: window.innerWidth
        };
      });

      expect(metrics.left).toBe(0);
      expect(metrics.right).toBeGreaterThanOrEqual(metrics.viewport - 1);
      expect(metrics.width).toBeGreaterThanOrEqual(metrics.viewport - 1);
    }
  });

  test('注册页保留 code.html 原始设计结构', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 注册');

    await expect(frame.locator('body > header')).toBeVisible();
    await expect(frame.locator('.stitch-global-header')).toHaveCount(0);
    await expect(frame.locator('body')).not.toHaveClass(/stitch-page /);
    await expect(frame.getByRole('heading', { name: '释放企业潜能' })).toBeVisible();
    await expect(frame.getByRole('heading', { name: '创建账号' })).toBeVisible();
    await expect(frame.locator('main > div.grid')).toHaveClass(/lg:grid-cols-12/);
    await expect(frame.locator('main form')).toHaveClass(/space-y-lg/);
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

  test('登录页记住设备可以点击选中和取消', async ({ page }) => {
    await page.goto('/login');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');
    const remember = frame.locator('#remember');

    await expect(remember).not.toBeChecked();
    await frame.getByText('记住设备（30天内）').click();
    await expect(remember).toBeChecked();
    await expect.poll(() => remember.evaluate((element) => {
      const style = getComputedStyle(element);
      return style.appearance || style.getPropertyValue('-webkit-appearance');
    })).not.toBe('none');
    await expect.poll(() => frame.evaluate(() => localStorage.getItem('REMEMBER_DEVICE'))).toBe('true');
    await remember.click();
    await expect(remember).not.toBeChecked();
    await expect.poll(() => frame.evaluate(() => localStorage.getItem('REMEMBER_DEVICE'))).toBe('false');
  });

  test('登录页未填写用户名或密码时不会打开滑动验证', async ({ page }) => {
    await page.goto('/login');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');

    await frame.locator('main').getByRole('button', { name: '登录' }).click();
    await expect(frame.locator('#captcha-modal')).toBeHidden();
    await expect(frame.locator('#stitch-toast')).toContainText('请输入用户名');

    await frame.locator('#username').fill('admin');
    await frame.locator('main').getByRole('button', { name: '登录' }).click();
    await expect(frame.locator('#captcha-modal')).toBeHidden();
    await expect(frame.locator('#stitch-toast')).toContainText('请输入密码');
  });

  test('刷新验证码会重置滑块并刷新缺口参考信息', async ({ page }) => {
    await page.goto('/login');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');

    await frame.locator('#username').fill('admin');
    await frame.locator('#password').fill('Admin@2026');
    await frame.locator('main').getByRole('button', { name: '登录' }).click();
    await expect(frame.locator('#captcha-modal')).toBeVisible();

    const slider = frame.locator('#captcha-modal [data-stitch-action="captcha-slider"]');
    await slider.focus();
    await page.keyboard.press('ArrowRight');

    const before = await frame.evaluate(() => {
      const ref = Array.from(document.querySelectorAll('#captcha-modal span')).find((item) => item.textContent?.includes('参考 ID'));
      const slot = document.querySelector('#captcha-modal .shadow-inner') as HTMLElement | null;
      return {
        ref: ref?.textContent || '',
        slotLeft: slot?.style.left || '',
        transform: (document.querySelector('#captcha-modal [data-stitch-action="captcha-slider"]') as HTMLElement | null)?.style.transform || ''
      };
    });
    expect(before.transform).not.toBe('translateX(0px)');

    await frame.getByText('刷新验证码').click();
    await expect(frame.locator('#stitch-toast')).toContainText('拼图已刷新，请重新拖动滑块');
    await expect.poll(() => slider.evaluate((element) => (element as HTMLElement).style.transform)).toBe('translateX(0px)');
    await expect(frame.locator('#captcha-modal .select-none')).toContainText('按住滑块拖动');
    await expect.poll(() => frame.evaluate(() => {
      const ref = Array.from(document.querySelectorAll('#captcha-modal span')).find((item) => item.textContent?.includes('参考 ID'));
      const slot = document.querySelector('#captcha-modal .shadow-inner') as HTMLElement | null;
      return {
        ref: ref?.textContent || '',
        slotLeft: slot?.style.left || ''
      };
    })).not.toEqual({ ref: before.ref, slotLeft: before.slotLeft });
  });

  test('滑动验证通过但账号密码错误时不会卡住，可以重新验证', async ({ page }) => {
    await page.goto('/login');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');

    await frame.locator('#username').fill('admin');
    await frame.locator('#password').fill('Wrong@2026');
    await frame.locator('main').getByRole('button', { name: '登录' }).click();
    await expect(frame.locator('#captcha-modal')).toBeVisible();

    await dragCaptchaToGap(frame);

    await expect(frame.locator('#stitch-toast')).toContainText('用户名或密码错误');
    await expect(page).toHaveURL(/\/login$/);
    await expect(frame.locator('#captcha-modal')).toBeVisible();
    await expect(frame.locator('#captcha-modal .select-none')).toContainText('按住滑块拖动');
    await expect.poll(() => frame.locator('#captcha-modal [data-stitch-action="captcha-slider"]').evaluate((element) => {
      return (element as HTMLElement).style.transform;
    })).toBe('translateX(0px)');
  });

  test('安全验证失败重置后再次轻拖不会跳到最右侧', async ({ page }) => {
    await page.goto('/login');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 登录');

    await frame.locator('#username').fill('admin');
    await frame.locator('#password').fill('Admin@2026');
    await frame.locator('main').getByRole('button', { name: '登录' }).click();
    await expect(frame.locator('#captcha-modal')).toBeVisible();

    const slider = frame.locator('#captcha-modal [data-stitch-action="captcha-slider"]');
    const bar = slider.locator('xpath=..');
    const sliderBox = await slider.boundingBox();
    const barBox = await bar.boundingBox();
    expect(sliderBox, '找不到滑块位置').toBeTruthy();
    expect(barBox, '找不到滑轨位置').toBeTruthy();

    const startX = sliderBox!.x + sliderBox!.width / 2;
    const startY = sliderBox!.y + sliderBox!.height / 2;
    const wrongEndX = barBox!.x + barBox!.width - sliderBox!.width / 2 - 6;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(wrongEndX, startY, { steps: 8 });
    await page.mouse.up();
    await expect(frame.locator('#stitch-toast')).toContainText(/请(将拼图块|按住滑块)拖到图片缺口位置/);

    const resetBox = await slider.boundingBox();
    expect(resetBox, '找不到重置后的滑块位置').toBeTruthy();
    await page.mouse.move(resetBox!.x + resetBox!.width / 2, resetBox!.y + resetBox!.height / 2);
    await page.mouse.down();
    await page.mouse.move(resetBox!.x + resetBox!.width / 2 + 8, resetBox!.y + resetBox!.height / 2, { steps: 2 });

    const secondDragBox = await slider.boundingBox();
    expect(secondDragBox, '找不到二次轻拖后的滑块位置').toBeTruthy();
    expect(secondDragBox!.x).toBeLessThan(resetBox!.x + 32);
    await page.mouse.up();
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
    await expect(frame.locator('#stitch-action-panel')).toContainText('上传图片');
  });

  test('企业中心品牌图片可以真实上传、预览、保存并刷新保留', async ({ page }) => {
    await loginAs(page, 'COMPANY');
    await page.goto('/enterprise-center');
    let frame = await frameByTitle(page, '企业中心 - 资料维护');

    await frame.getByRole('button', { name: '更新品牌素材' }).click();
    await expect(frame.locator('#stitch-action-panel')).toContainText('选择图片文件');
    await frame.locator('[data-upload-input]').setInputFiles('public/assets/logo.png');
    await expect(frame.locator('[data-upload-preview]')).toHaveAttribute('src', /^data:image\//);
    await frame.locator('[data-upload-save]').click();
    await expect(frame.locator('#stitch-toast')).toContainText('图片上传成功');
    await expect.poll(() => frame.locator('main img').evaluateAll((images) => {
      return images.some((image) => (image as HTMLImageElement).src.startsWith('data:image/'));
    })).toBe(true);

    await page.reload({ waitUntil: 'domcontentloaded' });
    frame = await frameByTitle(page, '企业中心 - 资料维护');
    await expect.poll(() => frame.locator('main img').evaluateAll((images) => {
      return images.some((image) => (image as HTMLImageElement).src.startsWith('data:image/'));
    })).toBe(true);
  });

  test('上传非图片文件会被拒绝且不会显示占位提示', async ({ page }) => {
    await loginAs(page, 'COMPANY');
    await page.goto('/enterprise-center');
    const frame = await frameByTitle(page, '企业中心 - 资料维护');

    await frame.getByRole('button', { name: '更新品牌素材' }).click();
    await frame.locator('[data-upload-input]').setInputFiles('package.json');

    await expect(frame.locator('#stitch-toast')).toContainText('仅支持上传图片文件');
    await expect(frame.locator('#stitch-action-panel')).not.toContainText(/演示环境|正式环境|占位/);
  });

  test('个人中心头像图片可以上传并刷新保留', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center');
    let frame = await frameByTitle(page, '个人中心 - 基础信息');

    await frame.locator('button[data-stitch-action="upload"]').first().click();
    await expect(frame.locator('#stitch-action-panel')).toContainText('上传图片');
    await frame.locator('[data-upload-input]').setInputFiles('public/assets/logo.png');
    await frame.locator('[data-upload-save]').click();
    await expect(frame.locator('#stitch-toast')).toContainText('图片上传成功');
    await expect.poll(() => frame.locator('main img[alt="Avatar"]').evaluate((image) => {
      return (image as HTMLImageElement).src.startsWith('data:image/');
    })).toBe(true);

    await page.reload({ waitUntil: 'domcontentloaded' });
    frame = await frameByTitle(page, '个人中心 - 基础信息');
    await expect.poll(() => frame.locator('main img[alt="Avatar"]').evaluate((image) => {
      return (image as HTMLImageElement).src.startsWith('data:image/');
    })).toBe(true);
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

  test('个人中心基础资料保存后刷新仍然保留', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center');
    let frame = await frameByTitle(page, '个人中心 - 基础信息');

    await frame.evaluate(() => {
      const fillByLabel = (labelText: string, value: string) => {
        const group = Array.from(document.querySelectorAll('.space-y-2')).find((item) => {
          return item.querySelector('label')?.textContent?.replace(/\s+/g, ' ').trim() === labelText;
        });
        const field = group?.querySelector('input, textarea, select') as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
        if (field) {
          field.value = value;
          field.dispatchEvent(new Event('input', { bubbles: true }));
          field.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      fillByLabel('姓名', '李明');
      fillByLabel('求职意向', '项目经理');
      fillByLabel('所在城市', '北京');
      fillByLabel('电子邮箱', 'liming@example.com');
      fillByLabel('核心竞争力与职业亮点', '具备标准化项目治理和跨部门交付经验。');
    });

    await frame.getByRole('button', { name: '保存资料' }).click();
    await expect(frame.locator('#stitch-toast')).toContainText('保存成功，资料已保存到当前账号');

    await page.reload({ waitUntil: 'domcontentloaded' });
    frame = await frameByTitle(page, '个人中心 - 基础信息');
    await expect.poll(() => frame.evaluate(() => {
      return Array.from(document.querySelectorAll('input, textarea')).map((field) => {
        return (field as HTMLInputElement | HTMLTextAreaElement).value;
      });
    })).toEqual(expect.arrayContaining(['李明', '项目经理', '北京', 'liming@example.com']));
    await expect(frame.getByText('李明').first()).toBeVisible();
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

  test('个人中心项目经历菜单进入独立页面', async ({ page }) => {
    await loginAs(page, 'USER');
    await page.goto('/personal-center');
    const frame = await frameByTitle(page, '个人中心 - 基础信息');

    await frame.getByText('项目经历').click();

    await expect(page).toHaveURL(/\/personal-center\/project-experience$/);
    const projectFrame = await frameByTitle(page, '个人中心 - 项目经历');
    await expect(projectFrame.getByRole('heading', { name: '个人中心 - 项目经历' })).toBeVisible();
    await expect(projectFrame.getByRole('button', { name: '添加项目经历' })).toBeVisible();
  });

  test('退出登录会清理角色并回到公开首页', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.localStorage.setItem('USER_ROLE', 'ADMIN');
      document.cookie = 'USER_ROLE=ADMIN; path=/';
    });
    await page.goto('/personal-center');
    const frame = await frameByTitle(page, '个人中心 - 基础信息');

    await frame.getByText('退出登录').click();

    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('USER_ROLE'))).toBeNull();
  });

  test('未登录点击首页人才信息会进入登录提示页', async ({ page }) => {
    await page.goto('/');
    const frame = await frameByTitle(page, '全国项目管理标准化技术委员会 - 人才库 首页');

    await frame.getByText('人才信息').click();

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
    await frame.locator('#captcha-modal [data-stitch-action="captcha-slider"]').click();
    await expect(frame.locator('#stitch-toast')).toContainText('请按住滑块拖到图片缺口位置');
    await dragCaptchaToGap(frame);

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
    await dragCaptchaToGap(frame);
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
