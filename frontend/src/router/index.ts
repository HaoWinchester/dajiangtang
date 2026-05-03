import { createRouter, createWebHistory } from 'vue-router';

import AuthRequiredView from '@/features/recruitments/AuthRequiredView.vue';
import RecruitmentCreateEntryView from '@/features/recruitments/RecruitmentCreateEntryView.vue';
import RecruitmentListView from '@/features/recruitments/RecruitmentListView.vue';
import StitchFrameView from '@/features/recruitments/StitchFrameView.vue';

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

type RouteRole = 'ADMIN' | 'USER' | 'COMPANY';

type GuardTarget = {
  meta: {
    requiresAuth?: unknown;
    requiresAdmin?: unknown;
    allowedRoles?: unknown;
  };
};

function roleHome(role: RouteRole) {
  if (role === ADMIN_ROLE) {
    return { name: 'recruitments' };
  }

  if (role === 'COMPANY') {
    return { name: 'enterprise-center' };
  }

  return { name: 'personal-center' };
}

function isAllowedRoleList(value: unknown): value is RouteRole[] {
  return Array.isArray(value) && value.every((role) => ALLOWED_ROLES.has(role));
}

export function requireAuthGuard(to: GuardTarget) {
  const role = readClientRole();

  if (to.meta.requiresAuth && !role) {
    return { name: 'login-required' };
  }

  if (to.meta.requiresAdmin && role !== ADMIN_ROLE) {
    return { name: 'recruitments' };
  }

  if (role && isAllowedRoleList(to.meta.allowedRoles) && !to.meta.allowedRoles.includes(role as RouteRole)) {
    return roleHome(role as RouteRole);
  }

  return true;
}

const USER_ONLY_META = { requiresAuth: true, allowedRoles: ['USER'] };

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: StitchFrameView,
      props: {
        src: '/stitch_cspm/_1/code.html',
        title: '项目管理人才库 首页'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: StitchFrameView,
      props: {
        src: '/stitch_cspm/_2/code.html',
        title: '项目管理人才库 登录'
      }
    },
    {
      path: '/register',
      name: 'register',
      component: StitchFrameView,
      props: {
        src: '/stitch_cspm/_3/code.html',
        title: '项目管理人才库 注册'
      }
    },
    {
      path: '/enterprise-center',
      name: 'enterprise-center',
      component: StitchFrameView,
      meta: { requiresAuth: true, allowedRoles: ['COMPANY'] },
      props: {
        src: '/stitch_cspm/_4/code.html',
        title: '企业中心 - 资料维护'
      }
    },
    {
      path: '/personal-center',
      name: 'personal-center',
      component: StitchFrameView,
      meta: USER_ONLY_META,
      props: {
        src: '/stitch_cspm/_5/code.html',
        title: '个人中心 - 基础信息'
      }
    },
    {
      path: '/personal-center/work-experience',
      name: 'personal-work-experience',
      component: StitchFrameView,
      meta: USER_ONLY_META,
      props: {
        src: '/stitch_cspm/_6/code.html',
        title: '个人中心 - 工作经历'
      }
    },
    {
      path: '/personal-center/project-experience',
      name: 'personal-project-experience',
      component: StitchFrameView,
      meta: USER_ONLY_META,
      props: {
        src: '/stitch_cspm/_6/code.html',
        title: '个人中心 - 项目经历'
      }
    },
    {
      path: '/personal-center/honors',
      name: 'personal-honors',
      component: StitchFrameView,
      meta: USER_ONLY_META,
      props: {
        src: '/stitch_cspm/_7/code.html',
        title: '个人中心 - 获得荣誉'
      }
    },
    {
      path: '/personal-center/education-experience',
      name: 'personal-education-experience',
      component: StitchFrameView,
      meta: USER_ONLY_META,
      props: {
        src: '/stitch_cspm/_8/code.html',
        title: '个人中心 - 教育经历'
      }
    },
    {
      path: '/personal-center/professional-skills',
      name: 'personal-professional-skills',
      component: StitchFrameView,
      meta: USER_ONLY_META,
      props: {
        src: '/stitch_cspm/_6/code.html',
        title: '个人中心 - 专业技能'
      }
    },
    {
      path: '/personal-center/certificates',
      name: 'personal-certificates',
      component: StitchFrameView,
      meta: USER_ONLY_META,
      props: {
        src: '/stitch_cspm/_9/code.html',
        title: '个人中心 - 资格证书'
      }
    },
    {
      path: '/talents',
      name: 'talents',
      component: StitchFrameView,
      meta: { requiresAuth: true },
      props: {
        src: '/stitch_cspm/_10/code.html',
        title: '人才信息 - 列表'
      }
    },
    {
      path: '/talents/:id',
      name: 'talent-detail',
      component: StitchFrameView,
      meta: { requiresAuth: true },
      props: {
        src: '/stitch_cspm/_11/code.html',
        title: '人才信息 - 详情'
      }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: StitchFrameView,
      meta: { requiresAuth: true, allowedRoles: ['ADMIN', 'COMPANY'] },
      props: {
        src: '/stitch_cspm/_15/code.html',
        title: '数据分析'
      }
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
    },
    {
      path: '/recruitments/:id/apply',
      name: 'recruitment-apply',
      component: StitchFrameView,
      props: {
        src: '/stitch_cspm/_14/code.html',
        title: '招聘申请 - 提交申请'
      }
    },
    {
      path: '/recruitments/:id',
      name: 'recruitment-detail',
      component: StitchFrameView,
      meta: { requiresAuth: true },
      props: {
        src: '/stitch_cspm/_14/code.html',
        title: '招聘信息 - 详情'
      }
    }
  ]
});

router.beforeEach(requireAuthGuard);

export default router;
