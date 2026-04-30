<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const ROLE_COOKIE = 'USER_ROLE';
const ROLE_STORAGE_KEY = 'USER_ROLE';

const router = useRouter();
const form = reactive({
  username: '',
  password: '',
  role: 'ADMIN'
});
const verified = ref(false);
const errorMessage = ref('');

function login() {
  errorMessage.value = '';

  if (!form.username.trim() || !form.password.trim()) {
    errorMessage.value = '请输入用户名和密码。';
    return;
  }

  if (!verified.value) {
    errorMessage.value = '请先完成滑块验证。';
    return;
  }

  localStorage.setItem(ROLE_STORAGE_KEY, form.role);
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(form.role)}; path=/`;
  void router.push({ name: 'recruitments' });
}
</script>

<template>
  <main class="auth-shell" aria-labelledby="login-title">
    <section class="page-card auth-panel">
      <RouterLink class="text-link" :to="{ name: 'home' }">返回首页</RouterLink>
      <p class="eyebrow">用户登录</p>
      <h1 id="login-title">登录</h1>

      <form class="auth-form" @submit.prevent="login">
        <label>
          <span>用户名</span>
          <input v-model="form.username" name="username" autocomplete="username" />
        </label>
        <label>
          <span>密码</span>
          <input v-model="form.password" name="password" type="password" autocomplete="current-password" />
        </label>
        <label>
          <span>演示角色</span>
          <select v-model="form.role" name="role">
            <option value="ADMIN">管理员</option>
            <option value="USER">普通用户</option>
            <option value="COMPANY">企业用户</option>
          </select>
        </label>

        <label class="verify-box">
          <input v-model="verified" type="checkbox" />
          <span>拖动滑块完成拼图验证</span>
        </label>

        <p v-if="errorMessage" class="form-error" role="alert">{{ errorMessage }}</p>
        <button class="primary-button" type="submit">登录</button>
      </form>
    </section>
  </main>
</template>
