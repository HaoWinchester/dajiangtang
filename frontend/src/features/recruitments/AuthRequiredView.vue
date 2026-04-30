<template>
  <main class="app-shell create-entry" aria-labelledby="auth-required-title">
    <section class="page-card page-card--compact">
      <p class="eyebrow">需要登录</p>
      <h1 id="auth-required-title">请先登录后查看招聘信息</h1>
      <p class="muted">招聘信息列表仅面向已登录的管理员、普通用户和企业用户开放。</p>
      <RouterLink class="primary-button" :to="{ name: 'login' }">去登录</RouterLink>
      <RouterLink class="text-link" :to="{ name: 'home' }">返回首页</RouterLink>
    </section>
  </main>
</template>
