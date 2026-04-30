<template>
  <main class="auth-shell" aria-labelledby="register-title">
    <section class="page-card auth-panel">
      <RouterLink class="text-link" :to="{ name: 'home' }">返回首页</RouterLink>
      <p class="eyebrow">用户注册</p>
      <h1 id="register-title">注册</h1>
      <p class="muted">注册流程将在后续功能中接入。当前可先使用登录页的演示角色查看招聘信息列表。</p>
      <RouterLink class="primary-button" :to="{ name: 'login' }">去登录</RouterLink>
    </section>
  </main>
</template>
