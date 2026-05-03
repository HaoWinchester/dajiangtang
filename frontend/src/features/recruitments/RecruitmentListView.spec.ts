import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RecruitmentListView from './RecruitmentListView.vue';
import type { RecruitmentListResponse } from './types';

const listResponse = (overrides: Partial<RecruitmentListResponse> = {}): RecruitmentListResponse => ({
  items: [
    {
      id: 'rec-001',
      position: '项目经理',
      salary: '15k-25k',
      companyName: '北京示例科技有限公司',
      city: '北京市',
      owner: '赵义民',
      headcount: 3,
      contactPhone: '13800000000',
      detailAddress: '北京市海淀区测试路 1 号'
    } as unknown as RecruitmentListResponse['items'][number]
  ],
  page: 1,
  pageSize: 10,
  totalItems: 1,
  totalPages: 1,
  canCreate: false,
  ...overrides
});

function jsonResponse(body: RecruitmentListResponse): Response {
  return {
    ok: true,
    json: async () => body
  } as Response;
}

function mountView(routerPush = vi.fn()) {
  return mount(RecruitmentListView, {
    global: {
      mocks: {
        $router: {
          push: routerPush
        }
      },
      stubs: {
        RouterLink: {
          props: ['to'],
          template: `<a data-test="router-link" :data-to-name="to.name" :data-to-id="to.params?.id || ''"><slot /></a>`
        }
      }
    }
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('RecruitmentListView', () => {
  it('renders the required recruitment columns and loading state', async () => {
    let resolveFetch: (response: Response) => void = () => {};
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal('fetch', vi.fn(() => pendingFetch));

    const wrapper = mountView();
    await nextTick();

    expect(wrapper.text()).toContain('正在加载招聘信息');

    resolveFetch(jsonResponse(listResponse()));
    await flushPromises();

    const headers = wrapper.findAll('th').map((header) => header.text());
    expect(headers).toEqual(['岗位', '薪资', '公司名称', '城市', '负责人', '需求人数']);
    expect(wrapper.text()).toContain('项目经理');
    expect(wrapper.text()).toContain('15k-25k');
    expect(wrapper.text()).toContain('北京示例科技有限公司');
    expect(wrapper.text()).toContain('北京市');
    expect(wrapper.text()).toContain('赵义民');
    expect(wrapper.text()).toContain('3');
  });

  it('renders the position field in the first data row', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.findAll('tbody td')[0].text()).toBe('项目经理');
  });

  it('links each recruitment position to its detail route', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    const link = wrapper
      .findAll('[data-test="router-link"]')
      .find((candidate) => candidate.attributes('data-to-name') === 'recruitment-detail');
    if (!link) {
      throw new Error('未找到招聘详情链接');
    }
    expect(link.text()).toBe('项目经理');
    expect(link.attributes('data-to-name')).toBe('recruitment-detail');
    expect(link.attributes('data-to-id')).toBe('rec-001');
  });

  it('opens the matching detail route when clicking a recruitment row', async () => {
    const routerPush = vi.fn();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView(routerPush);
    await flushPromises();
    await wrapper.find('tbody tr').trigger('click');

    expect(routerPush).toHaveBeenCalledWith({
      name: 'recruitment-detail',
      params: { id: 'rec-001' }
    });
  });

  it('renders the salary field in the first data row', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.findAll('tbody td')[1].text()).toBe('15k-25k');
  });

  it('renders the company name field in the first data row', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.findAll('tbody td')[2].text()).toBe('北京示例科技有限公司');
  });

  it('renders the city field in the first data row', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.findAll('tbody td')[3].text()).toBe('北京市');
  });

  it('renders the owner field in the first data row', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.findAll('tbody td')[4].text()).toBe('赵义民');
  });

  it('renders the headcount field in the first data row', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.findAll('tbody td')[5].text()).toBe('3');
  });

  it('renders one table row for each recruitment item', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          listResponse({
            items: [
              listResponse().items[0],
              {
                id: 'rec-002',
                position: 'Java 后端工程师',
                salary: '20k-35k',
                companyName: '上海云启软件有限公司',
                city: '上海市',
                owner: '钱启航',
                headcount: 5
              }
            ],
            totalItems: 2
          })
        )
      )
    );

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
  });

  it('renders current range text from pagination metadata', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          listResponse({
            page: 2,
            totalItems: 13,
            totalPages: 2
          })
        )
      )
    );

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain('11-13 / 共 13 条');
  });

  it('renders zero range text when list is empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(listResponse({ items: [], totalItems: 0, totalPages: 0 })))
    );

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain('暂无匹配的招聘信息');
    expect(wrapper.text()).not.toContain('共 0 条');
  });

  it('does not render detail-only fields returned by the backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).not.toContain('13800000000');
    expect(wrapper.text()).not.toContain('北京市海淀区测试路 1 号');
  });
});
