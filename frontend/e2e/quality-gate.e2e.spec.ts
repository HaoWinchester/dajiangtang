import { expect, test, type Frame, type Page, type TestInfo } from '@playwright/test';

type Role = 'USER' | 'COMPANY' | 'ADMIN';

type StitchPage = {
  path: string;
  role?: Role;
  title: string;
};

const stitchPages: StitchPage[] = [
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
  { path: '/analytics', title: '数据分析', role: 'ADMIN' }
];

const viewports = [
  { name: 'desktop', width: 1366, height: 768 },
  { name: 'mobile', width: 390, height: 844 }
];

function originFrom(testInfo: TestInfo) {
  return new URL(testInfo.project.use.baseURL ?? 'http://127.0.0.1:5173').origin;
}

async function loginAs(page: Page, role: Role, testInfo: TestInfo) {
  await page.context().addCookies([
    {
      name: 'USER_ROLE',
      value: role,
      url: originFrom(testInfo)
    }
  ]);
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('USER_ROLE', userRole);
    document.cookie = `USER_ROLE=${userRole}; path=/`;
  }, role);
}

async function openStitchPage(page: Page, item: StitchPage, testInfo: TestInfo): Promise<Frame> {
  if (item.role) {
    await loginAs(page, item.role, testInfo);
  }

  await page.goto(item.path, { waitUntil: 'domcontentloaded' });
  const iframe = page.locator(`iframe[title="${item.title}"]`);
  await expect(iframe).toBeVisible();
  const handle = await iframe.elementHandle();
  const frame = await handle?.contentFrame();
  expect(frame, `找不到 iframe: ${item.title}`).toBeTruthy();
  await frame!.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(150);
  return frame!;
}

async function auditDocument(frame: Frame) {
  return frame.evaluate(() => {
    const visible = (element: Element) => {
      const html = element as HTMLElement;
      return Boolean(html.offsetWidth || html.offsetHeight || html.getClientRects().length);
    };
    const labelOf = (element: Element) => {
      return (element.textContent || element.getAttribute('aria-label') || element.outerHTML)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 120);
    };
    const insideHorizontalScroller = (element: Element) => {
      let current: Element | null = element.parentElement;
      while (current && current !== document.body) {
        const html = current as HTMLElement;
        const style = getComputedStyle(html);
        if (['auto', 'scroll'].includes(style.overflowX) && html.scrollWidth > html.clientWidth + 4) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    };
    const forbiddenActions = new Set(['feedback', 'details-panel', 'info']);
    const fallbackControls = Array.from(document.querySelectorAll('button, a'))
      .filter((control) => control instanceof HTMLElement && visible(control))
      .map((control) => {
        const element = control as HTMLElement;
        return {
          action: element.dataset.stitchAction || '',
          label: labelOf(element),
          tag: element.tagName.toLowerCase()
        };
      })
      .filter((control) => !control.action || forbiddenActions.has(control.action));

    const overflowElements = Array.from(document.body.querySelectorAll('*'))
      .filter((element) => element instanceof HTMLElement && visible(element))
      .flatMap((element) => {
        if (insideHorizontalScroller(element)) {
          return [];
        }

        const rect = element.getBoundingClientRect();
        const overflowLeft = rect.left < -4;
        const overflowRight = rect.right > window.innerWidth + 4;
        if (!overflowLeft && !overflowRight) {
          return [];
        }

        return [{
          label: labelOf(element),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          tag: element.tagName.toLowerCase(),
          viewport: window.innerWidth
        }];
      })
      .slice(0, 8);

    return {
      fallbackControls,
      overflowElements,
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    };
  });
}

test('真实用户巡检：核心页面无运行时错误、兜底动作和明显横向溢出', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const runtimeErrors: string[] = [];
  let activePage = '';

  page.on('pageerror', (error) => {
    runtimeErrors.push(`${activePage}: ${error.message}`);
  });
  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    const text = message.text();
    if (/Failed to load resource: net::ERR_FAILED|favicon/i.test(text)) {
      return;
    }

    runtimeErrors.push(`${activePage}: ${text}`);
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    const resourceType = request.resourceType();
    if (/favicon/i.test(url) || !['document', 'script', 'stylesheet', 'xhr', 'fetch'].includes(resourceType)) {
      return;
    }

    runtimeErrors.push(`${activePage}: ${resourceType} ${url} ${request.failure()?.errorText ?? 'request failed'}`);
  });

  const failures: string[] = [];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const item of stitchPages) {
      activePage = `${viewport.name} ${item.path}`;
      const frame = await openStitchPage(page, item, testInfo);
      const audit = await auditDocument(frame);

      if (audit.fallbackControls.length > 0) {
        failures.push(
          `${activePage} 存在兜底/未绑定控件: ${audit.fallbackControls
            .map((control) => `${control.tag}[${control.action || '未绑定'}] ${control.label}`)
            .join(' | ')}`
        );
      }

      if (audit.scrollWidth > audit.viewportWidth + 4 || audit.overflowElements.length > 0) {
        failures.push(
          `${activePage} 存在横向溢出: scrollWidth=${audit.scrollWidth}, viewport=${audit.viewportWidth}, elements=${JSON.stringify(audit.overflowElements)}`
        );
      }
    }
  }

  expect(runtimeErrors).toEqual([]);
  expect(failures).toEqual([]);
});

test('所有 Stitch 页面图片资源都使用本地路径', async ({ page }, testInfo) => {
  const failures: string[] = [];

  for (const item of stitchPages) {
    const frame = await openStitchPage(page, item, testInfo);
    const remoteImages = await frame.evaluate(() => {
      const imageSources = Array.from(document.images)
        .map((image) => image.getAttribute('src') || '')
        .filter((src) => /^https?:\/\//i.test(src));

      const inlineBackgrounds = Array.from(document.querySelectorAll<HTMLElement>('[style*="background-image"]'))
        .map((element) => element.getAttribute('style') || '')
        .filter((style) => /background-image:\s*url\(['"]?https?:\/\//i.test(style));

      return [...imageSources, ...inlineBackgrounds];
    });

    if (remoteImages.length > 0) {
      failures.push(`${item.path}: ${remoteImages.join(' | ')}`);
    }
  }

  expect(failures).toEqual([]);
});

test('首页招聘卡片只使用后端接口数据，不展示 code.html 静态岗位示例', async ({ page }, testInfo) => {
  const homeItems = [
    {
      id: 'rec-db-only',
      position: '数据库同步岗位',
      salary: '26k-39k',
      companyName: '客户部署数据库公司',
      city: '北京市',
      owner: '赵义民',
      headcount: 2,
      cspmPreferred: true
    }
  ];

  let apiCalled = false;
  await page.route('**/api/home/recruitments', async (route) => {
    apiCalled = true;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(homeItems)
    });
  });

  const frame = await openStitchPage(page, { path: '/', title: '项目管理人才库 首页' }, testInfo);

  await expect(frame.getByRole('heading', { name: '数据库同步岗位' })).toBeVisible();
  await expect(frame.getByText('客户部署数据库公司')).toBeVisible();
  await expect(frame.getByText('北京市')).toBeVisible();
  await expect(frame.getByText('赵义民')).toBeVisible();

  const mainText = await frame.locator('main').innerText();
  expect(apiCalled).toBe(true);
  expect(mainText).not.toMatch(/高级项目架构师|首席数据科学家|云解决方案专家|全球HR总监|DevOps 工程师/);
});
