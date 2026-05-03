import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://lh3.googleusercontent.com/**', async (route) => {
    await route.abort();
  });
});

const defaultItems = [
  {
    id: 'rec-001',
    position: '项目经理',
    salary: '15k-25k',
    companyName: '北京示例科技有限公司',
    city: '北京市',
    owner: '赵义民',
    headcount: 3,
    contactPhone: '13800000000',
    jobDescription: '详情字段不应出现在列表'
  },
  {
    id: 'rec-002',
    position: 'Java 后端工程师',
    salary: '20k-35k',
    companyName: '上海云启软件有限公司',
    city: '上海市',
    owner: '钱启航',
    headcount: 5
  }
];

function response(overrides: Record<string, unknown> = {}) {
  return {
    items: defaultItems,
    page: 1,
    pageSize: 10,
    totalItems: defaultItems.length,
    totalPages: 1,
    canCreate: false,
    ...overrides
  };
}

async function loginAs(page: Page, role: 'ADMIN' | 'USER' | 'COMPANY') {
  await page.addInitScript((userRole) => {
    window.localStorage.setItem('USER_ROLE', userRole);
  }, role);
}

async function mockRecruitments(page: Page) {
  await page.route('**/api/recruitments**', async (route) => {
    const url = new URL(route.request().url());
    const role = await page.evaluate(() => window.localStorage.getItem('USER_ROLE'));
    const positionKeyword = url.searchParams.get('positionKeyword');
    const city = url.searchParams.get('city');
    const requestedPage = Number(url.searchParams.get('page') ?? '1');

    if (positionKeyword === '错误') {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: '招聘信息加载失败，请稍后重试。' })
      });
      return;
    }

    if (positionKeyword === '不存在' || city === '不存在城市') {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(response({ items: [], totalItems: 0, totalPages: 0, canCreate: role === 'ADMIN' }))
      });
      return;
    }

    if (requestedPage === 2) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(
          response({
            items: [
              {
                id: 'rec-011',
                position: '客户成功经理',
                salary: '12k-22k',
                companyName: '深圳企服科技有限公司',
                city: '深圳市',
                owner: '何念',
                headcount: 3
              }
            ],
            page: 2,
            totalItems: 11,
            totalPages: 2,
            canCreate: role === 'ADMIN'
          })
        )
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(response({ totalItems: 11, totalPages: 2, canCreate: role === 'ADMIN' }))
    });
  });
}

test('未登录访问招聘列表会进入登录提示页', async ({ page }) => {
  await page.goto('/recruitments');

  await expect(page.getByRole('heading', { name: '请先登录后查看招聘信息' })).toBeVisible();
  await expect(page.getByText('招聘信息、人才信息与企业资料属于平台内部业务数据')).toBeVisible();
  await expect(page.getByRole('banner').getByText('项目管理人才库')).toBeVisible();
  await expect(page.getByRole('contentinfo').getByText('项目管理人才库', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('企业中心')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('个人中心')).toHaveCount(0);
});

test('未登录访问人才信息会进入登录提示页', async ({ page }) => {
  await page.goto('/personal-center');

  await expect(page).toHaveURL(/\/login-required$/);
  await expect(page.getByRole('heading', { name: '请先登录后查看招聘信息' })).toBeVisible();
});

test('根路径会展示公开首页和脱敏招聘信息', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const design = page.frameLocator('iframe[title="项目管理人才库 首页"]');

  await expect(design.getByRole('heading', { name: '发现战略性人才' })).toBeVisible({ timeout: 10_000 });
  await expect(design.getByText('招聘信息')).toBeVisible();
  await expect(design.getByText('人才洞察')).toBeVisible();
});

test('登录页会百分百承载 Stitch 登录设计', async ({ page }) => {
  await page.goto('/login');
  const design = page.frameLocator('iframe[title="项目管理人才库 登录"]');

  await expect(design.getByRole('heading', { name: '欢迎回来' })).toBeVisible();
  await expect(design.locator('main').getByRole('button', { name: '立即登录', exact: true })).toBeVisible();
});

test('注册页会百分百承载 Stitch 注册设计', async ({ page }) => {
  await page.goto('/register');
  const design = page.frameLocator('iframe[title="项目管理人才库 注册"]');

  await expect(design.getByRole('heading', { name: '创建新账号' })).toBeVisible();
  await expect(design.getByText('个人注册')).toBeVisible();
  await expect(design.getByText('企业注册')).toBeVisible();
});

test('企业中心会承载 Stitch 企业资料维护设计', async ({ page }) => {
  await loginAs(page, 'COMPANY');
  await page.goto('/enterprise-center');
  const design = page.frameLocator('iframe[title="企业中心 - 资料维护"]');

  await expect(design.getByRole('heading', { name: '企业中心 - 基础资料' })).toBeVisible();
  await expect(design.getByText('核心身份')).toBeVisible();
});

test('个人中心会承载 Stitch 基础信息设计', async ({ page }) => {
  await loginAs(page, 'USER');
  await page.goto('/personal-center');
  const design = page.frameLocator('iframe[title="个人中心 - 基础信息"]');

  await expect(design.getByRole('heading', { name: '个人基本信息' })).toBeVisible();
  await expect(design.getByText('个人优势')).toBeVisible();
});

test('工作经历页会承载 Stitch 工作经历设计', async ({ page }) => {
  await loginAs(page, 'USER');
  await page.goto('/personal-center/work-experience');
  const design = page.frameLocator('iframe[title="个人中心 - 工作经历"]');

  await expect(design.getByRole('heading', { name: '工作经历' })).toBeVisible();
  await expect(design.getByText('暂无工作经历')).toBeVisible();
  await expect(design.getByText('领导企业级 项目管理人才库招聘平台的架构设计')).toHaveCount(0);
});

test('管理员能看到招聘列表必需字段和新增按钮', async ({ page }) => {
  await loginAs(page, 'ADMIN');
  await mockRecruitments(page);

  await page.goto('/recruitments');

  await expect(page.getByRole('banner').getByText('项目管理人才库')).toBeVisible();
  await expect(page.getByRole('contentinfo').getByText('Cookie 政策')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('新增招聘')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('企业中心')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('个人中心')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '招聘信息列表' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '岗位' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '薪资' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '公司名称' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '城市' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '负责人' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: '需求人数' })).toBeVisible();
  await expect(page.getByRole('link', { name: '新增', exact: true })).toBeVisible();
});

test('前端接口请求会把本地角色标记透传给后端', async ({ page }) => {
  await loginAs(page, 'ADMIN');
  await mockRecruitments(page);

  const requestPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/recruitments'
      && request.headers()['x-user-role'] === 'ADMIN';
  });
  await page.goto('/recruitments');

  await requestPromise;
});

test('普通用户能看列表但看不到新增按钮', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');

  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('个人中心')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('企业中心')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('新增招聘')).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByText('帮助中心')).toBeVisible();
  await expect(page.getByText('项目经理')).toBeVisible();
  await expect(page.getByRole('link', { name: '新增' })).toHaveCount(0);
});

test('企业用户能看列表但看不到新增按钮', async ({ page }) => {
  await loginAs(page, 'COMPANY');
  await mockRecruitments(page);

  await page.goto('/recruitments');

  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('企业中心')).toBeVisible();
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('个人中心')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '主要导航' }).getByText('新增招聘')).toHaveCount(0);
  await expect(page.getByRole('contentinfo').getByText('系统状态')).toBeVisible();
  await expect(page.getByText('项目经理')).toBeVisible();
  await expect(page.getByRole('link', { name: '新增' })).toHaveCount(0);
});

test('管理员点击新增按钮能进入新增入口', async ({ page }) => {
  await loginAs(page, 'ADMIN');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByRole('link', { name: '新增', exact: true }).click();

  await expect(page).toHaveURL(/\/recruitments\/new$/);
  await expect(page.getByRole('heading', { name: '招聘新增入口' })).toBeVisible();
});

test('普通用户直访新增入口会被重定向回招聘列表', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments/new');

  await expect(page).toHaveURL(/\/recruitments$/);
  await expect(page.getByRole('heading', { name: '招聘信息列表' })).toBeVisible();
});

test('企业用户直访新增入口会被重定向回招聘列表', async ({ page }) => {
  await loginAs(page, 'COMPANY');
  await mockRecruitments(page);

  await page.goto('/recruitments/new');

  await expect(page).toHaveURL(/\/recruitments$/);
  await expect(page.getByRole('heading', { name: '招聘信息列表' })).toBeVisible();
});

test('列表页面不展示后端返回的联系电话和详情字段', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');

  await expect(page.getByText('13800000000')).toHaveCount(0);
  await expect(page.getByText('详情字段不应出现在列表')).toHaveCount(0);
});

test('点击招聘列表中的岗位行会进入对应详情页', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByRole('link', { name: '项目经理' }).click();

  await expect(page).toHaveURL(/\/recruitments\/rec-001$/);
  const design = page.frameLocator('iframe[title="招聘信息 - 详情"]');
  await expect(design.getByRole('heading', { name: '高级项目管理专家 (Senior PMO)' })).toBeVisible();
});

test('点击招聘列表行内非链接区域也会进入对应详情页', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByRole('cell', { name: '北京示例科技有限公司' }).click();

  await expect(page).toHaveURL(/\/recruitments\/rec-001$/);
});

test('岗位和城市组合搜索会刷新列表并携带查询条件', async ({ page }) => {
  await loginAs(page, 'ADMIN');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByLabel('岗位').fill('Java');
  await page.getByLabel('城市').fill('上海市');

  const requestPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/recruitments'
      && url.searchParams.get('positionKeyword') === 'Java'
      && url.searchParams.get('city') === '上海市'
      && url.searchParams.get('page') === '1'
      && url.searchParams.get('pageSize') === '10';
  });
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await requestPromise;

  await expect(page.getByText('Java 后端工程师')).toBeVisible();
});

test('城市支持模糊搜索，输入北京能搜到北京市岗位', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByLabel('城市').fill('北京');

  const requestPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/recruitments'
      && url.searchParams.get('city') === '北京'
      && url.searchParams.get('page') === '1'
      && url.searchParams.get('pageSize') === '10';
  });
  await page.getByRole('button', { name: '搜索', exact: true }).click();
  await requestPromise;

  await expect(page.getByText('项目经理')).toBeVisible();
  await expect(page.getByText('北京市')).toBeVisible();
});

test('清空搜索会清掉两个输入框并回到第一页默认查询', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByLabel('岗位').fill('Java');
  await page.getByLabel('城市').fill('上海市');

  const requestPromise = page.waitForRequest((request) => {
    const url = new URL(request.url());
    return url.pathname === '/api/recruitments'
      && !url.searchParams.has('positionKeyword')
      && !url.searchParams.has('city')
      && url.searchParams.get('page') === '1';
  });
  await page.getByRole('button', { name: '清空搜索' }).click();
  await requestPromise;

  await expect(page.getByLabel('岗位')).toHaveValue('');
  await expect(page.getByLabel('城市')).toHaveValue('');
});

test('下一页会请求第二页并展示分页范围', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByRole('button', { name: '下一页' }).click();

  await expect(page.getByText('客户成功经理')).toBeVisible();
  await expect(page.getByText('11-11 / 共 11 条')).toBeVisible();
  await expect(page.getByText('第 2 / 2 页')).toBeVisible();
});

test('没有匹配结果时展示空状态', async ({ page }) => {
  await loginAs(page, 'USER');
  await mockRecruitments(page);

  await page.goto('/recruitments');
  await page.getByLabel('岗位').fill('不存在');
  await page.getByRole('button', { name: '搜索', exact: true }).click();

  await expect(page.getByText('暂无匹配的招聘信息')).toBeVisible();
  await expect(page.getByText('请调整岗位或城市条件后再试。')).toBeVisible();
});

test('加载失败时展示错误并允许重试', async ({ page }) => {
  await loginAs(page, 'USER');
  let failNext = true;
  await page.route('**/api/recruitments**', async (route) => {
    if (failNext) {
      failNext = false;
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: '招聘信息加载失败，请稍后重试。' })
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(response())
    });
  });

  await page.goto('/recruitments');
  await expect(page.getByText('招聘信息加载失败，请稍后重试。')).toBeVisible();
  await page.getByRole('button', { name: '重试' }).click();

  await expect(page.getByText('项目经理')).toBeVisible();
});
