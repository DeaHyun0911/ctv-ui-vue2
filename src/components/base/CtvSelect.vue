<template>
  <div :class="['ctv-select', { 'ctv-select--column': direction === 'column' }]">
    <div class="ctv-input__inner">
      <!-- 라벨 -->
      <label 
        v-if="label"
        :class="labelClasses"
        :for="inputId"
      >
        {{ label }}
      </label>

      <!-- Select wrapper -->
      <div class="ctv-input__wrapper">
        <div
          ref="selectRef"
          :class="['ctv-select__field', { 'ctv-select__field--open': isOpen, 'ctv-select__field--error': errorMessage }]"
          :tabindex="isDisabled ? -1 : 0"
          @click="toggleDropdown"
          @keydown="handleKeydown"
        >
          <span :class="['ctv-select__value', { 'ctv-select__value--placeholder': !selectedLabel }]">
            {{ selectedLabel || placeholder || '선택하세요' }}
          </span>
          <span class="ctv-select__arrow">▼</span>
        </div>

        <!-- Dropdown -->
        <div
          v-if="isOpen"
          ref="dropdownRef"
          class="ctv-select-dropdown"
        >
          <!-- 검색 input (searchable일 때만) -->
          <div v-if="searchable" class="ctv-select-search">
            <input
              ref="searchInputRef"
              v-model="searchKeyword"
              type="text"
              class="ctv-select-search__input"
              placeholder="검색..."
              @click.stop
              @keydown.stop="handleSearchKeydown"
            />
          </div>

          <!-- 옵션 목록 -->
          <div class="ctv-select-dropdown__list">
            <div
              v-for="(item, index) in filteredItems"
              :key="getItemValue(item, index)"
              :class="['ctv-select-dropdown__item', { 
                'ctv-select-dropdown__item--active': isSelected(item),
                'ctv-select-dropdown__item--hover': index === hoverIndex
              }]"
              @click="selectItem(item)"
              @mouseenter="hoverIndex = index"
            >
              {{ getItemLabel(item) }}
            </div>
            <div v-if="filteredItems.length === 0" class="ctv-select-dropdown__empty">
              검색 결과가 없습니다
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 에러 메시지 -->
    <div 
      :class="['ctv-input__error', { 'ctv-input__error--show': errorMessage }]"
    >
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';
import { useFormField } from '@/composables/useFormField';
import { useValidation } from '@/composables/useValidation';
import { matchesKeyword } from '@/utils/component-utils';
import { setupClickOutside } from '@/utils/dropdown-utils';

export default {
  name: 'CtvSelect',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Object],
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
    items: {
      type: Array,
      default: () => []
    },
    labelKey: {
      type: String,
      default: 'label'
    },
    valueKey: {
      type: String,
      default: 'value'
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
      default: '필수 선택 항목입니다.'
    },
    searchable: {
      type: Boolean,
      default: true
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
    const selectRef = ref(null);
    const dropdownRef = ref(null);
    const searchInputRef = ref(null);
    const inputId = computed(() => props.name || props.field || `ctv-select-${Math.random().toString(36).substr(2, 9)}`);

    const isOpen = ref(false);
    const searchKeyword = ref('');
    const hoverIndex = ref(0);

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

    // 아이템에서 label 추출
    const getItemLabel = (item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item);
      return item[props.labelKey] || item.text || item.label || '';
    };

    // 아이템에서 value 추출
    const getItemValue = (item, index) => {
      if (typeof item === 'string' || typeof item === 'number') return item;
      return item[props.valueKey] !== undefined ? item[props.valueKey] : index;
    };

    // 현재 선택된 아이템의 label
    const selectedLabel = computed(() => {
      if (!internalValue.value) return '';
      const item = props.items.find(item => getItemValue(item) === internalValue.value);
      return item ? getItemLabel(item) : '';
    });

    // 검색 필터링 (한글 초성 지원)
    const filteredItems = computed(() => {
      if (!props.searchable || !searchKeyword.value) return props.items;
      
      const keyword = searchKeyword.value.toLowerCase();
      return props.items.filter(item => {
        const label = getItemLabel(item);
        return matchesKeyword(label, keyword);
      });
    });

    // 선택 여부 확인
    const isSelected = (item) => {
      return getItemValue(item) === internalValue.value;
    };

    // 드롭다운 토글
    const toggleDropdown = () => {
      if (isDisabled.value || isReadonly.value) return;
      
      isOpen.value = !isOpen.value;
      if (isOpen.value) {
        searchKeyword.value = '';
        hoverIndex.value = 0;
        
        // 검색 input에 포커스
        if (props.searchable) {
          nextTick(() => { searchInputRef.value?.focus();
          });
        }
        
        // 현재 선택된 아이템으로 스크롤
        if (internalValue.value) {
          const index = props.items.findIndex(item => getItemValue(item) === internalValue.value);
          if (index > -1) hoverIndex.value = index;
        }
        
        emit('focus', { value: internalValue.value });
      } else {
        emit('blur', { value: internalValue.value });
      }
    };

    // 아이템 선택
    const selectItem = (item) => {
      const value = getItemValue(item);
      internalValue.value = value;
      isOpen.value = false;
      validate();
      emit('change', { value: value, label: getItemLabel(item), item });
    };

    // 키보드 네비게이션
    const handleKeydown = (e) => {
      if (isDisabled.value) return;

      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!isOpen.value) {
          toggleDropdown();
        } else if (filteredItems.value.length > 0) {
          selectItem(filteredItems.value[hoverIndex.value]);
        }
      } else if (e.key === 'Escape') {
        isOpen.value = false;
      } else if (isOpen.value) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          hoverIndex.value = (hoverIndex.value + 1) % filteredItems.value.length;
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          hoverIndex.value = (hoverIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length;
        }
      }
    };

    // 검색 input 키보드 이벤트
    const handleSearchKeydown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        hoverIndex.value = (hoverIndex.value + 1) % filteredItems.value.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        hoverIndex.value = (hoverIndex.value - 1 + filteredItems.value.length) % filteredItems.value.length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems.value.length > 0) {
          selectItem(filteredItems.value[hoverIndex.value]);
        }
      } else if (e.key === 'Escape') {
        isOpen.value = false;
      }
    };

    // 외부 클릭 감지
    watch(isOpen, (newVal) => {
      if (newVal) {
        setupClickOutside(selectRef.value, () => {
          isOpen.value = false;
        });
      }
    });

    // hoverIndex가 유효한 범위 내에 있도록 보장
    watch(filteredItems, () => {
      if (hoverIndex.value >= filteredItems.value.length) {
        hoverIndex.value = Math.max(0, filteredItems.value.length - 1);
      }
    });

    const focus = () => {
      selectRef.value?.focus();
    };

    const blur = () => {
      selectRef.value?.blur();
    };

    return {
      selectRef,
      dropdownRef,
      searchInputRef,
      inputId,
      internalValue,
      isDisabled,
      isReadonly,
      isRequired,
      labelClasses,
      errorMessage,
      isOpen,
      searchKeyword,
      hoverIndex,
      selectedLabel,
      filteredItems,
      getItemLabel,
      getItemValue,
      isSelected,
      toggleDropdown,
      selectItem,
      handleKeydown,
      handleSearchKeydown,
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
.ctv-select__field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  background-color: white;
  border: 1px solid var(--ctv-border-color, #ddd);
  border-radius: var(--ctv-border-radius, 4px);
  cursor: pointer;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  user-select: none;
}

.ctv-select__field:focus {
  outline: none;
  border-color: var(--ctv-primary-color, #007bff);
  box-shadow: var(--ctv-focus-shadow, 0 0 0 3px rgba(0, 123, 255, 0.25));
}

.ctv-select__field--open {
  border-color: var(--ctv-primary-color, #007bff);
}

.ctv-select__field--error {
  border-color: var(--ctv-error-color, #dc3545);
}

.ctv-select__value {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ctv-select__value--placeholder {
  color: #999;
}

.ctv-select__arrow {
  margin-left: 8px;
  font-size: 10px;
  color: #666;
  transition: transform 0.2s;
}

.ctv-select__field--open .ctv-select__arrow {
  transform: rotate(180deg);
}

.ctv-select-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid var(--ctv-border-color, #ddd);
  border-radius: var(--ctv-border-radius, 4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ctv-select-search {
  padding: 8px;
  border-bottom: 1px solid var(--ctv-border-color, #ddd);
}

.ctv-select-search__input {
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  border: 1px solid var(--ctv-border-color, #ddd);
  border-radius: var(--ctv-border-radius, 4px);
}

.ctv-select-search__input:focus {
  outline: none;
  border-color: var(--ctv-primary-color, #007bff);
}

.ctv-select-dropdown__list {
  flex: 1;
  overflow-y: auto;
}

.ctv-select-dropdown__item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.15s;
}

.ctv-select-dropdown__item:hover,
.ctv-select-dropdown__item--hover {
  background-color: #f0f0f0;
}

.ctv-select-dropdown__item--active {
  background-color: #e6f2ff;
  color: var(--ctv-primary-color, #007bff);
  font-weight: 500;
}

.ctv-select-dropdown__empty {
  padding: 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>
