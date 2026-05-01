import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/features/recruitments/AuthRequiredView.vue', () => ({ default: {} }));
vi.mock('@/features/recruitments/RecruitmentCreateEntryView.vue', () => ({ default: {} }));
vi.mock('@/features/recruitments/RecruitmentListView.vue', () => ({ default: {} }));
vi.mock('@/features/recruitments/StitchFrameView.vue', () => ({ default: {} }));

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

  it('allows admins and company users to enter analytics routes', async () => {
    const { requireAuthGuard } = await import('./index');

    localStorage.setItem('USER_ROLE', 'ADMIN');
    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'COMPANY'] } })).toBe(true);

    localStorage.setItem('USER_ROLE', 'COMPANY');
    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'COMPANY'] } })).toBe(true);
  });

  it('redirects regular users away from analytics routes to personal center', async () => {
    localStorage.setItem('USER_ROLE', 'USER');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'COMPANY'] } })).toEqual({
      name: 'personal-center'
    });
  });

  it('allows only regular users to enter personal center routes', async () => {
    localStorage.setItem('USER_ROLE', 'USER');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['USER'] } })).toBe(true);
  });

  it('redirects company users away from personal center routes to enterprise center', async () => {
    localStorage.setItem('USER_ROLE', 'COMPANY');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['USER'] } })).toEqual({
      name: 'enterprise-center'
    });
  });

  it('redirects admins away from personal center routes to recruitment management', async () => {
    localStorage.setItem('USER_ROLE', 'ADMIN');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['USER'] } })).toEqual({
      name: 'recruitments'
    });
  });

  it('allows only company users to enter enterprise center routes', async () => {
    localStorage.setItem('USER_ROLE', 'COMPANY');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['COMPANY'] } })).toBe(true);
  });

  it('redirects regular users away from enterprise center routes to personal center', async () => {
    localStorage.setItem('USER_ROLE', 'USER');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['COMPANY'] } })).toEqual({
      name: 'personal-center'
    });
  });

  it('redirects admins away from enterprise center routes to recruitment management', async () => {
    localStorage.setItem('USER_ROLE', 'ADMIN');
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true, allowedRoles: ['COMPANY'] } })).toEqual({
      name: 'recruitments'
    });
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

  it('keeps the home route public', async () => {
    const { default: router } = await import('./index');

    expect(router.resolve('/').name).toBe('home');
    expect(router.resolve('/').meta.requiresAuth).toBeUndefined();
  });

  it('keeps the login route public', async () => {
    const { default: router } = await import('./index');

    expect(router.resolve('/login').name).toBe('login');
    expect(router.resolve('/login').meta.requiresAuth).toBeUndefined();
  });

  it('maps enterprise center to the stitch enterprise design', async () => {
    const { default: router } = await import('./index');

    expect(router.resolve('/enterprise-center').name).toBe('enterprise-center');
    expect(router.resolve('/enterprise-center').meta.requiresAuth).toBe(true);
    expect(router.resolve('/enterprise-center').meta.allowedRoles).toEqual(['COMPANY']);
  });

  it('maps personal center to the stitch personal basic info design', async () => {
    const { default: router } = await import('./index');

    expect(router.resolve('/personal-center').name).toBe('personal-center');
    expect(router.resolve('/personal-center').meta.requiresAuth).toBe(true);
    expect(router.resolve('/personal-center').meta.allowedRoles).toEqual(['USER']);
  });

  it('maps analytics to the protected Stitch data analysis design', async () => {
    const { default: router } = await import('./index');

    expect(router.resolve('/analytics').name).toBe('analytics');
    expect(router.resolve('/analytics').meta.requiresAuth).toBe(true);
    expect(router.resolve('/analytics').meta.allowedRoles).toEqual(['ADMIN', 'COMPANY']);
  });

  it('maps work experience to the stitch work experience design', async () => {
    const { default: router } = await import('./index');

    expect(router.resolve('/personal-center/work-experience').name).toBe('personal-work-experience');
    expect(router.resolve('/personal-center/work-experience').meta.requiresAuth).toBe(true);
    expect(router.resolve('/personal-center/work-experience').meta.allowedRoles).toEqual(['USER']);
  });

  it('registers all personal-center module pages as protected Stitch pages', async () => {
    const { default: router } = await import('./index');

    expect(router.resolve('/personal-center/project-experience').name).toBe('personal-project-experience');
    expect(router.resolve('/personal-center/honors').name).toBe('personal-honors');
    expect(router.resolve('/personal-center/education-experience').name).toBe('personal-education-experience');
    expect(router.resolve('/personal-center/professional-skills').name).toBe('personal-professional-skills');
    expect(router.resolve('/personal-center/certificates').name).toBe('personal-certificates');
    expect(router.resolve('/personal-center/certificates').meta.requiresAuth).toBe(true);
  });

  it('redirects unauthenticated visitors away from protected center pages', async () => {
    const { requireAuthGuard } = await import('./index');

    expect(requireAuthGuard({ meta: { requiresAuth: true } })).toEqual({
      name: 'login-required'
    });
  });
});
