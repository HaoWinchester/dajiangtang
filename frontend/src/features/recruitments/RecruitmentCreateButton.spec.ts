import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RecruitmentListView from './RecruitmentListView.vue';
import type { RecruitmentListResponse } from './types';

function response(canCreate: boolean): RecruitmentListResponse {
  return {
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
    canCreate
  };
}

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
          template: '<a data-test="router-link" :data-route-name="to.name"><slot /></a>'
        }
      }
    }
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Recruitment create button permission', () => {
  it('shows the create button and route target when canCreate is true', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(response(true))));

    const wrapper = mountView();
    await flushPromises();

    const createLink = wrapper.find('[data-route-name="recruitment-create"]');
    expect(createLink.exists()).toBe(true);
    expect(createLink.text()).toBe('新增');
  });

  it('hides the create button when canCreate is false', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(response(false))));

    const wrapper = mountView();
    await flushPromises();

    expect(wrapper.find('[data-route-name="recruitment-create"]').exists()).toBe(false);
    expect(wrapper.text()).not.toContain('新增');
  });
});
