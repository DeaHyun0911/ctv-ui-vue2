<template>
  <div 
    class="ctv-box" 
    :class="classes"
    :style="styles"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String, // 'outlined', 'elevated', 'filled', 'none'
    default: 'outlined'
  },
  padding: {
    type: [String, Number], // 'none', 'sm', 'md', 'lg', or number (px)
    default: 'md'
  },
  elevation: {
    type: [Number, String], // 0~5
    default: 0
  }
});

const classes = computed(() => {
  return [
    `ctv-box--${props.variant}`,
    // padding이 사전 정의된 문자열일 경우 클래스로 처리
    typeof props.padding === 'string' && ['none', 'sm', 'md', 'lg'].includes(props.padding) 
      ? `ctv-box--padding-${props.padding}` 
      : ''
  ];
});

const styles = computed(() => {
  const style = {};

  // Elevation (Shadow)
  if (props.variant === 'elevated') {
    const elevation = parseInt(props.elevation || '1');
    if (elevation > 0) {
      const shadowMap = {
        1: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        2: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        3: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        4: '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
        5: '0 19px 38px rgba(0, 0, 0, 0.30), 0 15px 12px rgba(0, 0, 0, 0.22)'
      };
      style.boxShadow = shadowMap[elevation] || shadowMap[1];
    }
  }

  // Custom Padding (number or arbitrary string)
  if (typeof props.padding === 'number') {
    style.padding = `${props.padding}px`;
  } else if (typeof props.padding === 'string' && !['none', 'sm', 'md', 'lg'].includes(props.padding)) {
    style.padding = props.padding;
  }

  return style;
});
</script>

<style scoped>
.ctv-box {
  background-color: #fff;
  border-radius: var(--ctv-border-radius, 4px);
  box-sizing: border-box;
  transition: box-shadow 0.3s cubic-bezier(.25,.8,.25,1);
}

/* Variant Styles */
.ctv-box--outlined {
  border: 1px solid var(--ctv-border-color, #dee2e6);
}

.ctv-box--elevated {
  border: none;
}

.ctv-box--filled {
  background-color: var(--ctv-bg-color-secondary, #f8f9fa);
  border: none;
}

.ctv-box--none {
  background: transparent;
  border: none;
  border-radius: 0;
}

/* Padding Styles */
.ctv-box--padding-none {
  padding: 0;
}

.ctv-box--padding-sm {
  padding: 8px;
}

.ctv-box--padding-md {
  padding: 16px;
}

.ctv-box--padding-lg {
  padding: 24px;
}
</style>
