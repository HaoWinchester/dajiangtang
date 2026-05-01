<template>
  <footer class="platform-footer" aria-label="平台页脚">
    <div class="platform-footer-inner">
      <div class="platform-footer-brand">项目管理人才库</div>
      <p>© 2024 项目管理人才库 Human Capital Management. All rights reserved.</p>
      <nav class="platform-footer-links" aria-label="页脚链接">
        <RouterLink :to="{ name: 'home' }">帮助中心</RouterLink>
        <RouterLink :to="{ name: 'home' }">系统状态</RouterLink>
        <RouterLink :to="{ name: 'home' }">Cookie 政策</RouterLink>
      </nav>
    </div>
  </footer>
</template>
