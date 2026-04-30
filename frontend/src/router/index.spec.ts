import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/recruitments/AuthRequiredView.vue', () => ({ default: {} }));
vi.mock('@/features/recruitments/RecruitmentCreateEntryView.vue', () => ({ default: {} }));
vi.mock('@/features/recruitments/RecruitmentListView.vue', () => ({ default: {} }));

describe('recruitment route guard', () => {
  beforeEach(() => {
    document.cookie = 'USER_ROLE=; Max-Age=0; path=/';
    localStorage.removeItem('USER_ROLE');
  });

  it('redirects unauthenticated visitors away from the recruitment list', async () => {
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true } })).toEqual({
      name: 'login-required'
    });
  });

  it('allows visitors with a valid role marker to enter protected recruitment routes', async () => {
    localStorage.setItem('USER_ROLE', 'ADMIN');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true } })).toBe(true);
  });

  it('allows regular users to enter the recruitment list', async () => {
    localStorage.setItem('USER_ROLE', 'USER');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true } })).toBe(true);
  });

  it('allows company users to enter the recruitment list', async () => {
    localStorage.setItem('USER_ROLE', 'COMPANY');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true } })).toBe(true);
  });

  it('allows admins to enter the recruitment create route', async () => {
    localStorage.setItem('USER_ROLE', 'ADMIN');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, requiresAdmin: true } })).toBe(true);
  });

  it('redirects regular users away from the recruitment create route', async () => {
    localStorage.setItem('USER_ROLE', 'USER');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, requiresAdmin: true } })).toEqual({
      name: 'recruitments'
    });
  });

  it('redirects company users away from the recruitment create route', async () => {
    localStorage.setItem('USER_ROLE', 'COMPANY');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, requiresAdmin: true } })).toEqual({
      name: 'recruitments'
    });
  });

  it('redirects unauthenticated visitors away from the recruitment create route before admin check', async () => {
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, requiresAdmin: true } })).toEqual({
      name: 'login-required'
    });
  });

  it('rejects unknown role markers', async () => {
    localStorage.setItem('USER_ROLE', 'GUEST');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true } })).toEqual({
      name: 'login-required'
    });
  });

  it('uses USER_ROLE cookie when local storage is empty', async () => {
    document.cookie = 'USER_ROLE=ADMIN; path=/';
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, requiresAdmin: true } })).toBe(true);
  });

  it('uses cookie role before local storage role', async () => {
    document.cookie = 'USER_ROLE=USER; path=/';
    localStorage.setItem('USER_ROLE', 'ADMIN');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, requiresAdmin: true } })).toEqual({
      name: 'recruitments'
    });
  });

  it('allows public routes without role marker', async () => {
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: {} })).toBe(true);
  });
});
