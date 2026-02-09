<template>
  <div :class="['ctv-date', { 'ctv-date--column': direction === 'column' }]">
    <div class="ctv-input__inner">
      <!-- 라벨 -->
      <label
        v-if="label"
        :class="labelClasses"
        :for="inputId"
      >
        {{ label }}
      </label>

      <!-- Single/Date/Month/Year 모드 -->
      <div v-if="mode !== 'range'" class="ctv-input__wrapper">
        <input
          :id="inputId"
          ref="inputRef"
          type="text"
          :class="['ctv-date__field', { 'ctv-date__field--error': errorMessage }]"
          :value="modelValue"
          :placeholder="computedPlaceholder"
          :disabled="isDisabled"
          :readonly="readonly"
          :data-mode="mode"
          autocomplete="off"
          @input="handleInput"
          @blur="handleBlur"
        />
        <!-- 달력 버튼 -->
        <button
          type="button"
          class="ctv-date__icon"
          :disabled="isDisabled || readonly"
          aria-label="달력 열기"
          @click="openCalendar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>

      <!-- Range 모드 -->
      <div v-else class="ctv-input__wrapper">
        <div class="ctv-date__range">
          <div class="ctv-date__range-input">
            <input
              ref="startInputRef"
              type="text"
              :class="['ctv-date__field', { 'ctv-date__field--error': errorMessage }]"
              :value="startDateValue"
              :placeholder="computedPlaceholder"
              :disabled="isDisabled"
              :readonly="readonly"
              data-role="from"
              :data-mode="mode"
              autocomplete="off"
              @input="handleStartInput"
              @blur="handleBlur"
            />
            <button
              type="button"
              class="ctv-date__icon"
              data-target="from"
              :disabled="isDisabled || readonly"
              aria-label="달력 열기"
              @click="openStartCalendar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
          </div>
          <span class="ctv-date__separator">~</span>
          <div class="ctv-date__range-input">
            <input
              ref="endInputRef"
              type="text"
              :class="['ctv-date__field', { 'ctv-date__field--error': errorMessage }]"
              :value="endDateValue"
              :placeholder="computedPlaceholder"
              :disabled="isDisabled"
              :readonly="readonly"
              data-role="to"
              :data-mode="mode"
              autocomplete="off"
              @input="handleEndInput"
              @blur="handleBlur"
            />
            <button
              type="button"
              class="ctv-date__icon"
              data-target="to"
              :disabled="isDisabled || readonly"
              aria-label="달력 열기"
              @click="openEndCalendar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </button>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useFormField } from '@/composables/useFormField';
import { useValidation } from '@/composables/useValidation';
import flatpickr from 'flatpickr';
import { Korean } from 'flatpickr/dist/l10n/ko.js';
import monthSelectPlugin from 'flatpickr/dist/plugins/monthSelect/index';
import 'flatpickr/dist/flatpickr.css';
import 'flatpickr/dist/plugins/monthSelect/style.css';

export default {
  name: 'CtvDate',
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
    min: {
      type: String,
      default: ''
    },
    max: {
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
    },
    mode: {
      type: String,
      default: 'date', // date (년월일), month (년월), year (년도), range (범위)
      validator: (value) => ['date', 'month', 'year', 'range'].includes(value)
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
  emits: ['update:modelValue', 'change', 'blur'],
  setup(props, { emit }) {
    const inputRef = ref(null);
    const startInputRef = ref(null);
    const endInputRef = ref(null);
    const inputId = computed(() => props.name || props.field || `ctv-date-${Math.random().toString(36).substr(2, 9)}`);
    
    // 인스턴스 참조
    const fpInstance = ref(null);
    const fpStartInstance = ref(null);
    const fpEndInstance = ref(null);

    // useFormField composable 사용
    const { isRequired } = useFormField(props, emit);

    const isDisabled = computed(() => props.disabled === true || props.disabled === '');

    // useValidation composable 사용
    const { errorMessage, validate } = useValidation(computed(() => props.modelValue), props);

    // 라벨 클래스
    const labelClasses = computed(() => {
      const classes = ['ctv-input__label'];
      if (isRequired.value) classes.push('ctv-input__label--required');
      if (props.labelAlign) classes.push(`ctv-input__label--${props.labelAlign}`);
      return classes;
    });

    // Range 모드 값 분리
    const startDateValue = computed(() => {
        if (props.mode === 'range' && props.modelValue && props.modelValue.includes('~')) {
            return props.modelValue.split('~')[0].trim();
        }
        return '';
    });

    const endDateValue = computed(() => {
        if (props.mode === 'range' && props.modelValue && props.modelValue.includes('~')) {
            return props.modelValue.split('~')[1]?.trim() || '';
        }
        return '';
    });

    // placeholder 설정
    const computedPlaceholder = computed(() => {
      if (props.placeholder) return props.placeholder;
      switch (props.mode) {
        case 'year': return 'YYYY';
        case 'month': return 'YYYY-MM';
        default: return 'YYYY-MM-DD';
      }
    });

    // "오늘" 버튼 추가 플러그인
    const todayButtonPlugin = (fp) => {
        return {
            onReady: () => {
                const footer = document.createElement('div');
                footer.className = 'flatpickr-footer';
                const button = document.createElement('button');
                button.className = 'flatpickr-today-button';
                button.textContent = '오늘';
                button.type = 'button';
                button.addEventListener('click', () => {
                    const today = new Date();
                    fp.setDate(today, true);
                    fp.close();
                });
                footer.appendChild(button);
                fp.calendarContainer.appendChild(footer);
            }
        };
    };

    // 공통 옵션 가져오기
    const getCommonOptions = () => ({
        locale: Korean,
        allowInput: true,
        disableMobile: true, // 모바일에서도 커스텀 UI 사용
        clickOpens: false, // 수동 제어 (아이콘 클릭 등)
        onClose: () => validate()
    });

    // 모드별 옵션
    const getModeOptions = () => {
        const base = getCommonOptions();
        
        if (props.mode === 'year') {
            return {
                ...base,
                dateFormat: 'Y',
                plugins: [todayButtonPlugin]
                // Year 모드는 별도 플러그인이나 커스텀 필요할 수 있음 (여기서는 기본 텍스트 처리나 별도 로직 가정)
            };
        }
        
        if (props.mode === 'month') {
            return {
                ...base,
                dateFormat: 'Y-m',
                plugins: [
                    new monthSelectPlugin({ shorthand: false, dateFormat: 'Y-m', theme: 'light' }),
                    todayButtonPlugin
                ]
            };
        }

        // date (default)
        return {
            ...base,
            dateFormat: 'Y-m-d',
            plugins: [todayButtonPlugin]
        };
    };

    // 단일 모드 초기화
    const initSinglePicker = () => {
        if (!inputRef.value) return;
        const options = {
            ...getModeOptions(),
            defaultDate: props.modelValue,
            onChange: (selectedDates, dateStr) => {
                emit('update:modelValue', dateStr);
                emit('change', { value: dateStr, dates: selectedDates });
            }
        };
        fpInstance.value = flatpickr(inputRef.value, options);
    };

    // Range 모드 초기화 (Start/End 분리)
    const initRangePickers = () => {
        if (!startInputRef.value || !endInputRef.value) return;
        
        const options = getModeOptions(); // date or month 옵션 사용 (Range 내부는 단일 선택)

        // Start Picker
        fpStartInstance.value = flatpickr(startInputRef.value, {
            ...options,
            defaultDate: startDateValue.value,
            onChange: (selectedDates, dateStr) => {
                const endVal = endDateValue.value;
                const newVal = endVal ? `${dateStr} ~ ${endVal}` : `${dateStr} ~ `;
                emit('update:modelValue', newVal);
                
                // End Picker minDate 업데이트
                if (fpEndInstance.value) fpEndInstance.value.set('minDate', dateStr);
            }
        });

        // End Picker
        fpEndInstance.value = flatpickr(endInputRef.value, {
            ...options,
            defaultDate: endDateValue.value,
            minDate: startDateValue.value, // 초기 minDate
            onChange: (selectedDates, dateStr) => {
                const startVal = startDateValue.value;
                const newVal = startVal ? `${startVal} ~ ${dateStr}` : ` ~ ${dateStr}`;
                emit('update:modelValue', newVal);
            }
        });
    };

    onMounted(async () => {
        // monthSelectPlugin 동적 로드
        if (props.mode === 'month') {
             await import('flatpickr/dist/plugins/monthSelect/style.css');
        }
        // monthSelectPlugin은 전역으로 import 하거나 여기서 import 해야함.
        // 편의상 상단 script에서 import 했다고 가정하고 여기선 생략 또는 필요시 추가.
        
        if (props.mode === 'range') {
            initRangePickers();
        } else {
            initSinglePicker();
        }
    });

    onUnmounted(() => {
        fpInstance.value?.destroy();
        fpStartInstance.value?.destroy();
        fpEndInstance.value?.destroy();
    });

    // Watchers
    watch(() => props.modelValue, (newVal) => {
        if (props.mode === 'range') {
             // Range 모드 업데이트
             const start = startDateValue.value;
             const end = endDateValue.value;
             fpStartInstance.value?.setDate(start, false);
             fpEndInstance.value?.setDate(end, false);
        } else {
            fpInstance.value?.setDate(newVal, false);
        }
    });

    const openCalendar = () => fpInstance.value?.open();
    const openStartCalendar = () => fpStartInstance.value?.open();
    const openEndCalendar = () => fpEndInstance.value?.open();

    // Input 핸들러 (수동 입력)
    const handleInput = (e) => emit('update:modelValue', e.target.value);
    
    const handleStartInput = (e) => {
        const val = e.target.value;
        const end = endDateValue.value;
        emit('update:modelValue', `${val} ~ ${end}`);
    };

    const handleEndInput = (e) => {
        const val = e.target.value;
        const start = startDateValue.value;
        emit('update:modelValue', `${start} ~ ${val}`);
    };
    
    const handleBlur = () => validate();

    return {
        inputRef, startInputRef, endInputRef,
        inputId,
        startDateValue, endDateValue,
        computedPlaceholder,
        isDisabled, isRequired, labelClasses, errorMessage,
        handleInput, handleStartInput, handleEndInput, handleBlur,
        openCalendar, openStartCalendar, openEndCalendar
    };
  }
};
</script>

<style scoped>
/* BEM 네이밍 컨벤션 사용 - 다른 Vue 컴포넌트와 일관성 유지 */

.ctv-date {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.ctv-date--column {
  flex-direction: column;
  align-items: flex-start;
}

/* Date field 스타일 */
.ctv-date__field {
  width: 100%;
  padding: 6px 12px;
  font-size: 14px;
  background-color: white;
  border: 1px solid var(--ctv-border-color, #e2e8f0);
  border-radius: var(--ctv-border-radius, 4px);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.ctv-date__field:focus {
  outline: none;
  border-color: var(--ctv-primary-color, #2196F3);
  box-shadow: var(--ctv-focus-shadow, 0 0 0 3px rgba(33, 150, 243, 0.1));
}

.ctv-date__field:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.ctv-date__field--error {
  border-color: var(--ctv-error-color, #dc3545);
}

/* 달력 아이콘 버튼 */
.ctv-date__icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  transition: color 0.2s;
}

.ctv-date__icon:hover:not(:disabled) {
  color: var(--ctv-primary-color, #2196F3);
}

.ctv-date__icon:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

/* Range 모드 */
.ctv-date__range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.ctv-date__range-input {
  position: relative;
  flex: 1;
}

.ctv-date__separator {
  color: #666;
  font-size: 14px;
  flex-shrink: 0;
}
</style>

<style>
/* Global Flatpickr Overrides - 현대적이고 깔끔한 디자인 */
.flatpickr-calendar {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    overflow: hidden;
}

.flatpickr-months {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px;
}

.flatpickr-current-month {
    font-size: 15px;
    font-weight: 600;
    color: #1a202c;
}

.flatpickr-weekdays {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    height: 36px;
}

span.flatpickr-weekday {
    color: #64748b;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
}

/* 일요일 빨강, 토요일 파랑 */
span.flatpickr-weekday:first-child {
    color: #dc2626;
}
span.flatpickr-weekday:last-child {
    color: #2196F3;
}

.flatpickr-day {
    color: #1a202c;
    border-radius: 6px;
    border: none;
    font-size: 13px;
    font-weight: 500;
}

/* 일요일/토요일 날짜 색상 */
.flatpickr-day:nth-child(7n+1):not(.nextMonthDay):not(.prevMonthDay) {
    color: #dc2626;
}
.flatpickr-day:nth-child(7n):not(.nextMonthDay):not(.prevMonthDay) {
    color: #2196F3;
}

/* 이전/다음 달 */
.flatpickr-day.prevMonthDay,
.flatpickr-day.nextMonthDay {
    color: #cbd5e0;
}

/* 선택된 날짜 */
.flatpickr-day.selected,
.flatpickr-day.startRange,
.flatpickr-day.endRange,
.flatpickr-day.selected.inRange,
.flatpickr-day.startRange.inRange,
.flatpickr-day.endRange.inRange,
.flatpickr-day.selected:focus,
.flatpickr-day.startRange:focus,
.flatpickr-day.endRange:focus,
.flatpickr-day.selected:hover,
.flatpickr-day.startRange:hover,
.flatpickr-day.endRange:hover,
.flatpickr-day.selected.prevMonthDay,
.flatpickr-day.startRange.prevMonthDay,
.flatpickr-day.endRange.prevMonthDay,
.flatpickr-day.selected.nextMonthDay,
.flatpickr-day.startRange.nextMonthDay,
.flatpickr-day.endRange.nextMonthDay {
    background: #2196F3;
    color: #ffffff;
    font-weight: 600;
    border: none;
}

/* 호버 */
.flatpickr-day:hover:not(.selected):not(.startRange):not(.endRange) {
    background: #e3f2fd;
    color: #2196F3;
}

/* 오늘 */
.flatpickr-day.today {
    border: 2px solid #2196F3;
    font-weight: 600;
}

.flatpickr-day.today:not(.selected) {
    background: transparent;
}

/* Footer */
.flatpickr-footer {
    padding: 10px;
    text-align: center;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
}

.flatpickr-today-button {
    padding: 6px 18px;
    background: #ffffff;
    border: 1px solid #2196F3;
    color: #2196F3;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s;
}

.flatpickr-today-button:hover {
    background: #2196F3;
    color: #ffffff;
}

/* Month Select Plugin */
.flatpickr-monthSelect-month {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    margin: 4px;
    height: 38px;
    line-height: 38px;
    border-radius: 6px;
    font-size: 13px;
    transition: all 0.2s;
}

.flatpickr-monthSelect-month:hover {
    background: #e3f2fd;
    border-color: #2196F3;
    color: #2196F3;
}

.flatpickr-monthSelect-month.selected {
    background: #2196F3;
    border-color: #2196F3;
    color: #ffffff;
    font-weight: 600;
}

/* 네비게이션 화살표 */
.flatpickr-months .flatpickr-prev-month,
.flatpickr-months .flatpickr-next-month {
    color: #64748b;
}

.flatpickr-months .flatpickr-prev-month:hover,
.flatpickr-months .flatpickr-next-month:hover {
    color: #2196F3;
}
</style>
