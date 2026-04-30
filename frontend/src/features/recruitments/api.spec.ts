import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchRecruitments } from './api';
import type { RecruitmentListResponse } from './types';

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

afterEach(() => {
  vi.unstubAllGlobals();
  document.cookie = 'USER_ROLE=; Max-Age=0; path=/';
  localStorage.removeItem('USER_ROLE');
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
