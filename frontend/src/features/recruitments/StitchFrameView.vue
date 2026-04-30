<script setup lang="ts">
defineProps<{
  src: string;
  title: string;
}>();
</script>

<template>
  <iframe class="stitch-frame" :src="src" :title="title" />
</template>
