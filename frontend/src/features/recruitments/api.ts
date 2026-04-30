import type { RecruitmentListQuery, RecruitmentListResponse } from './types';

const DEFAULT_PAGE_SIZE = 10 as const;

function buildRecruitmentsUrl(query: RecruitmentListQuery): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const url = new URL('/api/recruitments', baseUrl || window.location.origin);
  const positionKeyword = query.positionKeyword?.trim();
  const city = query.city?.trim();

  if (positionKeyword) {
    url.searchParams.set('positionKeyword', positionKeyword);
  }

  if (city) {
    url.searchParams.set('city', city);
  }

  url.searchParams.set('page', String(query.page ?? 1));
  url.searchParams.set('pageSize', String(query.pageSize ?? DEFAULT_PAGE_SIZE));

  if (!baseUrl) {
    return `${url.pathname}${url.search}`;
  }

  return url.toString();
}

export async function fetchRecruitments(
  query: RecruitmentListQuery = {}
): Promise<RecruitmentListResponse> {
  const response = await fetch(buildRecruitmentsUrl(query), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    credentials: 'include'
  });

  if (!response.ok) {
    let message = '招聘信息加载失败，请稍后重试。';

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Keep the default message when the backend returns an empty or non-JSON error.
    }

    throw new Error(message);
  }

  return (await response.json()) as RecruitmentListResponse;
}
