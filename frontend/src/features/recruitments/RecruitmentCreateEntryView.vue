<script setup lang="ts">
import PlatformFooter from './PlatformFooter.vue';
import PlatformHeader from './PlatformHeader.vue';
</script>

<template>
  <div class="platform-page">
    <PlatformHeader />

    <main class="app-shell create-entry" aria-labelledby="create-entry-title">
      <section class="page-card page-card--compact">
        <p class="eyebrow">招聘新增流程</p>
        <h1 id="create-entry-title">招聘新增入口</h1>
        <p class="muted">新增表单将在后续功能中接入。当前入口已为管理员流程预留。</p>
        <RouterLink class="text-link" :to="{ name: 'recruitments' }">返回招聘列表</RouterLink>
      </section>
    </main>

    <PlatformFooter />
  </div>
</template>
