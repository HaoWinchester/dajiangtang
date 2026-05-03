import type {
  RecruitmentCreatePayload,
  RecruitmentCreateResponse,
  RecruitmentDetail,
  RecruitmentListQuery,
  RecruitmentListResponse
} from './types';

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

function buildRecruitmentDetailUrl(id: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const url = new URL(`/api/recruitments/${encodeURIComponent(id)}`, baseUrl || window.location.origin);

  if (!baseUrl) {
    return url.pathname;
  }

  return url.toString();
}

function buildRecruitmentCreateUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const url = new URL('/api/recruitments', baseUrl || window.location.origin);

  if (!baseUrl) {
    return url.pathname;
  }

  return url.toString();
}

function authHeaders(contentType?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json'
  };
  const roleMarker = readRoleMarker();

  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  if (roleMarker) {
    headers[ROLE_HEADER] = roleMarker;
  }

  return headers;
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  let message = fallback;

  try {
    const errorBody = (await response.json()) as { message?: string };
    if (errorBody.message) {
      message = errorBody.message;
    }
  } catch {
    // Keep the fallback when the backend returns an empty or non-JSON error.
  }

  return message;
}

export async function fetchRecruitments(
  query: RecruitmentListQuery = {}
): Promise<RecruitmentListResponse> {
  const response = await fetch(buildRecruitmentsUrl(query), {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, '招聘信息加载失败，请稍后重试。');
    throw new Error(message);
  }

  return (await response.json()) as RecruitmentListResponse;
}

export async function fetchRecruitmentDetail(id: string): Promise<RecruitmentDetail> {
  const response = await fetch(buildRecruitmentDetailUrl(id), {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'include'
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, '招聘详情加载失败，请稍后重试。');
    throw new Error(message);
  }

  return (await response.json()) as RecruitmentDetail;
}

export async function createRecruitment(
  payload: RecruitmentCreatePayload
): Promise<RecruitmentCreateResponse> {
  const response = await fetch(buildRecruitmentCreateUrl(), {
    method: 'POST',
    headers: authHeaders('application/json'),
    credentials: 'include',
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, '招聘信息新增失败，请检查表单后重试。');
    throw new Error(message);
  }

  return (await response.json()) as RecruitmentCreateResponse;
}
