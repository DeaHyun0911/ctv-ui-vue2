/**
 * useValidation Composable
 * 
 * 폼 필드의 유효성 검사 기능
 * - 기존 CtvDataGrid.GRID_VALIDATORS 규칙 지원
 * - 실시간 유효성 검사
 * - 에러 메시지 관리
 */

import { ref, computed, watch } from 'vue';

// 기존 ctv-Component.js의 GRID_VALIDATORS를 Vue로 이식
const VALIDATORS = {
    // 영문과 숫자만 허용
    code: {
        rule: 'pattern',
        value: '^[a-zA-Z0-9]+$',
        message: '영문과 숫자만 입력 가능합니다.'
    },

    // 이메일 형식
    email: {
        rule: 'pattern',
        value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        message: '올바른 이메일 형식이 아닙니다.'
    },

    // 전화번호 (숫자와 하이픈만)
    phone: {
        rule: 'pattern',
        value: '^[0-9-]+$',
        message: '전화번호 형식이 올바르지 않습니다.'
    },

    // 숫자만
    number: {
        rule: 'pattern',
        value: '^[0-9]+$',
        message: '숫자만 입력 가능합니다.'
    },

    // URL
    url: {
        rule: 'pattern',
        value: '^https?:\\/\\/.+',
        message: '올바른 URL 형식이 아닙니다.'
    }
};

export function useValidation(valueRef, props) {
    const errorMessage = ref('');
    const isValid = ref(true);

    // 유효성 검사 실행
    const validate = () => {
        // required 체크
        if (props.required) {
            if (valueRef.value === undefined || valueRef.value === null || valueRef.value === '') {
                errorMessage.value = props.requiredMessage || '필수 입력 항목입니다.';
                isValid.value = false;
                return false;
            }
        }

        // validators 체크
        if (props.validators && Array.isArray(props.validators)) {
            for (const validatorKey of props.validators) {
                const validator = VALIDATORS[validatorKey];
                if (!validator) continue;

                if (validator.rule === 'pattern') {
                    const regex = new RegExp(validator.value);
                    if (!regex.test(String(valueRef.value || ''))) {
                        errorMessage.value = validator.message;
                        isValid.value = false;
                        return false;
                    }
                }
            }
        }

        // pattern 속성 체크
        if (props.pattern) {
            const regex = new RegExp(props.pattern);
            if (!regex.test(String(valueRef.value || ''))) {
                errorMessage.value = props.patternMessage || '입력 형식이 올바르지 않습니다.';
                isValid.value = false;
                return false;
            }
        }

        // minlength 체크
        if (props.minlength !== undefined) {
            const length = String(valueRef.value || '').length;
            if (length < props.minlength) {
                errorMessage.value = `최소 ${props.minlength}자 이상 입력해야 합니다.`;
                isValid.value = false;
                return false;
            }
        }

        // maxlength는 input의 maxlength 속성으로 자동 처리되므로 검사 불필요

        // min/max (숫자)
        if (props.min !== undefined) {
            const num = Number(valueRef.value);
            if (!isNaN(num) && num < props.min) {
                errorMessage.value = `${props.min} 이상의 값을 입력해야 합니다.`;
                isValid.value = false;
                return false;
            }
        }

        if (props.max !== undefined) {
            const num = Number(valueRef.value);
            if (!isNaN(num) && num > props.max) {
                errorMessage.value = `${props.max} 이하의 값을 입력해야 합니다.`;
                isValid.value = false;
                return false;
            }
        }

        // 모든 검사 통과
        errorMessage.value = '';
        isValid.value = true;
        return true;
    };

    // 에러 초기화
    const clearError = () => {
        errorMessage.value = '';
        isValid.value = true;
    };

    // 값 변경 시 자동 검사 (blur 시에만 검사하려면 이 watch 제거)
    watch(valueRef, () => {
        if (errorMessage.value) {
            // 에러가 있는 상태에서만 재검사 (입력 중에는 에러 표시 안함)
            validate();
        }
    });

    return {
        errorMessage,
        isValid,
        validate,
        clearError
    };
}
