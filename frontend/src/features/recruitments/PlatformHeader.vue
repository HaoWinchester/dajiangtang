<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const role = ref('');

function readRole() {
  role.value = localStorage.getItem('USER_ROLE') || '';
}

const navLinks = computed(() => {
  if (role.value === 'ADMIN') {
    return [
      { name: 'home', label: '首页' },
      { name: 'recruitments', label: '招聘信息' },
      { name: 'talents', label: '人才信息' },
      { name: 'analytics', label: '数据分析' },
      { name: 'recruitment-create', label: '新增招聘' }
    ];
  }

  if (role.value === 'COMPANY') {
    return [
      { name: 'home', label: '首页' },
      { name: 'recruitments', label: '招聘信息' },
      { name: 'talents', label: '人才信息' },
      { name: 'enterprise-center', label: '企业中心' }
    ];
  }

  if (role.value === 'USER') {
    return [
      { name: 'home', label: '首页' },
      { name: 'recruitments', label: '招聘信息' },
      { name: 'talents', label: '人才信息' },
      { name: 'personal-center', label: '个人中心' }
    ];
  }

  return [{ name: 'home', label: '首页' }];
});

function logout() {
  localStorage.removeItem('USER_ROLE');
  document.cookie = 'USER_ROLE=; Max-Age=0; path=/';
  role.value = '';
  window.location.href = '/';
}

onMounted(readRole);
</script>

<template>
  <header class="platform-header" aria-label="平台顶部导航">
    <RouterLink class="platform-brand" :to="{ name: 'home' }">
      <img src="/assets/logo.png" alt="项目管理人才库 Logo" />
      <span>项目管理人才库</span>
    </RouterLink>

    <nav class="platform-nav" aria-label="主要导航">
      <RouterLink v-for="link in navLinks" :key="link.name" :to="{ name: link.name }">
        {{ link.label }}
      </RouterLink>
    </nav>

    <div class="platform-actions">
      <template v-if="role">
        <button class="ghost-button" type="button" @click="logout">退出登录</button>
      </template>
      <template v-else>
        <RouterLink class="ghost-button" :to="{ name: 'register' }">注册</RouterLink>
        <RouterLink class="primary-button" :to="{ name: 'login' }">登录</RouterLink>
      </template>
    </div>
  </header>
</template>
