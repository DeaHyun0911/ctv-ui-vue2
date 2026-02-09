<template>
  <div v-show="isActive" class="ctv-tab-panel" role="tabpanel" :aria-labelledby="`tab-${value}`">
    <slot></slot>
  </div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, computed, watch } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const tabsContext = inject('ctv-tabs');
const currentValue = inject('currentTabValue');

const isActive = computed(() => currentValue?.value === props.value);

// 등록 객체
const tabData = {
  label: props.label,
  value: props.value,
  disabled: props.disabled
};

onMounted(() => {
  if (tabsContext) {
    tabsContext.registerTab(tabData);
  }
});

onUnmounted(() => {
  if (tabsContext) {
    tabsContext.unregisterTab(props.value);
  }
});

// 동적 라벨/비활성화 변경 감지 대응 (필요 시)
// 현재 CtvTabs 구현상 tabs 배열의 객체를 직접 변경하거나 replace 해야 함.
// 간단한 구현을 위해 생략하거나, tabsContext에 update 메서드를 추가해야 함.
</script>

<style scoped>
/* Scoped styles */
</style>
