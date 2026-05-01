<script setup lang="ts">
import PlatformFooter from './PlatformFooter.vue';
import PlatformHeader from './PlatformHeader.vue';
</script>

<template>
  <div class="platform-page auth-required-page">
    <PlatformHeader />

    <main class="auth-required-shell" aria-labelledby="auth-required-title">
      <section class="auth-required-panel">
        <div class="auth-required-copy">
          <p class="eyebrow">访问受保护</p>
          <h1 id="auth-required-title">请先登录后查看招聘信息</h1>
          <p class="muted">
            招聘信息、人才信息与企业资料属于平台内部业务数据，仅面向已登录的管理员、普通用户和企业用户开放。
          </p>

          <div class="auth-required-actions">
            <RouterLink class="primary-button" :to="{ name: 'login' }">去登录</RouterLink>
            <RouterLink class="ghost-button" :to="{ name: 'register' }">注册账号</RouterLink>
            <RouterLink class="text-link" :to="{ name: 'home' }">返回首页</RouterLink>
          </div>
        </div>

        <div class="auth-required-aside" aria-label="访问说明">
          <span class="aside-index">01</span>
          <strong>统一身份校验</strong>
          <p>登录后系统会根据管理员、普通用户、企业用户权限展示对应入口。</p>
          <span class="aside-line"></span>
          <span class="aside-index">02</span>
          <strong>数据脱敏展示</strong>
          <p>未登录时仅开放首页脱敏招聘信息，内部人才库与招聘管理需完成身份验证。</p>
        </div>
      </section>
    </main>

    <PlatformFooter />
  </div>
</template>
