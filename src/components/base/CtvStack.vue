<template>
  <div 
    class="ctv-stack" 
    :class="classes"
    :style="styles"
    ref="stackRef"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  direction: {
    type: String, // 'row', 'column', 'row-reverse', 'column-reverse'
    default: 'column'
  },
  spacing: {
    type: [Number, String],
    default: 0
  },
  align: {
    type: String, // flex-start, center, flex-end, stretch, baseline
    default: 'stretch'
  },
  justify: {
    type: String, // flex-start, center, flex-end, space-between, space-around, space-evenly
    default: 'flex-start'
  },
  wrap: {
    type: String, // nowrap, wrap, wrap-reverse
    default: 'nowrap'
  },
  width: {
    type: String,
    default: 'auto'
  },
  height: {
    type: String,
    default: 'auto'
  },
  // Resizer 관련 Props
  resizable: {
    type: Boolean,
    default: false
  },
  minSize: {
    type: Number,
    default: 100
  },
  maxSize: {
    type: Number,
    default: Infinity
  }
});

const stackRef = ref(null);
const resizers = ref([]);

const classes = computed(() => {
  return [
    `ctv-stack--${props.direction}`
  ];
});

const styles = computed(() => {
  const gapValue = typeof props.spacing === 'number' ? `${props.spacing * 4}px` : props.spacing; // spacing 1 = 4px
  
  return {
    display: 'flex',
    flexDirection: props.direction,
    gap: props.resizable ? '0' : gapValue, // resizable일 경우 gap 대신 resizer 사용
    alignItems: props.align,
    justifyContent: props.justify,
    flexWrap: props.wrap,
    width: props.width,
    height: props.height
  };
});

// Resizer 구현
const initResizers = () => {
  if (!props.resizable || !stackRef.value) return;

  // 기존 리사이저 제거
  removeResizers();

  const children = Array.from(stackRef.value.children).filter(el => !el.classList.contains('ctv-stack-resizer'));
  if (children.length < 2) return;

  const isHorizontal = props.direction.includes('row');

  for (let i = 0; i < children.length - 1; i++) {
    const beforeElement = children[i];
    const afterElement = children[i + 1];

    const resizer = document.createElement('div');
    resizer.className = 'ctv-stack-resizer';
    resizer.classList.add(isHorizontal ? 'ctv-stack-resizer-horizontal' : 'ctv-stack-resizer-vertical');
    
    // 스타일을 위해 클래스 추가 (main.css에 정의 필요)
    // 리사이저 삽입
    afterElement.parentNode.insertBefore(resizer, afterElement);
    resizers.value.push(resizer);

    bindResizerEvents(resizer, beforeElement, afterElement, isHorizontal);
  }
};

const removeResizers = () => {
  resizers.value.forEach(resizer => {
    if (resizer.parentNode) {
      resizer.parentNode.removeChild(resizer);
    }
  });
  resizers.value = [];
};

const bindResizerEvents = (resizer, beforeElement, afterElement, isHorizontal) => {
  let isResizing = false;
  let startX = 0;
  let startY = 0;
  let startBeforeSize = 0;
  let startAfterSize = 0;

  const onMouseDown = (e) => {
    isResizing = true;
    
    if (isHorizontal) {
      startX = e.clientX;
      startBeforeSize = beforeElement.offsetWidth;
      startAfterSize = afterElement.offsetWidth;
    } else {
      startY = e.clientY;
      startBeforeSize = beforeElement.offsetHeight;
      startAfterSize = afterElement.offsetHeight;
    }

    document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    
    // 리사이징 중 transition 제거
    beforeElement.style.transition = 'none';
    afterElement.style.transition = 'none';
    
    resizer.classList.add('active');

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!isResizing) return;

    let diff;
    if (isHorizontal) {
      diff = e.clientX - startX;
    } else {
      diff = e.clientY - startY;
    }

    let newBeforeSize = startBeforeSize + diff;
    let newAfterSize = startAfterSize - diff;

    // Min/Max 사이즈 체크
    newBeforeSize = Math.max(props.minSize, Math.min(props.maxSize, newBeforeSize));
    // afterElement에 대해서도 체크가 필요하다면 추가
    
    const actualDiff = newBeforeSize - startBeforeSize;
    
    if (isHorizontal) {
      beforeElement.style.width = `${newBeforeSize}px`;
      beforeElement.style.flex = `0 0 ${newBeforeSize}px`;
      // afterElement의 크기는 flex-grow 등으로 자동 조정되거나 고정될 수 있음
      // 여기서는 flexbox 특성을 살리기 위해 before만 조정하거나 둘 다 조정
      // CtvStack 원본 로직 참고: 둘 다 조정
      // afterElement.style.width = `${startAfterSize - actualDiff}px`;
      // afterElement.style.flex = `0 0 ${startAfterSize - actualDiff}px`;
    } else {
      beforeElement.style.height = `${newBeforeSize}px`;
      beforeElement.style.flex = `0 0 ${newBeforeSize}px`;
    }
  };

  const onMouseUp = () => {
    isResizing = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    beforeElement.style.transition = '';
    afterElement.style.transition = '';
    
    resizer.classList.remove('active');

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  resizer.addEventListener('mousedown', onMouseDown);
};

onMounted(() => {
  if (props.resizable) {
    // DOM 업데이트 후 리사이저 초기화 (slot 컨텐츠 로드 대기)
    setTimeout(initResizers, 0);
  }
});

onUnmounted(() => {
  removeResizers();
});

// props 변경 시 리사이저 재초기화
watch(() => [props.resizable, props.direction], () => {
  if (props.resizable) {
    setTimeout(initResizers, 0);
  } else {
    removeResizers();
  }
});
</script>

<style>
/* Scoped가 아닌 Global 스타일로 리사이저 스타일 정의 (동적 생성 요소라) */
.ctv-stack-resizer {
  background-color: var(--ctv-border-color, #dee2e6);
  z-index: 10;
  flex-shrink: 0;
  flex-grow: 0;
  transition: background-color 0.2s;
}

.ctv-stack-resizer:hover, .ctv-stack-resizer.active {
  background-color: var(--ctv-primary-color, #007bff);
}

.ctv-stack-resizer-horizontal {
  width: 4px;
  cursor: col-resize;
  height: 100%;
}

.ctv-stack-resizer-vertical {
  height: 4px;
  cursor: row-resize;
  width: 100%;
}
</style>
