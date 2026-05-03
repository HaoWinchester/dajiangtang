<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';

import { fetchRecruitments } from './api';
import PlatformFooter from './PlatformFooter.vue';
import PlatformHeader from './PlatformHeader.vue';
import type { RecruitmentListQuery, RecruitmentListResponse } from './types';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0];

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
  pageSize: DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 0,
  canCreate: false
});
const isLoading = ref(false);
const errorMessage = ref('');
const paginationMessage = ref('');
const lastRequestedPage = ref(1);
const pageSize = ref<number>(DEFAULT_PAGE_SIZE);
const jumpPage = ref('');

const hasItems = computed(() => list.value.items.length > 0);
const canGoPrevious = computed(() => list.value.page > 1 && !isLoading.value);
const canGoNext = computed(
  () => list.value.page < Math.max(list.value.totalPages, 1) && !isLoading.value
);
const maxPage = computed(() => Math.max(list.value.totalPages, 1));
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
    pageSize: pageSize.value
  };

  try {
    list.value = await fetchRecruitments(query);
    pageSize.value = list.value.pageSize;
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
  paginationMessage.value = '';
  void loadRecruitments(1);
}

function clearSearch() {
  form.positionKeyword = '';
  form.city = '';
  activeQuery.positionKeyword = '';
  activeQuery.city = '';
  paginationMessage.value = '';
  jumpPage.value = '';
  void loadRecruitments(1);
}

function retry() {
  void loadRecruitments(lastRequestedPage.value);
}

function goToPage(page: number) {
  paginationMessage.value = '';
  void loadRecruitments(page);
}

function changePageSize() {
  paginationMessage.value = '';
  jumpPage.value = '';
  void loadRecruitments(1);
}

function submitJumpPage() {
  const target = Number(jumpPage.value);
  if (!Number.isInteger(target) || target < 1 || target > maxPage.value) {
    paginationMessage.value = `请输入 1-${maxPage.value} 之间的页码`;
    return;
  }

  paginationMessage.value = '';
  void loadRecruitments(target);
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
              placeholder="输入城市关键词"
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
                  <th scope="col">需求人数</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in list.items"
                  :key="item.id"
                  class="clickable-row"
                  @click="$router.push({ name: 'recruitment-detail', params: { id: item.id } })"
                >
                  <td>
                    <RouterLink
                      class="table-row-link"
                      :to="{ name: 'recruitment-detail', params: { id: item.id } }"
                      @click.stop
                    >
                      {{ item.position }}
                    </RouterLink>
                  </td>
                  <td>{{ item.salary }}</td>
                  <td>{{ item.companyName }}</td>
                  <td>{{ item.city }}</td>
                  <td>{{ item.headcount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <nav class="pagination" aria-label="招聘信息分页">
            <span class="pagination-range">{{ rangeText }}</span>
            <div class="pagination-controls">
              <label class="page-size-control">
                <span>每页</span>
                <select
                  v-model.number="pageSize"
                  name="pageSize"
                  :disabled="isLoading"
                  @change="changePageSize"
                >
                  <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">
                    {{ size }} 条
                  </option>
                </select>
              </label>

              <button class="ghost-button" type="button" :disabled="!canGoPrevious" @click="goToPage(list.page - 1)">
                上一页
              </button>
              <span class="page-index">第 {{ list.page }} / {{ maxPage }} 页</span>
              <button class="ghost-button" type="button" :disabled="!canGoNext" @click="goToPage(list.page + 1)">
                下一页
              </button>

              <form class="page-jump" aria-label="招聘页码跳转" novalidate @submit.prevent="submitJumpPage">
                <label>
                  <span>跳转至</span>
                  <input
                    v-model="jumpPage"
                    name="jumpPage"
                    type="number"
                    min="1"
                    :max="maxPage"
                    inputmode="numeric"
                    :disabled="isLoading"
                  />
                </label>
                <button class="ghost-button" type="submit" :disabled="isLoading">跳转</button>
              </form>
            </div>
            <p v-if="paginationMessage" class="pagination-message" role="alert">
              {{ paginationMessage }}
            </p>
          </nav>
        </template>
      </section>
    </main>

    <PlatformFooter />
  </div>
</template>
