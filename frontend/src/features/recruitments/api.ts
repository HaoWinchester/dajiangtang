import type { RecruitmentListQuery, RecruitmentListResponse } from './types';

const DEFAULT_PAGE_SIZE = 10 as const;
const ROLE_COOKIE = 'USER_ROLE';
const ROLE_STORAGE_KEY = 'USER_ROLE';
const ROLE_HEADER = 'X-User-Role';
const ALLOWED_ROLES = new Set(['ADMIN', 'USER', 'COMPANY']);

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  return document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function readRoleMarker(): string | undefined {
  const cookieRole = readCookie(ROLE_COOKIE);
  const storedRole = typeof localStorage === 'undefined' ? undefined : localStorage.getItem(ROLE_STORAGE_KEY);
  const role = decodeURIComponent(cookieRole ?? storedRole ?? '');

  return ALLOWED_ROLES.has(role) ? role : undefined;
}

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
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };
  const roleMarker = readRoleMarker();

  if (roleMarker) {
    headers[ROLE_HEADER] = roleMarker;
  }

  const response = await fetch(buildRecruitmentsUrl(query), {
    method: 'GET',
    headers,
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
