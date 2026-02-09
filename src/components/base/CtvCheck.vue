<template>
  <div :class="['ctv-check', { 'ctv-check--column': direction === 'column' }]">
    <div class="ctv-check__inner">
      <label :class="['ctv-check__wrapper', { 'ctv-check__wrapper--disabled': isDisabled }]">
        <input
          :id="inputId"
          ref="inputRef"
          type="checkbox"
          class="ctv-check__input"
          :checked="internalValue"
          :disabled="isDisabled"
          :value="checkValue"
          @change="handleChange"
        />
        <span class="ctv-check__box"></span>
        <span v-if="label" class="ctv-check__label">{{ label }}</span>
      </label>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useFormField } from '@/composables/useFormField';

export default {
  name: 'CtvCheck',
  props: {
    modelValue: {
      type: [Boolean, Array],
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    checkValue: {
      type: [String, Number, Boolean],
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
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
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const inputRef = ref(null);
    const inputId = computed(() => props.name || props.field || `ctv-check-${Math.random().toString(36).substr(2, 9)}`);

    // Array 타입인 경우 (checkbox group)
    const isArray = computed(() => Array.isArray(props.modelValue));

    const internalValue = computed(() => {
      if (isArray.value) {
        return props.modelValue.includes(props.checkValue);
      }
      return props.modelValue;
    });

    const isDisabled = computed(() => {
      return props.disabled === true || props.disabled === '';
    });

    const handleChange = (e) => {
      const checked = e.target.checked;
      
      if (isArray.value) {
        // Array: 체크된 값들의 배열
        const newValue = [...props.modelValue];
        if (checked) {
          if (!newValue.includes(props.checkValue)) {
            newValue.push(props.checkValue);
          }
        } else {
          const index = newValue.indexOf(props.checkValue);
          if (index > -1) {
            newValue.splice(index, 1);
          }
        }
        emit('update:modelValue', newValue);
        emit('change', {
          value: newValue,
          checked: checked,
          checkValue: props.checkValue
        });
      } else {
        // Boolean: true/false
        emit('update:modelValue', checked);
        emit('change', {
          value: checked,
          checked: checked
        });
      }
    };

    const focus = () => {
      inputRef.value?.focus();
    };

    const blur = () => {
      inputRef.value?.blur();
    };

    return {
      inputRef,
      inputId,
      internalValue,
      isDisabled,
      handleChange,
      focus,
      blur
    };
  }
};
</script>

<style scoped>
.ctv-check {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.ctv-check__inner {
  display: flex;
  align-items: center;
}

.ctv-check__wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.ctv-check__wrapper--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ctv-check__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.ctv-check__box {
  position: relative;
  width: 18px;
  height: 18px;
  border: 2px solid #ddd;
  border-radius: 4px;
  background-color: white;
  transition: all 0.2s ease-in-out;
}

.ctv-check__input:checked + .ctv-check__box {
  background-color: #007bff;
  border-color: #007bff;
}

.ctv-check__input:checked + .ctv-check__box::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.ctv-check__input:focus + .ctv-check__box {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.ctv-check__input:disabled + .ctv-check__box {
  background-color: #f5f5f5;
  border-color: #ddd;
}

.ctv-check__label {
  font-size: 14px;
  color: #333;
}

.ctv-check--column .ctv-check__inner {
  flex-direction: column;
  align-items: flex-start;
}
</style>
