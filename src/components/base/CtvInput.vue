<template>
  <div 
    :class="['ctv-input', { 'ctv-input--column': direction === 'column' }]"
  >
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
        <input
          :id="inputId"
          ref="inputRef"
          :type="type"
          :class="['ctv-input__field', { 'ctv-input__field--error': errorMessage }]"
          :value="internalValue"
          :placeholder="placeholder"
          :disabled="isDisabled"
          :readonly="isReadonly"
          :maxlength="maxlength"
          :min="min"
          :max="max"
          @input="handleInput"
          @change="handleChange"
          @blur="handleBlur"
          @focus="handleFocus"
          @keydown="handleKeydown"
        />

        <!-- Combo 드롭다운 -->
        <div
          v-if="comboItems && comboItems.length > 0"
          ref="comboDropdownRef"
          :class="['ctv-combo-dropdown', { 'ctv-combo-dropdown--show': showComboDropdown }]"
        >
          <div
            v-for="(item, index) in filteredComboItems"
            :key="index"
            :class="['ctv-combo-dropdown__item', { 'ctv-combo-dropdown__item--active': index === comboSelectedIndex }]"
            @mousedown.prevent="selectComboItem(item)"
            @mouseenter="comboSelectedIndex = index"
          >
            {{ getComboLabel(item) }}
          </div>
        </div>
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
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useFormField } from '@/composables/useFormField';
import { useValidation } from '@/composables/useValidation';
import { matchComboKeyword } from '@/utils/component-utils';

export default {
  name: 'CtvInput',
  props: {
    modelValue: {
      type: [String, Number],
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
    type: {
      type: String,
      default: 'text'
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
    pattern: {
      type: String,
      default: ''
    },
    patternMessage: {
      type: String,
      default: '입력 형식이 올바르지 않습니다.'
    },
    maxlength: {
      type: Number,
      default: undefined
    },
    minlength: {
      type: Number,
      default: undefined
    },
    min: {
      type: Number,
      default: undefined
    },
    max: {
      type: Number,
      default: undefined
    },
    labelAlign: {
      type: String,
      default: '', // left, center, right
      validator: (value) => ['', 'left', 'center', 'right'].includes(value)
    },
    direction: {
      type: String,
      default: 'row', // row, column
      validator: (value) => ['row', 'column'].includes(value)
    },
    field: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    // Combo 연관 검색
    comboItems: {
      type: Array,
      default: () => []
    },
    comboLabelKey: {
      type: String,
      default: 'label'
    },
    comboValueKey: {
      type: String,
      default: 'value'
    },
    comboMinLength: {
      type: Number,
      default: 0
    },
    comboDebounce: {
      type: Number,
      default: 300
    }
  },
  emits: ['update:modelValue', 'change', 'blur', 'focus', 'combo-select'],
  setup(props, { emit }) {
    const inputRef = ref(null);
    const comboDropdownRef = ref(null);
    const inputId = computed(() => props.name || props.field || `ctv-input-${Math.random().toString(36).substr(2, 9)}`);

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

    // Combo 관련 상태
    const showComboDropdown = ref(false);
    const comboSelectedIndex = ref(-1);
    const comboDebounceTimer = ref(null);

    // Combo 아이템 필터링
    const filteredComboItems = computed(() => {
      if (!props.comboItems || props.comboItems.length === 0) return [];
      const keyword = String(internalValue.value || '').trim();
      
      if (keyword.length < props.comboMinLength) return [];
      
      return props.comboItems.filter(item => {
        const normalizedItem = {
          label: getComboLabel(item),
          value: getComboValue(item)
        };
        return matchComboKeyword(keyword, normalizedItem);
      });
    });

    // Combo 라벨 가져오기
    const getComboLabel = (item) => {
      if (typeof item === 'string') return item;
      return item[props.comboLabelKey] || item.label || item.text || item.name || '';
    };

    // Combo 값 가져오기
    const getComboValue = (item) => {
      if (typeof item === 'string') return item;
      return item[props.comboValueKey] || item.value || item.id || '';
    };

    // Combo 아이템 선택
    const selectComboItem = (item) => {
      const value = getComboValue(item);
      internalValue.value = value;
      showComboDropdown.value = false;
      comboSelectedIndex.value = -1;
      
      emit('combo-select', {
        label: getComboLabel(item),
        value: value,
        item: item
      });
    };

    // Input 이벤트 핸들러
    const handleInput = (e) => {
      internalValue.value = e.target.value;
      
      // Combo 관련 처리
      if (props.comboItems && props.comboItems.length > 0) {
        clearTimeout(comboDebounceTimer.value);
        comboDebounceTimer.value = setTimeout(() => {
          const keyword = String(internalValue.value || '').trim();
          if (keyword.length >= props.comboMinLength && filteredComboItems.value.length > 0) {
            showComboDropdown.value = true;
            comboSelectedIndex.value = -1;
          } else {
            showComboDropdown.value = false;
          }
        }, props.comboDebounce);
      }
    };

    const handleChange = (e) => {
      // change 이벤트는 blur 시에만 발생하므로, validation 실행
      validate();
    };

    const handleBlur = (e) => {
      validate();
      emit('blur', { value: internalValue.value });
      
      // Combo 드롭다운 닫기 (약간의 딜레이 후)
      setTimeout(() => {
        showComboDropdown.value = false;
      }, 200);
    };

    const handleFocus = (e) => {
      clearError();
      emit('focus', { value: internalValue.value });
    };

    // 키보드 네비게이션
    const handleKeydown = (e) => {
      if (!showComboDropdown.value || filteredComboItems.value.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        comboSelectedIndex.value = Math.min(
          comboSelectedIndex.value + 1,
          filteredComboItems.value.length - 1
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        comboSelectedIndex.value = Math.max(comboSelectedIndex.value - 1, 0);
      } else if (e.key === 'Enter' && comboSelectedIndex.value >= 0) {
        e.preventDefault();
        selectComboItem(filteredComboItems.value[comboSelectedIndex.value]);
      } else if (e.key === 'Escape') {
        showComboDropdown.value = false;
        comboSelectedIndex.value = -1;
      }
    };

    // 외부에서 호출 가능한 메서드
    const focus = () => {
      inputRef.value?.focus();
    };

    const blur = () => {
      inputRef.value?.blur();
    };

    onUnmounted(() => {
      clearTimeout(comboDebounceTimer.value);
    });

    return {
      inputRef,
      comboDropdownRef,
      inputId,
      internalValue,
      isDisabled,
      isReadonly,
      isRequired,
      labelClasses,
      errorMessage,
      showComboDropdown,
      comboSelectedIndex,
      filteredComboItems,
      getComboLabel,
      getComboValue,
      selectComboItem,
      handleInput,
      handleChange,
      handleBlur,
      handleFocus,
      handleKeydown,
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
/* 컴포넌트별 추가 스타일이 필요하면 여기에 작성 */
</style>
