import { describe, expect, it, vi } from 'vitest';

vi.mock('@/features/recruitments/AuthRequiredView.vue', () => ({ default: {} }));
vi.mock('@/features/recruitments/RecruitmentCreateEntryView.vue', () => ({ default: {} }));
vi.mock('@/features/recruitments/RecruitmentListView.vue', () => ({ default: {} }));

describe('recruitment route guard', () => {
  it('redirects unauthenticated visitors away from the recruitment list', async () => {
    document.cookie = 'USER_ROLE=; Max-Age=0; path=/';
    localStorage.removeItem('USER_ROLE');
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
});
