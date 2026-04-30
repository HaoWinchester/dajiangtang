import { createRouter, createWebHistory } from 'vue-router';

import AuthRequiredView from '@/features/recruitments/AuthRequiredView.vue';
import RecruitmentCreateEntryView from '@/features/recruitments/RecruitmentCreateEntryView.vue';
import RecruitmentListView from '@/features/recruitments/RecruitmentListView.vue';

const ROLE_COOKIE = 'USER_ROLE';
const ROLE_STORAGE_KEY = 'USER_ROLE';
const ADMIN_ROLE = 'ADMIN';
const ALLOWED_ROLES = new Set([ADMIN_ROLE, 'USER', 'COMPANY']);

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

function readClientRole(): string | undefined {
  const cookieRole = readCookie(ROLE_COOKIE);
  const storedRole = typeof localStorage === 'undefined' ? undefined : localStorage.getItem(ROLE_STORAGE_KEY);
  const role = decodeURIComponent(cookieRole ?? storedRole ?? '');

  return ALLOWED_ROLES.has(role) ? role : undefined;
}

export function requireAuthGuard(to: { meta: { requiresAuth?: unknown; requiresAdmin?: unknown } }) {
  const role = readClientRole();

  if (to.meta.requiresAuth && !role) {
    return { name: 'login-required' };
  }

  if (to.meta.requiresAdmin && role !== ADMIN_ROLE) {
    return { name: 'recruitments' };
  }

  return true;
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: { name: 'recruitments' }
    },
    {
      path: '/login-required',
      name: 'login-required',
      component: AuthRequiredView
    },
    {
      path: '/recruitments',
      name: 'recruitments',
      component: RecruitmentListView,
      meta: { requiresAuth: true }
    },
    {
      path: '/recruitments/new',
      name: 'recruitment-create',
      component: RecruitmentCreateEntryView,
      meta: { requiresAuth: true, requiresAdmin: true }
    }
  ]
});

router.beforeEach(requireAuthGuard);

export default router;
