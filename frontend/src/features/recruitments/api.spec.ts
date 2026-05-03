import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRecruitment, fetchRecruitmentDetail, fetchRecruitments } from './api';
import type { RecruitmentCreatePayload, RecruitmentListResponse } from './types';

const okResponse: RecruitmentListResponse = {
  items: [],
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  canCreate: false
};

function jsonResponse(body: RecruitmentListResponse = okResponse): Response {
  return {
    ok: true,
    json: async () => body
  } as Response;
}

const createPayload: RecruitmentCreatePayload = {
  position: 'CSPM 项目经理',
  companyName: '北京闭环科技有限公司',
  department: '项目交付部',
  recruitmentPost: '项目经理',
  jobTags: 'CSPM优先',
  headcount: 2,
  city: '北京市',
  workLocation: '北京市海淀区',
  salary: '20k-35k',
  requiredArrivalDate: '2026-06-30',
  recruitmentProgress: '紧急启动',
  owner: '赵义民',
  contactPhone: '13800000000',
  jobDescription: '负责平台项目交付。',
  jobRequirement: '具备项目管理经验。',
  skillRequirement: '项目计划,风险管理',
  welfare: '五险一金',
  follower: '贺强',
  level: 'P4',
  remark: '新增闭环测试',
  cspmPreferred: true
};

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = 'USER_ROLE=; Max-Age=0; path=/';
  localStorage.removeItem('USER_ROLE');
});

describe('recruitment create and detail API clients', () => {
  it('creates a recruitment with JSON body and admin role header', async () => {
    const responseBody = {
      id: 'rec-created',
      message: '招聘信息已新增。',
      recruitment: {
        id: 'rec-created',
        ...createPayload,
        headcount: 2,
        status: 'RECRUITING'
      }
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => responseBody
    } as Response);
    localStorage.setItem('USER_ROLE', 'ADMIN');
    vi.stubGlobal('fetch', fetchMock);

    await expect(createRecruitment(createPayload)).resolves.toEqual(responseBody);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-User-Role': 'ADMIN'
        }),
        body: JSON.stringify(createPayload)
      })
    );
  });

  it('uses backend create error messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: '只有管理员可以新增招聘信息。' })
      } as Response)
    );

    await expect(createRecruitment(createPayload)).rejects.toThrow('只有管理员可以新增招聘信息。');
  });

  it('loads recruitment detail by id with role header', async () => {
    const detail = {
      id: 'rec-001',
      ...createPayload,
      headcount: 2,
      status: 'RECRUITING'
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => detail
    } as Response);
    document.cookie = 'USER_ROLE=ADMIN; path=/';
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchRecruitmentDetail('rec-001')).resolves.toEqual(detail);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments/rec-001',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        headers: expect.objectContaining({
          'X-User-Role': 'ADMIN'
        })
      })
    );
  });
});

describe('fetchRecruitments API client', () => {
  it('requests the first page with default page size when query is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments();

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments?page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('trims position keyword before sending the request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments({ positionKeyword: '  Java  ' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments?positionKeyword=Java&page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('omits blank position keyword from the request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments({ positionKeyword: '   ' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments?page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('trims city before sending the request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments({ city: '  上海市  ' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments?city=%E4%B8%8A%E6%B5%B7%E5%B8%82&page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('omits blank city from the request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments({ city: '   ' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments?page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('sends combined position and city filters together', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments({ positionKeyword: 'Java', city: '上海市' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments?positionKeyword=Java&city=%E4%B8%8A%E6%B5%B7%E5%B8%82&page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('sends the requested page with fixed page size', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments({ page: 2 });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recruitments?page=2&pageSize=10',
      expect.any(Object)
    );
  });

  it('includes JSON accept header and browser credentials', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'GET',
        headers: {
          Accept: 'application/json'
        },
        credentials: 'include'
      })
    );
  });

  it('sends local storage role marker as backend role header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    localStorage.setItem('USER_ROLE', 'ADMIN');
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-User-Role': 'ADMIN'
        })
      })
    );
  });

  it('sends cookie role marker as backend role header when local storage is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    document.cookie = 'USER_ROLE=COMPANY; path=/';
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-User-Role': 'COMPANY'
        })
      })
    );
  });

  it('uses cookie role marker before local storage role marker', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    document.cookie = 'USER_ROLE=USER; path=/';
    localStorage.setItem('USER_ROLE', 'ADMIN');
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-User-Role': 'USER'
        })
      })
    );
  });

  it('does not send invalid role marker as backend role header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse());
    localStorage.setItem('USER_ROLE', 'GUEST');
    vi.stubGlobal('fetch', fetchMock);

    await fetchRecruitments();

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          Accept: 'application/json'
        }
      })
    );
  });

  it('uses backend error message when the request fails with JSON body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: '自定义失败提示' })
      } as Response)
    );

    await expect(fetchRecruitments()).rejects.toThrow('自定义失败提示');
  });

  it('uses default error message when the failed response is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('not json');
        }
      } as unknown as Response)
    );

    await expect(fetchRecruitments()).rejects.toThrow('招聘信息加载失败，请稍后重试。');
  });

  it('returns the parsed recruitment list response', async () => {
    const body = {
      ...okResponse,
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
      totalItems: 1,
      totalPages: 1
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body)));

    await expect(fetchRecruitments()).resolves.toEqual(body);
  });
});
