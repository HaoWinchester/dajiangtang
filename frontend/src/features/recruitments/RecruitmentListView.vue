<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { fetchRecruitments } from './api';
import PlatformHeader from './PlatformHeader.vue';
import type { RecruitmentListQuery, RecruitmentListResponse } from './types';

const PAGE_SIZE = 10 as const;

const form = reactive({
  positionKeyword: '',
  city: ''
});

const activeQuery = reactive({
  positionKeyword: '',
  city: ''
});

const list = ref<RecruitmentListResponse>({
  items: [],
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
  canCreate: false
});
const isLoading = ref(false);
const errorMessage = ref('');
const lastRequestedPage = ref(1);

const hasItems = computed(() => list.value.items.length > 0);
const canGoPrevious = computed(() => list.value.page > 1 && !isLoading.value);
const canGoNext = computed(
  () => list.value.page < Math.max(list.value.totalPages, 1) && !isLoading.value
);
const rangeText = computed(() => {
  if (!list.value.totalItems) {
    return '共 0 条';
  }

  const start = (list.value.page - 1) * list.value.pageSize + 1;
  const end = Math.min(list.value.page * list.value.pageSize, list.value.totalItems);
  return `${start}-${end} / 共 ${list.value.totalItems} 条`;
});

async function loadRecruitments(page = 1) {
  isLoading.value = true;
  errorMessage.value = '';
  lastRequestedPage.value = page;

  const query: RecruitmentListQuery = {
    positionKeyword: activeQuery.positionKeyword,
    city: activeQuery.city,
    page,
    pageSize: PAGE_SIZE
  };

  try {
    list.value = await fetchRecruitments(query);
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '招聘信息加载失败，请稍后重试。';
  } finally {
    isLoading.value = false;
  }
}

function submitSearch() {
  activeQuery.positionKeyword = form.positionKeyword.trim();
  activeQuery.city = form.city.trim();
  void loadRecruitments(1);
}

function clearSearch() {
  form.positionKeyword = '';
  form.city = '';
  activeQuery.positionKeyword = '';
  activeQuery.city = '';
  void loadRecruitments(1);
}

function retry() {
  void loadRecruitments(lastRequestedPage.value);
}

function goToPage(page: number) {
  void loadRecruitments(page);
}

onMounted(() => {
  void loadRecruitments(1);
});
</script>

<template>
  <div class="platform-page">
    <PlatformHeader />

    <main class="app-shell" aria-labelledby="recruitments-title">
      <section class="page-header">
        <div>
          <p class="eyebrow">招聘信息</p>
          <h1 id="recruitments-title">招聘信息列表</h1>
        </div>
        <RouterLink
          v-if="list.canCreate"
          class="primary-button"
          :to="{ name: 'recruitment-create' }"
        >
          新增
        </RouterLink>
      </section>

      <section class="page-card search-panel" aria-label="招聘搜索">
        <form class="search-form" @submit.prevent="submitSearch">
          <label>
            <span>岗位</span>
            <input
              v-model="form.positionKeyword"
              name="positionKeyword"
              type="search"
              placeholder="输入岗位关键词"
              autocomplete="off"
            />
          </label>
          <label>
            <span>城市</span>
            <input
              v-model="form.city"
              name="city"
              type="search"
              placeholder="输入标准城市名"
              autocomplete="off"
            />
          </label>
          <div class="search-actions">
            <button class="primary-button" type="submit" :disabled="isLoading">搜索</button>
            <button class="ghost-button" type="button" :disabled="isLoading" @click="clearSearch">
              清空搜索
            </button>
          </div>
        </form>
      </section>

      <section class="page-card list-panel" aria-live="polite">
        <div v-if="isLoading" class="state-block" role="status">正在加载招聘信息...</div>

        <div v-else-if="errorMessage" class="state-block state-block--error" role="alert">
          <strong>{{ errorMessage }}</strong>
          <button class="primary-button" type="button" @click="retry">重试</button>
        </div>

        <div v-else-if="!hasItems" class="state-block">
          <strong>暂无匹配的招聘信息</strong>
          <span>请调整岗位或城市条件后再试。</span>
        </div>

        <template v-else>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">岗位</th>
                  <th scope="col">薪资</th>
                  <th scope="col">公司名称</th>
                  <th scope="col">城市</th>
                  <th scope="col">负责人</th>
                  <th scope="col">需求人数</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in list.items" :key="item.id">
                  <td>{{ item.position }}</td>
                  <td>{{ item.salary }}</td>
                  <td>{{ item.companyName }}</td>
                  <td>{{ item.city }}</td>
                  <td>{{ item.owner }}</td>
                  <td>{{ item.headcount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <nav class="pagination" aria-label="招聘信息分页">
            <span>{{ rangeText }}</span>
            <div>
              <button class="ghost-button" type="button" :disabled="!canGoPrevious" @click="goToPage(list.page - 1)">
                上一页
              </button>
              <span class="page-index">第 {{ list.page }} / {{ Math.max(list.totalPages, 1) }} 页</span>
              <button class="ghost-button" type="button" :disabled="!canGoNext" @click="goToPage(list.page + 1)">
                下一页
              </button>
            </div>
          </nav>
        </template>
      </section>
    </main>
  </div>
</template>
