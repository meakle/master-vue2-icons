<template>
  <div>
    <div>按需引入</div>
    <AIIcon />

    <div>全量预览</div>
    <div
      v-for="keys of IconsList"
    >
      <component :is="keys" /> 
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { AIIcon, iconMap } from '../index';

const IconsList = ref(Object.keys(iconMap));
</script>
