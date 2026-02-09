<template>
  <div :class="['ctv-switch', { 'ctv-switch--column': direction === 'column' }]">
    <div class="ctv-switch__inner">
      <label :class="['ctv-switch__wrapper', { 'ctv-switch__wrapper--disabled': isDisabled }]">
        <input
          :id="inputId"
          ref="inputRef"
          type="checkbox"
          class="ctv-switch__input"
          :checked="internalValue"
          :disabled="isDisabled"
          @change="handleChange"
        />
        <span class="ctv-switch__slider"></span>
      </label>
      <span v-if="label" class="ctv-switch__label">{{ label }}</span>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'CtvSwitch',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
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
    const inputId = computed(() => props.name || props.field || `ctv-switch-${Math.random().toString(36).substr(2, 9)}`);

    const internalValue = computed(() => props.modelValue);

    const isDisabled = computed(() => {
      return props.disabled === true || props.disabled === '';
    });

    const handleChange = (e) => {
      const checked = e.target.checked;
      emit('update:modelValue', checked);
      emit('change', {
        value: checked,
        checked: checked
      });
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
.ctv-switch {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.ctv-switch__inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctv-switch__wrapper {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
  cursor: pointer;
}

.ctv-switch__wrapper--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.ctv-switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.ctv-switch__slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 24px;
  transition: all 0.3s ease-in-out;
}

.ctv-switch__slider::before {
  content: '';
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: all 0.3s ease-in-out;
}

.ctv-switch__input:checked + .ctv-switch__slider {
  background-color: #007bff;
}

.ctv-switch__input:checked + .ctv-switch__slider::before {
  transform: translateX(24px);
}

.ctv-switch__input:focus + .ctv-switch__slider {
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

.ctv-switch__input:disabled + .ctv-switch__slider {
  background-color: #e9ecef;
}

.ctv-switch__label {
  font-size: 14px;
  color: #333;
  user-select: none;
}

.ctv-switch--column .ctv-switch__inner {
  flex-direction: column;
  align-items: flex-start;
}
</style>
