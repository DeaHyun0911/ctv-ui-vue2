<template>
  <div :class="['ctv-textarea', { 'ctv-textarea--column': direction === 'column' }]">
    <div class="ctv-input__inner">
      <!-- 라벨 -->
      <label 
        v-if="label"
        :class="labelClasses"
        :for="inputId"
      >
        {{ label }}
      </label>

      <!-- 입력 필드 wrapper -->
      <div class="ctv-input__wrapper">
        <textarea
          :id="inputId"
          ref="textareaRef"
          :class="['ctv-textarea__field', { 'ctv-textarea__field--error': errorMessage }]"
          :value="internalValue"
          :placeholder="placeholder"
          :disabled="isDisabled"
          :readonly="isReadonly"
          :maxlength="maxlength"
          :rows="rows"
          @input="handleInput"
          @change="handleChange"
          @blur="handleBlur"
          @focus="handleFocus"
        ></textarea>
      </div>
    </div>

    <!-- 에러 메시지 (전체 요소 아래) -->
    <div 
      :class="['ctv-input__error', { 'ctv-input__error--show': errorMessage }]"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useFormField } from '@/composables/useFormField';
import { useValidation } from '@/composables/useValidation';

export default {
  name: 'CtvTextarea',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    placeholder: {
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
    requiredMessage: {
      type: String,
      default: '필수 입력 항목입니다.'
    },
    validators: {
      type: Array,
      default: () => []
    },
    maxlength: {
      type: Number,
      default: undefined
    },
    minlength: {
      type: Number,
      default: undefined
    },
    rows: {
      type: Number,
      default: 4
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
    },
    field: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus'],
  setup(props, { emit }) {
    const textareaRef = ref(null);
    const inputId = computed(() => props.name || props.field || `ctv-textarea-${Math.random().toString(36).substr(2, 9)}`);

    // useFormField composable 사용
    const {
      internalValue,
      isDisabled,
      isReadonly,
      isRequired,
      setValue,
      getValue
    } = useFormField(props, emit);

    // useValidation composable 사용
    const {
      errorMessage,
      isValid,
      validate,
      clearError
    } = useValidation(internalValue, props);

    // 라벨 클래스
    const labelClasses = computed(() => {
      const classes = ['ctv-input__label'];
      if (isRequired.value) classes.push('ctv-input__label--required');
      if (props.labelAlign) classes.push(`ctv-input__label--${props.labelAlign}`);
      return classes;
    });

    const handleInput = (e) => {
      internalValue.value = e.target.value;
    };

    const handleChange = (e) => {
      validate();
    };

    const handleBlur = (e) => {
      validate();
      emit('blur', { value: internalValue.value });
    };

    const handleFocus = (e) => {
      clearError();
      emit('focus', { value: internalValue.value });
    };

    const focus = () => {
      textareaRef.value?.focus();
    };

    const blur = () => {
      textareaRef.value?.blur();
    };

    return {
      textareaRef,
      inputId,
      internalValue,
      isDisabled,
      isReadonly,
      isRequired,
      labelClasses,
      errorMessage,
      handleInput,
      handleChange,
      handleBlur,
      handleFocus,
      focus,
      blur,
      validate,
      setValue,
      getValue
    };
  }
};
</script>

<style scoped>
.ctv-textarea__field {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-family: inherit;
  border: 1px solid var(--ctv-border-color, #ddd);
  border-radius: var(--ctv-border-radius, 4px);
  resize: vertical;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.ctv-textarea__field:focus {
  outline: none;
  border-color: var(--ctv-primary-color, #007bff);
  box-shadow: var(--ctv-focus-shadow, 0 0 0 3px rgba(0, 123, 255, 0.25));
}

.ctv-textarea__field:disabled,
.ctv-textarea__field:read-only {
  background-color: var(--ctv-disabled-bg, #f5f5f5);
  color: var(--ctv-disabled-color, #999);
  cursor: not-allowed;
}

.ctv-textarea__field--error {
  border-color: var(--ctv-error-color, #dc3545);
}
</style>
