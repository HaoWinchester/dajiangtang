<template>
  <header class="platform-header" aria-label="平台顶部导航">
    <RouterLink class="platform-brand" :to="{ name: 'home' }">
      <img src="/assets/logo.png" alt="全国项目管理标准化技术委员会 - 人才库 Logo" />
      <span>全国项目管理标准化技术委员会 - 人才库</span>
    </RouterLink>

    <nav class="platform-nav" aria-label="主要导航">
      <RouterLink :to="{ name: 'home' }">首页</RouterLink>
      <RouterLink :to="{ name: 'recruitments' }">招聘信息</RouterLink>
      <RouterLink :to="{ name: 'personal-center' }">人才信息</RouterLink>
      <RouterLink :to="{ name: 'enterprise-center' }">企业中心</RouterLink>
    </nav>

    <div class="platform-actions">
      <RouterLink class="ghost-button" :to="{ name: 'register' }">注册</RouterLink>
      <RouterLink class="primary-button" :to="{ name: 'login' }">登录</RouterLink>
    </div>
  </header>
</template>
