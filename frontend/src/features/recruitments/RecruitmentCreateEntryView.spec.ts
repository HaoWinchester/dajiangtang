import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import RecruitmentCreateEntryView from './RecruitmentCreateEntryView.vue';

const routerPush = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush
  }),
  RouterLink: {
    props: ['to'],
    template: '<a><slot /></a>'
  }
}));

function mountView() {
  return mount(RecruitmentCreateEntryView, {
    global: {
      stubs: {
        RouterLink: {
          props: ['to'],
          template: '<a><slot /></a>'
        }
      }
    }
  });
}

function okResponse() {
  return {
    ok: true,
    json: async () => ({
      id: 'rec-created',
      message: '招聘信息已新增。',
      recruitment: {
        id: 'rec-created',
        position: 'CSPM 项目经理'
      }
    })
  } as Response;
}

async function fillValidForm(wrapper: ReturnType<typeof mountView>) {
  await wrapper.find('input[name="position"]').setValue('CSPM 项目经理');
  await wrapper.find('input[name="companyName"]').setValue('北京闭环科技有限公司');
  await wrapper.find('input[name="department"]').setValue('项目交付部');
  await wrapper.find('input[name="recruitmentPost"]').setValue('项目经理');
  await wrapper.find('input[name="jobTags"]').setValue('CSPM优先,重点岗位');
  await wrapper.find('input[name="headcount"]').setValue('2');
  await wrapper.find('input[name="city"]').setValue('北京市');
  await wrapper.find('input[name="workLocation"]').setValue('北京市海淀区');
  await wrapper.find('input[name="salary"]').setValue('20k-35k');
  await wrapper.find('input[name="requiredArrivalDate"]').setValue('2026-06-30');
  await wrapper.find('select[name="recruitmentProgress"]').setValue('紧急启动');
  await wrapper.find('input[name="owner"]').setValue('赵义民');
  await wrapper.find('input[name="contactPhone"]').setValue('13800000000');
  await wrapper.find('textarea[name="jobDescription"]').setValue('负责平台项目交付。');
  await wrapper.find('textarea[name="jobRequirement"]').setValue('具备项目管理经验。');
  await wrapper.find('textarea[name="skillRequirement"]').setValue('项目计划,风险管理');
  await wrapper.find('textarea[name="welfare"]').setValue('五险一金');
  await wrapper.find('input[name="follower"]').setValue('贺强');
  await wrapper.find('input[name="level"]').setValue('P4');
  await wrapper.find('textarea[name="remark"]').setValue('新增闭环测试');
  await wrapper.find('input[name="cspmPreferred"]').setValue(true);
}

afterEach(() => {
  routerPush.mockReset();
  vi.unstubAllGlobals();
  localStorage.removeItem('USER_ROLE');
});

describe('RecruitmentCreateEntryView', () => {
  it('renders all fields required by the recruitment create workflow', () => {
    const wrapper = mountView();

    [
      'position',
      'companyName',
      'department',
      'recruitmentPost',
      'jobTags',
      'headcount',
      'city',
      'workLocation',
      'salary',
      'requiredArrivalDate',
      'recruitmentProgress',
      'owner',
      'contactPhone',
      'jobDescription',
      'jobRequirement',
      'skillRequirement',
      'welfare',
      'follower',
      'level',
      'remark',
      'cspmPreferred'
    ].forEach((name) => {
      expect(wrapper.find(`[name="${name}"]`).exists()).toBe(true);
    });
  });

  it('validates required fields before sending a request', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await wrapper.find('form').trigger('submit');

    expect(fetchMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('请填写岗位名称。');
  });

  it('submits the form and opens the created recruitment detail page', async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse());
    localStorage.setItem('USER_ROLE', 'ADMIN');
    vi.stubGlobal('fetch', fetchMock);

    const wrapper = mountView();
    await fillValidForm(wrapper);
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"position":"CSPM 项目经理"')
      })
    );
    expect(routerPush).toHaveBeenCalledWith({
      name: 'recruitment-detail',
      params: { id: 'rec-created' }
    });
  });

  it('keeps the user on the form when backend creation fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: '只有管理员可以新增招聘信息。' })
      } as Response)
    );

    const wrapper = mountView();
    await fillValidForm(wrapper);
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('只有管理员可以新增招聘信息。');
    expect(routerPush).not.toHaveBeenCalled();
  });

  it('returns to recruitment list when cancelling', async () => {
    const wrapper = mountView();
    await wrapper.get('button[type="button"]').trigger('click');

    expect(routerPush).toHaveBeenCalledWith({ name: 'recruitments' });
  });
});
