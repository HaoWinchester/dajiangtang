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

  it('does not render detail-only fields returned by the backend', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(listResponse())));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.text()).not.toContain('13800000000');
    expect(wrapper.text()).not.toContain('北京市海淀区测试路 1 号');
  });
});
