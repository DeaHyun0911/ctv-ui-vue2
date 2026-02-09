<template>
  <div :class="['ctv-input-group', { 'ctv-input-group--column': direction === 'column' }]">
    <div class="ctv-input__inner">
      <!-- 라벨 -->
      <label
        v-if="label"
        :class="labelClasses"
      >
        {{ label }}
      </label>

      <!-- Input Group Wrapper -->
      <div
        :class="['ctv-input-group__wrapper', { 'ctv-input-group__wrapper--error': hasError }]"
      >
        <template v-for="(item, index) in items" :key="index">
          <div class="ctv-input-group__item">
            <input
              :type="item.type || 'text'"
              class="ctv-input__field"
              :value="modelValue[item.field]"
              :placeholder="item.placeholder"
              :disabled="isDisabled || item.disabled"
              :readonly="isReadonly || item.readonly"
              @input="updateValue(item.field, $event.target.value)"
              @blur="handleBlur(item.field)"
              @focus="handleFocus(item.field)"
            />
          </div>
          <!-- 구분선 (마지막 아이템 제외) -->
          <div v-if="index < items.length - 1" class="ctv-input-group__divider"></div>
        </template>
      </div>
    </div>

    <!-- 에러 메시지 (그룹 전체 에러) -->
    <div
      :class="['ctv-input__error', { 'ctv-input__error--show': hasError }]"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'CtvInputGroup',
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    items: {
      type: Array,
      default: () => [] // [{ field: 'id', placeholder: 'ID', type: 'text' }, ...]
    },
    label: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    errorMessage: {
        type: String,
        default: ''
    },
    labelAlign: {
      type: String,
      default: '',
      validator: (value) => ['', 'left', 'center', 'right'].includes(value)
    },
    direction: {
      type: String,
      default: 'row',
      validator: (value) => ['row', 'column'].includes(value)
    }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus'],
  setup(props, { emit }) {
    
    const isDisabled = computed(() => props.disabled === true || props.disabled === '');
    const isReadonly = computed(() => props.readonly === true || props.readonly === '');
    const isRequired = computed(() => props.required === true || props.required === '');
    const hasError = computed(() => !!props.errorMessage);

    // 라벨 클래스
    const labelClasses = computed(() => {
      const classes = ['ctv-input__label'];
      if (isRequired.value) classes.push('ctv-input__label--required');
      if (props.labelAlign) classes.push(`ctv-input__label--${props.labelAlign}`);
      return classes;
    });

    const updateValue = (field, value) => {
      const newValue = { ...props.modelValue, [field]: value };
      emit('update:modelValue', newValue);
      emit('change', { field, value, form: newValue });
    };

    const handleBlur = (field) => {
      emit('blur', { field, value: props.modelValue[field] });
    };

    const handleFocus = (field) => {
      emit('focus', { field, value: props.modelValue[field] });
    };

    return {
      isDisabled,
      isReadonly,
      isRequired,
      labelClasses,
      hasError,
      updateValue,
      handleBlur,
      handleFocus
    };
  }
};
</script>

<style scoped>
/* BEM 네이밍 컨벤션 사용 */

.ctv-input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.ctv-input-group--column {
  flex-direction: column;
  align-items: flex-start;
}

/* Input Group Wrapper */
.ctv-input-group__wrapper {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  border: 1px solid var(--ctv-border-color, #e2e8f0);
  border-radius: var(--ctv-border-radius, 4px);
  background-color: white;
  overflow: hidden;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.ctv-input-group__wrapper:focus-within {
  border-color: var(--ctv-primary-color, #2196F3);
  box-shadow: var(--ctv-focus-shadow, 0 0 0 3px rgba(33, 150, 243, 0.1));
}

.ctv-input-group__wrapper--error {
  border-color: var(--ctv-error-color, #dc3545);
}

.ctv-input-group__wrapper--error:focus-within {
  border-color: var(--ctv-error-color, #dc3545);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Items */
.ctv-input-group__item {
  flex: 1 1 0px; /* 균등 분할 */
  min-width: 0;
  display: flex;
  align-items: center;
}

.ctv-input__field {
  width: 100%;
  border: none;
  outline: none;
  padding: 0 12px;
  height: 32px;
  background: transparent;
  font-size: 14px;
  
  /* Reset browser default styles */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  border-radius: 0;
  box-shadow: none;
  margin: 0;
}

/* Divider */
.ctv-input-group__divider {
  width: 1px;
  background-color: var(--ctv-border-color, #e2e8f0);
}

.ctv-input-group__wrapper:focus-within .ctv-input-group__divider {
    background-color: var(--ctv-primary-color, #2196F3);
}

/* Disabled/Readonly */
.ctv-input-group__wrapper:has(input:disabled) {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.ctv-input-group__wrapper:has(input[readonly]) {
  background-color: #f2f2f2;
  cursor: default;
}
</style>
