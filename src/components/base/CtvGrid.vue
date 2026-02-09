<template>
  <div 
    class="ctv-grid" 
    :class="classes"
    :style="finalStyles"
    ref="gridRef"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, provide, inject } from 'vue';

const props = defineProps({
  container: {
    type: Boolean,
    default: false
  },
  item: {
    type: Boolean,
    default: false
  },
  spacing: {
    type: [Number, String],
    default: 0
  },
  columns: {
    type: [Number, String],
    default: null
  },
  gap: {
    type: String,
    default: null
  },
  xs: { type: [Number, String], default: null },
  sm: { type: [Number, String], default: null },
  md: { type: [Number, String], default: null },
  lg: { type: [Number, String], default: null },
  justify: {
    type: String,
    default: 'flex-start'
  },
  align: {
    type: String,
    default: 'flex-start'
  },
  direction: {
    type: String, // row, column, etc.
    default: 'row'
  },
  wrap: {
    type: String, // nowrap, wrap, wrap-reverse
    default: 'wrap'
  }
});

const gridRef = ref(null);
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1200);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
    handleResize();
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize);
  }
});

// Provide/Inject for Spacing
const parentSpacing = inject('ctv-grid-spacing', ref(0));

if (props.container) {
  // Container일 경우 자식에게 spacing 제공 (반응형을 위해 ref로 감쌀 수도 있으나 props는 반응형임)
  // provide는 반응형 객체를 전달해야 자식에서 감지 가능
  provide('ctv-grid-spacing', computed(() => props.spacing));
}

// 아이템 너비 계산 (12 컬럼 시스템)
const itemWidth = computed(() => {
  if (!props.item) return null;

  const width = windowWidth.value;
  let cols = null;

  // lg: >= 1200, md: >= 900, sm: >= 600
  if (width >= 1200 && props.lg !== null) {
    cols = Number(props.lg);
  } else if (width >= 900 && props.md !== null) {
    cols = Number(props.md);
  } else if (width >= 600 && props.sm !== null) {
    cols = Number(props.sm);
  }

  if (cols === null) {
    if (props.xs !== null) {
      cols = Number(props.xs);
    } else {
      // item이지만 width 설정이 없으면 기본 12 (100%)
      cols = 12; 
    }
  }

  if (isNaN(cols)) cols = 12;

  const percentage = (cols / 12) * 100;
  return `${percentage}%`;
});


const classes = computed(() => {
  return {
    'ctv-grid-container': props.container,
    'ctv-grid-item': props.item
  };
});

const baseStyles = computed(() => {
  const style = {};

  // Container Styles
  if (props.container) {
    if (props.columns) {
      // CSS Grid
      const cols = parseInt(props.columns) || 1;
      let gapValue;
      if (props.gap) {
        gapValue = props.gap;
      } else {
        const sp = parseInt(props.spacing || '0');
        gapValue = sp > 0 ? `${sp * 8}px` : '0';
      }

      style.display = 'grid';
      style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      style.gap = gapValue;
      style.width = '100%';
      style.margin = '0';
      style.padding = '0';
    } 
    else {
      // Flexbox Container
      style.display = 'flex';
      style.flexWrap = props.wrap;
      style.flexDirection = props.direction;
      style.justifyContent = props.justify;
      style.alignItems = props.align;

      const sp = parseInt(props.spacing || '0');
      const margin = (sp * 8) / 2;
      
      if (sp > 0) {
        style.width = `calc(100% + ${sp * 8}px)`;
        style.marginLeft = `-${margin}px`;
        style.marginRight = `-${margin}px`;
      } else {
        style.width = '100%';
        style.marginLeft = '0';
        style.marginRight = '0';
      }
    }
  }

  // Item Styles
  if (props.item) {
    style.display = 'block';
    style.boxSizing = 'border-box';

    if (itemWidth.value) {
      style.flexBasis = itemWidth.value;
      style.maxWidth = itemWidth.value;
      style.flexGrow = '0';
      style.flexShrink = '0';
    }
  }

  return style;
});

const itemPaddingStyle = computed(() => {
  // Flex item인 경우 부모로부터 받은 spacing 적용 (gutter)
  // columns(CSS Grid) 모드가 아닐 때만 적용되어야 함.
  // 부모가 Grid인지 Flex인지 알기 어렵지만, spacing context가 있으면 Flex라고 가정 (Grid는 gap 사용)
  // 단, Grid도 spacing을 provide할 수 있으므로 주의. CtvGrid 구현 상 Flex Container만 spacing을 provide하도록 했으므로 안전.
  
  if (props.item && !props.container && parentSpacing && parentSpacing.value) { 
     const sp = parseInt(parentSpacing.value || '0');
     if (sp > 0) {
       const padding = (sp * 8) / 2;
       return {
         padding: `${padding}px`
       };
     }
  }
  return {};
});

const finalStyles = computed(() => {
  return { ...baseStyles.value, ...itemPaddingStyle.value };
});
</script>

<style scoped>
/* Scoped styles can be added here if needed, but styling is mostly inline based on props */
</style>
