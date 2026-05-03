<template>
  <footer class="platform-footer" aria-label="平台页脚">
    <div class="platform-footer-inner">
      <div class="platform-footer-brand">项目管理人才库</div>
      <p>© {{currentYear}} 项目管理人才库</p>
      <nav class="platform-footer-links" aria-label="页脚链接">
        <RouterLink :to="{ name: 'home' }">帮助中心</RouterLink>
        <RouterLink :to="{ name: 'home' }">系统状态</RouterLink>
        <RouterLink :to="{ name: 'home' }"> <a href="https://www.jncxwh.cn/" target="_blank">聚能创项提供技术支持</a></RouterLink>
      </nav>
    </div>
  </footer>
</template>
<script setup>
import { ref, onMounted } from 'vue';

// 1. 动态年份逻辑
const currentYear = ref(new Date().getFullYear());
</script>
