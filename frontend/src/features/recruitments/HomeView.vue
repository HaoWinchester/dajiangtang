<script setup lang="ts">
const previews = [
  {
    id: 'home-001',
    position: 'Java 架构师',
    salary: '35k-55k',
    companyName: '北京平台科技有限公司',
    city: '北京市',
    owner: '马骁',
    headcount: 1,
    cspmPreferred: '是'
  },
  {
    id: 'home-002',
    position: '算法工程师',
    salary: '28k-45k',
    companyName: '上海智算未来有限公司',
    city: '上海市',
    owner: '王可为',
    headcount: 2,
    cspmPreferred: '否'
  },
  {
    id: 'home-003',
    position: '数据分析师',
    salary: '16k-28k',
    companyName: '杭州数智科技有限公司',
    city: '杭州市',
    owner: '李文清',
    headcount: 2,
    cspmPreferred: '是'
  }
];
</script>

<template>
  <main class="home-shell" aria-labelledby="home-title">
    <header class="site-header">
      <RouterLink class="brand" :to="{ name: 'home' }" aria-label="大讲堂首页">大讲堂</RouterLink>
      <nav class="header-actions" aria-label="账户操作">
        <RouterLink class="ghost-button" :to="{ name: 'login' }">登录</RouterLink>
        <RouterLink class="primary-button" :to="{ name: 'register' }">注册</RouterLink>
      </nav>
    </header>

    <section class="home-hero">
      <div class="home-copy">
        <p class="eyebrow">人才与招聘服务</p>
        <h1 id="home-title">招聘信息预览</h1>
        <p class="muted">未登录用户可以查看脱敏后的岗位概览；登录后可进入完整招聘信息列表并使用搜索、翻页和权限功能。</p>
        <div class="home-actions">
          <RouterLink class="primary-button" :to="{ name: 'login' }">登录查看完整列表</RouterLink>
          <RouterLink class="text-link" :to="{ name: 'recruitments' }">进入招聘列表</RouterLink>
        </div>
      </div>

      <section class="page-card home-preview" aria-label="脱敏招聘信息">
        <div class="preview-list">
          <article v-for="item in previews" :key="item.id" class="preview-item">
            <div>
              <h2>{{ item.position }}</h2>
              <p>{{ item.companyName }} · {{ item.city }}</p>
            </div>
            <dl>
              <div>
                <dt>薪资</dt>
                <dd>{{ item.salary }}</dd>
              </div>
              <div>
                <dt>负责人</dt>
                <dd>{{ item.owner }}</dd>
              </div>
              <div>
                <dt>需求人数</dt>
                <dd>{{ item.headcount }}</dd>
              </div>
              <div>
                <dt>CSPM优先</dt>
                <dd>{{ item.cspmPreferred }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>
