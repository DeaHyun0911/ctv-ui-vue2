<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="isDisabled"
    @click="handleClick"
  >
    <!-- 아이콘 (왼쪽) -->
    <component
      v-if="iconComponent && iconPosition === 'left'"
      :is="iconComponent"
      :size="iconSize"
      class="ctv-button__icon ctv-button__icon--left"
    />
    
    <!-- 텍스트 -->
    <span v-if="!iconOnly" class="ctv-button__text">
      <slot>{{ label }}</slot>
    </span>
    
    <!-- 아이콘 (오른쪽) -->
    <component
      v-if="iconComponent && iconPosition === 'right'"
      :is="iconComponent"
      :size="iconSize"
      class="ctv-button__icon ctv-button__icon--right"
    />
  </button>
</template>

<script>
import { computed } from 'vue';
import * as lucideIcons from 'lucide-vue-next';

export default {
  name: 'CtvButton',
  props: {
    label: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'button', // button, submit, reset
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    variant: {
      type: String,
      default: 'primary', // primary, secondary, success, danger, warning, info
      validator: (value) => ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'link'].includes(value)
    },
    size: {
      type: String,
      default: 'medium', // small, medium, large
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    block: {
      type: Boolean,
      default: false
    },
    outline: {
      type: Boolean,
      default: false
    },
    // 아이콘 관련 props
    icon: {
      type: String,
      default: '' // Lucide 아이콘 이름 (예: 'Plus', 'Search', 'X')
    },
    iconPosition: {
      type: String,
      default: 'left', // left, right
      validator: (value) => ['left', 'right'].includes(value)
    },
    iconOnly: {
      type: Boolean,
      default: false // 아이콘만 표시 (텍스트 숨김)
    }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const isDisabled = computed(() => {
      return props.disabled === true || props.disabled === '';
    });

    const iconComponent = computed(() => {
      if (!props.icon) return null;
      // shallowRef 제거하고 직접 컴포넌트 반환
      return lucideIcons[props.icon] || null;
    });

    const iconSize = computed(() => {
      const sizeMap = {
        small: 14,
        medium: 16,
        large: 20
      };
      return sizeMap[props.size] || 16;
    });

    const buttonClasses = computed(() => {
      const classes = ['ctv-button'];
      
      // variant
      if (props.outline) {
        classes.push(`ctv-button--outline-${props.variant}`);
      } else {
        classes.push(`ctv-button--${props.variant}`);
      }
      
      // size
      classes.push(`ctv-button--${props.size}`);
      
      // block
      if (props.block) {
        classes.push('ctv-button--block');
      }
      
      // icon-only
      if (props.iconOnly && props.icon) {
        classes.push('ctv-button--icon-only');
      }
      
      // disabled
      if (isDisabled.value) {
        classes.push('ctv-button--disabled');
      }
      
      return classes;
    });

    const handleClick = (e) => {
      if (!isDisabled.value) {
        emit('click', e);
      }
    };

    return {
      isDisabled,
      iconComponent,
      iconSize,
      buttonClasses,
      handleClick
    };
  }
};
</script>

<style scoped>
.ctv-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px; /* 아이콘과 텍스트 사이 간격 */
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  user-select: none;
}

.ctv-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* 아이콘 스타일 */
.ctv-button__icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
}

.ctv-button__text {
  display: inline-flex;
  align-items: center;
}

/* 아이콘만 표시 */
.ctv-button--icon-only {
  padding: 8px;
  width: auto;
  aspect-ratio: 1;
}

.ctv-button--icon-only.ctv-button--small {
  padding: 6px;
}

.ctv-button--icon-only.ctv-button--large {
  padding: 12px;
}

/* Sizes */
.ctv-button--small {
  padding: 4px 12px;
  font-size: 12px;
  gap: 4px;
}

.ctv-button--large {
  padding: 12px 24px;
  font-size: 16px;
  gap: 8px;
}

.ctv-button--block {
  width: 100%;
}

/* Variants */
.ctv-button--primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.ctv-button--primary:hover:not(.ctv-button--disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.ctv-button--secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.ctv-button--secondary:hover:not(.ctv-button--disabled) {
  background-color: #545b62;
  border-color: #545b62;
}

.ctv-button--success {
  background-color: #28a745;
  border-color: #28a745;
  color: white;
}

.ctv-button--success:hover:not(.ctv-button--disabled) {
  background-color: #1e7e34;
  border-color: #1e7e34;
}

.ctv-button--danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.ctv-button--danger:hover:not(.ctv-button--disabled) {
  background-color: #bd2130;
  border-color: #bd2130;
}

.ctv-button--warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #212529;
}

.ctv-button--warning:hover:not(.ctv-button--disabled) {
  background-color: #e0a800;
  border-color: #e0a800;
}

.ctv-button--info {
  background-color: #17a2b8;
  border-color: #17a2b8;
  color: white;
}

.ctv-button--info:hover:not(.ctv-button--disabled) {
  background-color: #117a8b;
  border-color: #117a8b;
}

.ctv-button--link {
  background-color: transparent;
  border-color: transparent;
  color: #007bff;
}

.ctv-button--link:hover:not(.ctv-button--disabled) {
  color: #0056b3;
  text-decoration: underline;
}

/* Outline variants */
.ctv-button--outline-primary {
  background-color: transparent;
  border-color: #007bff;
  color: #007bff;
}

.ctv-button--outline-primary:hover:not(.ctv-button--disabled) {
  background-color: #007bff;
  color: white;
}

.ctv-button--outline-secondary {
  background-color: transparent;
  border-color: #6c757d;
  color: #6c757d;
}

.ctv-button--outline-secondary:hover:not(.ctv-button--disabled) {
  background-color: #6c757d;
  color: white;
}

.ctv-button--outline-success {
  background-color: transparent;
  border-color: #28a745;
  color: #28a745;
}

.ctv-button--outline-success:hover:not(.ctv-button--disabled) {
  background-color: #28a745;
  color: white;
}

.ctv-button--outline-danger {
  background-color: transparent;
  border-color: #dc3545;
  color: #dc3545;
}

.ctv-button--outline-danger:hover:not(.ctv-button--disabled) {
  background-color: #dc3545;
  color: white;
}

/* Disabled */
.ctv-button--disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
