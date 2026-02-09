<template>
  <div class="ctv-tabs">
    <div class="ctv-tabs-header">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        class="ctv-tab-button"
        :class="{ active: modelValue === tab.value }"
        role="tab"
        :aria-selected="modelValue === tab.value"
        @click="selectTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="ctv-tabs-panels">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { provide, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const tabs = ref([]);

const registerTab = (tab) => {
  tabs.value.push(tab);
  // 첫 번째 탭이고 modelValue가 없으면 선택
  if (tabs.value.length === 1 && !props.modelValue) {
    selectTab(tab.value);
  }
};

const unregisterTab = (value) => {
  const index = tabs.value.findIndex(t => t.value === value);
  if (index > -1) {
    tabs.value.splice(index, 1);
  }
};

const selectTab = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

provide('ctv-tabs', {
  registerTab,
  unregisterTab,
  currentValue: ref(props.modelValue), // 반응형 참조 전달 아님. watch로 업데이트 필요 또는 computed
});

// Provide current value reactively
// provide에 ref 객체 자체를 넘기면 자식에서 .value로 접근 가능하지만,
// readonly로 넘기거나 computed로 넘기는게 안전함.
// 여기서는 간단하게 props.modelValue를 감시하여 자식에게 전달하는 방식 대신,
// 자식이 active 여부를 판단하도록 currentValue를 ref로 제공하고 이를 업데이트함.

const currentValue = ref(props.modelValue);
watch(() => props.modelValue, (val) => {
  currentValue.value = val;
});

provide('currentTabValue', currentValue);

</script>

<style scoped>
.ctv-tabs {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.ctv-tabs-header {
  display: flex;
  border-bottom: 1px solid var(--ctv-border-color, #dee2e6);
  background-color: #fff;
}

.ctv-tab-button {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #6c757d;
  transition: all 0.2s;
  outline: none;
}

.ctv-tab-button:hover {
  color: var(--ctv-primary-color, #007bff);
}

.ctv-tab-button.active {
  color: var(--ctv-primary-color, #007bff);
  border-bottom-color: var(--ctv-primary-color, #007bff);
}

.ctv-tabs-panels {
  padding: 20px 0;
}
</style>
