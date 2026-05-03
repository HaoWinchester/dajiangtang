import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RecruitmentListView from './RecruitmentListView.vue';
import type { RecruitmentListResponse } from './types';

const response = (overrides: Partial<RecruitmentListResponse> = {}): RecruitmentListResponse => ({
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
  canCreate: false,
  ...overrides
});

function jsonResponse(body: RecruitmentListResponse): Response {
  return {
    ok: true,
    json: async () => body
  } as Response;
}

function mountView() {
  return mount(RecruitmentListView, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a data-test="router-link"><slot /></a>'
        }
      }
    }
  });
}

function findButton(wrapper: ReturnType<typeof mountView>, text: string) {
  const button = wrapper.findAll('button').find((candidate) => candidate.text() === text);
  expect(button).toBeTruthy();
  return button!;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Recruitment search and pagination', () => {
  it('searches by position and city and updates results within 2 seconds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(response()))
      .mockResolvedValueOnce(
        jsonResponse(
          response({
            items: [
              {
                id: 'rec-002',
                position: '前端工程师',
                salary: '20k-30k',
                companyName: '上海示例网络有限公司',
                city: '上海市',
                owner: '钱明',
                headcount: 2
              }
            ]
          })
        )
      );
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="positionKeyword"]').setValue('前端');
    await wrapper.find('input[name="city"]').setValue('上海市');

    const startedAt = performance.now();
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    const elapsed = performance.now() - startedAt;

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/recruitments?positionKeyword=%E5%89%8D%E7%AB%AF&city=%E4%B8%8A%E6%B5%B7%E5%B8%82&page=1&pageSize=10',
      expect.objectContaining({ credentials: 'include' })
    );
    expect(wrapper.text()).toContain('前端工程师');
    expect(wrapper.text()).not.toContain('项目经理');
    expect(elapsed).toBeLessThan(2000);
  });

  it('trims search form values before submitting', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(response()))
      .mockResolvedValueOnce(jsonResponse(response()));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="positionKeyword"]').setValue('  Java  ');
    await wrapper.find('input[name="city"]').setValue('  上海市  ');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/recruitments?positionKeyword=Java&city=%E4%B8%8A%E6%B5%B7%E5%B8%82&page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('resets to page 1 when submitting a new search after pagination', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responseWithPages(1, 2))
      .mockResolvedValueOnce(responseWithPages(2, 2))
      .mockResolvedValueOnce(jsonResponse(response()));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await findButton(wrapper, '下一页').trigger('click');
    await flushPromises();

    await wrapper.find('input[name="positionKeyword"]').setValue('产品');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/recruitments?positionKeyword=%E4%BA%A7%E5%93%81&page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('keeps typed form values after search results load', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(response()))
      .mockResolvedValueOnce(jsonResponse(response()));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="positionKeyword"]').setValue('Java');
    await wrapper.find('input[name="city"]').setValue('上海市');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect((wrapper.find('input[name="positionKeyword"]').element as HTMLInputElement).value).toBe('Java');
    expect((wrapper.find('input[name="city"]').element as HTMLInputElement).value).toBe('上海市');
  });

  it('clears search conditions and restores the default first page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(response()))
      .mockResolvedValueOnce(jsonResponse(response({ items: [], totalItems: 0, totalPages: 0 })))
      .mockResolvedValueOnce(jsonResponse(response()));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="positionKeyword"]').setValue('产品');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    await findButton(wrapper, '清空搜索').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/recruitments?page=1&pageSize=10',
      expect.any(Object)
    );
    expect((wrapper.find('input[name="positionKeyword"]').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[name="city"]').element as HTMLInputElement).value).toBe('');
  });

  it('clears both filters even when only city was filled', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(response()))
      .mockResolvedValueOnce(jsonResponse(response()));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="city"]').setValue('北京市');
    await findButton(wrapper, '清空搜索').trigger('click');
    await flushPromises();

    expect((wrapper.find('input[name="positionKeyword"]').element as HTMLInputElement).value).toBe('');
    expect((wrapper.find('input[name="city"]').element as HTMLInputElement).value).toBe('');
    expect(fetchMock).toHaveBeenLastCalledWith('/api/recruitments?page=1&pageSize=10', expect.any(Object));
  });

  it('requests the next page with the default page size', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          response({
            page: 1,
            totalItems: 12,
            totalPages: 2
          })
        )
      )
      .mockResolvedValueOnce(
        jsonResponse(
          response({
            page: 2,
            totalItems: 12,
            totalPages: 2,
            items: [
              {
                id: 'rec-012',
                position: '实施顾问',
                salary: '12k-18k',
                companyName: '杭州示例咨询有限公司',
                city: '杭州市',
                owner: '孙岚',
                headcount: 1
              }
            ]
          })
        )
      );
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await findButton(wrapper, '下一页').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith('/api/recruitments?page=2&pageSize=10', expect.any(Object));
    expect(wrapper.text()).toContain('实施顾问');
    expect(wrapper.text()).toContain('第 2 / 2 页');
  });

  it('changes the page size and reloads the first page', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responseWithPages(1, 4, 10, 40))
      .mockResolvedValueOnce(responseWithPages(1, 2, 20, 40));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('select[name="pageSize"]').setValue('20');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith('/api/recruitments?page=1&pageSize=20', expect.any(Object));
    expect(wrapper.text()).toContain('第 1 / 2 页');
    expect(wrapper.text()).toContain('1-20 / 共 40 条');
  });

  it('jumps to an entered page using the active filters and page size', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responseWithPages(1, 3, 10, 30))
      .mockResolvedValueOnce(responseWithPages(1, 3, 10, 30))
      .mockResolvedValueOnce(responseWithPages(1, 2, 20, 30))
      .mockResolvedValueOnce(responseWithPages(2, 2, 20, 30));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="positionKeyword"]').setValue('项目');
    await wrapper.find('.search-form').trigger('submit');
    await flushPromises();
    await wrapper.find('select[name="pageSize"]').setValue('20');
    await flushPromises();
    await wrapper.find('input[name="jumpPage"]').setValue('2');
    await wrapper.find('form[aria-label="招聘页码跳转"]').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/recruitments?positionKeyword=%E9%A1%B9%E7%9B%AE&page=2&pageSize=20',
      expect.any(Object)
    );
    expect(wrapper.text()).toContain('第 2 / 2 页');
  });

  it('rejects invalid jump pages without sending another request', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(responseWithPages(1, 2, 10, 12));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="jumpPage"]').setValue('9');
    await wrapper.find('form[aria-label="招聘页码跳转"]').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('请输入 1-2 之间的页码');
  });

  it('requests the previous page with the active search filters', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responseWithPages(1, 2))
      .mockResolvedValueOnce(responseWithPages(2, 2))
      .mockResolvedValueOnce(responseWithPages(1, 2));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await wrapper.find('input[name="positionKeyword"]').setValue('Java');
    await wrapper.find('form').trigger('submit');
    await flushPromises();
    await findButton(wrapper, '上一页').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/recruitments?positionKeyword=Java&page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('disables the previous button on the first page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseWithPages(1, 2)));

    const wrapper = mountView();
    await flushPromises();

    expect(findButton(wrapper, '上一页').attributes('disabled')).toBeDefined();
  });

  it('enables the next button when another page exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseWithPages(1, 2)));

    const wrapper = mountView();
    await flushPromises();

    expect(findButton(wrapper, '下一页').attributes('disabled')).toBeUndefined();
  });

  it('disables the next button on the last page', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responseWithPages(2, 2)));

    const wrapper = mountView();
    await flushPromises();

    expect(findButton(wrapper, '下一页').attributes('disabled')).toBeDefined();
  });

  it('disables search and clear buttons while loading', async () => {
    let resolveFetch: (response: Response) => void = () => {};
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.stubGlobal('fetch', vi.fn(() => pendingFetch));

    const wrapper = mountView();
    await flushPromises();

    expect(findButton(wrapper, '搜索').attributes('disabled')).toBeDefined();
    expect(findButton(wrapper, '清空搜索').attributes('disabled')).toBeDefined();

    resolveFetch(jsonResponse(response()));
  });

  it('shows an empty state when no recruitments match', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(response({ items: [], totalItems: 0, totalPages: 0 })))
    );

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain('暂无匹配的招聘信息');
    expect(wrapper.find('table').exists()).toBe(false);
  });

  it('shows the empty state guidance copy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(response({ items: [], totalItems: 0, totalPages: 0 })))
    );

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain('请调整岗位或城市条件后再试。');
  });

  it('shows an error state and retries the current request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '招聘信息加载失败，请稍后重试。' })
      } as Response)
      .mockResolvedValueOnce(jsonResponse(response()));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).toContain('招聘信息加载失败，请稍后重试。');

    await findButton(wrapper, '重试').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('项目经理');
  });

  it('keeps the current requested page when retrying a failed pagination request', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responseWithPages(1, 2))
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '招聘信息加载失败，请稍后重试。' })
      } as Response)
      .mockResolvedValueOnce(responseWithPages(2, 2));
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await flushPromises();

    await findButton(wrapper, '下一页').trigger('click');
    await flushPromises();
    await findButton(wrapper, '重试').trigger('click');
    await flushPromises();

    expect(fetchMock).toHaveBeenLastCalledWith('/api/recruitments?page=2&pageSize=10', expect.any(Object));
  });
});

function responseWithPages(page: number, totalPages: number, pageSize = 10, totalItems = 12): Promise<Response> {
  return Promise.resolve(
    jsonResponse(
      response({
        page,
        pageSize,
        totalItems,
        totalPages,
        items: [
          {
            id: `rec-page-${page}`,
            position: page === 1 ? '项目经理' : '实施顾问',
            salary: '12k-18k',
            companyName: '杭州示例咨询有限公司',
            city: '杭州市',
            owner: '孙岚',
            headcount: 1
          }
        ]
      })
    )
  );
}
