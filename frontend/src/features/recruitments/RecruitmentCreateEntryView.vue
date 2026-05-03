<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { createRecruitment } from './api';
import PlatformFooter from './PlatformFooter.vue';
import PlatformHeader from './PlatformHeader.vue';
import type { RecruitmentCreatePayload } from './types';

const router = useRouter();

const form = reactive<RecruitmentCreatePayload>({
  position: '',
  companyName: '',
  department: '',
  recruitmentPost: '',
  jobTags: '',
  headcount: 1,
  city: '',
  workLocation: '',
  salary: '',
  requiredArrivalDate: '',
  recruitmentProgress: '常规招聘',
  owner: '',
  contactPhone: '',
  jobDescription: '',
  jobRequirement: '',
  skillRequirement: '',
  welfare: '',
  follower: '',
  level: '',
  remark: '',
  cspmPreferred: false
});

const isSubmitting = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

function validate(): string {
  if (!form.position.trim()) return '请填写岗位名称。';
  if (!form.companyName.trim()) return '请填写公司。';
  if (!form.headcount || form.headcount < 1) return '需求人数至少为1人。';
  if (!form.city.trim()) return '请填写工作地点。';
  if (!form.salary.trim()) return '请填写薪资。';
  if (!form.recruitmentProgress.trim()) return '请选择招聘进度。';
  if (!form.owner.trim()) return '请填写负责人。';
  if (!form.contactPhone.trim()) return '请填写联系电话。';
  if (!form.jobDescription.trim()) return '请填写岗位说明。';
  if (!form.jobRequirement.trim()) return '请填写岗位要求。';
  if (!form.skillRequirement.trim()) return '请填写技能要求。';
  return '';
}

async function submit() {
  errorMessage.value = '';
  successMessage.value = '';

  const validationMessage = validate();
  if (validationMessage) {
    errorMessage.value = validationMessage;
    return;
  }

  isSubmitting.value = true;
  try {
    const result = await createRecruitment({
      ...form,
      position: form.position.trim(),
      companyName: form.companyName.trim(),
      department: form.department.trim(),
      recruitmentPost: form.recruitmentPost.trim(),
      jobTags: form.jobTags.trim(),
      city: form.city.trim(),
      workLocation: form.workLocation.trim(),
      salary: form.salary.trim(),
      recruitmentProgress: form.recruitmentProgress.trim(),
      owner: form.owner.trim(),
      contactPhone: form.contactPhone.trim(),
      jobDescription: form.jobDescription.trim(),
      jobRequirement: form.jobRequirement.trim(),
      skillRequirement: form.skillRequirement.trim(),
      welfare: form.welfare.trim(),
      follower: form.follower.trim(),
      level: form.level.trim(),
      remark: form.remark.trim()
    });
    successMessage.value = result.message;
    await router.push({ name: 'recruitment-detail', params: { id: result.id } });
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '招聘信息新增失败，请检查表单后重试。';
  } finally {
    isSubmitting.value = false;
  }
}

function cancel() {
  void router.push({ name: 'recruitments' });
}
</script>

<template>
  <div class="platform-page">
    <PlatformHeader />

    <main class="app-shell" aria-labelledby="create-recruitment-title">
      <form class="recruitment-create" novalidate @submit.prevent="submit">
        <section class="page-header create-header">
          <div>
            <p class="eyebrow">招聘新增流程</p>
            <h1 id="create-recruitment-title">创建新招聘职位</h1>
          </div>
          <div class="create-actions">
            <button class="ghost-button" type="button" :disabled="isSubmitting" @click="cancel">
              取消
            </button>
            <button class="primary-button" type="submit" :disabled="isSubmitting">
              {{ isSubmitting ? '正在发布...' : '发布职位' }}
            </button>
          </div>
        </section>

        <p v-if="errorMessage" class="form-message form-message--error" role="alert">
          {{ errorMessage }}
        </p>
        <p v-if="successMessage" class="form-message form-message--success" role="status">
          {{ successMessage }}
        </p>

        <div class="create-grid">
          <section class="page-card form-section">
            <h2>基本信息</h2>
            <div class="form-grid">
              <label>
                <span>岗位名称 *</span>
                <input v-model="form.position" name="position" type="text" autocomplete="off" />
              </label>
              <label>
                <span>公司 *</span>
                <input v-model="form.companyName" name="companyName" type="text" autocomplete="organization" />
              </label>
              <label>
                <span>部门</span>
                <input v-model="form.department" name="department" type="text" autocomplete="off" />
              </label>
              <label>
                <span>招聘岗位</span>
                <input v-model="form.recruitmentPost" name="recruitmentPost" type="text" autocomplete="off" />
              </label>
              <label>
                <span>岗位标签</span>
                <input v-model="form.jobTags" name="jobTags" type="text" placeholder="例如：CSPM优先,重点岗位" autocomplete="off" />
              </label>
              <label>
                <span>级别</span>
                <input v-model="form.level" name="level" type="text" placeholder="例如：P4" autocomplete="off" />
              </label>
            </div>
          </section>

          <section class="page-card form-section form-section--wide">
            <h2>岗位描述</h2>
            <label>
              <span>岗位说明 *</span>
              <textarea v-model="form.jobDescription" name="jobDescription" rows="4" />
            </label>
            <label>
              <span>岗位要求 *</span>
              <textarea v-model="form.jobRequirement" name="jobRequirement" rows="4" />
            </label>
            <label>
              <span>技能要求 *</span>
              <textarea v-model="form.skillRequirement" name="skillRequirement" rows="3" />
            </label>
            <label>
              <span>福利待遇</span>
              <textarea v-model="form.welfare" name="welfare" rows="3" />
            </label>
          </section>

          <aside class="page-card form-section execution-section">
            <h2>招聘执行</h2>
            <div class="form-grid form-grid--single">
              <label>
                <span>需求人数 *</span>
                <input v-model.number="form.headcount" name="headcount" type="number" min="1" />
              </label>
              <label>
                <span>工作地点 *</span>
                <input v-model="form.city" name="city" type="text" placeholder="例如：北京市" autocomplete="address-level2" />
              </label>
              <label>
                <span>详细地址</span>
                <input v-model="form.workLocation" name="workLocation" type="text" autocomplete="street-address" />
              </label>
              <label>
                <span>薪资 *</span>
                <input v-model="form.salary" name="salary" type="text" placeholder="例如：20k-35k" autocomplete="off" />
              </label>
              <label>
                <span>需求到岗日期</span>
                <input v-model="form.requiredArrivalDate" name="requiredArrivalDate" type="date" />
              </label>
              <label>
                <span>招聘进度 *</span>
                <select v-model="form.recruitmentProgress" name="recruitmentProgress">
                  <option>紧急启动</option>
                  <option>常规招聘</option>
                  <option>长期人才储备</option>
                </select>
              </label>
              <label>
                <span>负责人 *</span>
                <input v-model="form.owner" name="owner" type="text" autocomplete="name" />
              </label>
              <label>
                <span>联系电话 *</span>
                <input v-model="form.contactPhone" name="contactPhone" type="tel" autocomplete="tel" />
              </label>
              <label>
                <span>跟进人员</span>
                <input v-model="form.follower" name="follower" type="text" autocomplete="off" />
              </label>
              <label class="checkbox-row">
                <input v-model="form.cspmPreferred" name="cspmPreferred" type="checkbox" />
                <span>CSPM优先</span>
              </label>
              <label>
                <span>备注</span>
                <textarea v-model="form.remark" name="remark" rows="3" />
              </label>
            </div>
          </aside>
        </div>
      </form>
    </main>

    <PlatformFooter />
  </div>
</template>
