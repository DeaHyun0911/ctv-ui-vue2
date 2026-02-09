/**
 * useFormField Composable
 * 
 * 모든 폼 컴포넌트(Input, Select, Date, Textarea, Check, Switch)가 공통으로 사용하는 기능
 * - v-model 지원 (modelValue props + update:modelValue emit)
 * - ASP.NET 초기 데이터 연동
 * - 상태 관리 (disabled, readonly, required)
 * - 변경 감지 및 이벤트 발생
 */

import { ref, computed, watch, onMounted } from 'vue';

export function useFormField(props, emit, options = {}) {
    const {
        // 컴포넌트별 초기값 변환 함수
        parseInitialValue = (val) => val,
        // 값 변경 시 추가 처리
        onValueChange = null,
    } = options;

    // 내부 값 (v-model과 동기화)
    const internalValue = ref(parseInitialValue(props.modelValue));

    // props.modelValue 변경 시 내부 값 업데이트
    watch(() => props.modelValue, (newVal) => {
        const parsed = parseInitialValue(newVal);
        if (internalValue.value !== parsed) {
            internalValue.value = parsed;
        }
    });

    // 내부 값 변경 시 v-model 업데이트 및 이벤트 발생
    watch(internalValue, (newVal, oldVal) => {
        // v-model 업데이트
        emit('update:modelValue', newVal);

        // change 이벤트 (기존 ctv-ui 호환성)
        emit('change', {
            value: newVal,
            oldValue: oldVal,
            field: props.field || props.name
        });

        // 추가 처리 함수 호출
        if (onValueChange && typeof onValueChange === 'function') {
            onValueChange(newVal, oldVal);
        }
    });

    // disabled 상태 (computed로 동적 계산)
    const isDisabled = computed(() => {
        return props.disabled === true || props.disabled === '';
    });

    // readonly 상태
    const isReadonly = computed(() => {
        return props.readonly === true || props.readonly === '';
    });

    // required 상태
    const isRequired = computed(() => {
        return props.required === true || props.required === '';
    });

    // 값 설정 메서드 (외부에서 호출 가능)
    const setValue = (value) => {
        internalValue.value = parseInitialValue(value);
    };

    // 값 가져오기 메서드
    const getValue = () => {
        return internalValue.value;
    };

    // 값 초기화
    const clear = () => {
        internalValue.value = parseInitialValue(undefined);
    };

    // ASP.NET 초기 데이터 연동 (mounted 시 한 번만 실행)
    onMounted(() => {
        // field 속성이 있고, 전역 데이터가 있으면 초기값 설정
        if (props.field && window.gFormData && window.gFormData[props.field] !== undefined) {
            const aspNetValue = window.gFormData[props.field];
            if (internalValue.value === undefined || internalValue.value === null || internalValue.value === '') {
                setValue(aspNetValue);
            }
        }
    });

    return {
        internalValue,
        isDisabled,
        isReadonly,
        isRequired,
        setValue,
        getValue,
        clear
    };
}
