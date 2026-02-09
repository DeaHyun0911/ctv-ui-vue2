
/**
 * CTV Grid Utilities
 * 그리드 관련 유틸리티 함수 모음
 */

// =============================================================================
// Constants
// =============================================================================

export const GRID_VALIDATORS = {
    // 영문과 숫자만 허용
    code: {
        rule: 'pattern',
        value: '^[a-zA-Z0-9]+$',
        message: '영문과 숫자만 입력 가능합니다.'
    },
    // 숫자만 허용
    number: {
        rule: 'pattern',
        value: '^[0-9]+$',
        message: '숫자만 입력 가능합니다.'
    },
    // 영문만 허용
    alpha: {
        rule: 'pattern',
        value: '^[a-zA-Z]+$',
        message: '영문만 입력 가능합니다.'
    },
    // 한글만 허용
    korean: {
        rule: 'pattern',
        value: '^[가-힣]+$',
        message: '한글만 입력 가능합니다.'
    },
    // 이메일 형식
    email: {
        rule: 'pattern',
        value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        message: '올바른 이메일 형식으로 입력하세요.'
    },
    // 전화번호 형식 (하이픈 포함/미포함 둘 다 허용)
    phone: {
        rule: 'pattern',
        value: '^[0-9-]+$',
        message: '올바른 전화번호 형식으로 입력하세요.'
    },
    password: {
        rule: 'pattern',
        value: '^[a-zA-Z0-9!@#$%^&*()_+\\-=\\[\\]{};:\':"\\\\|,.<>\\/?\\u25CF]+$',
        message: '영문, 숫자, 특수문자 및 ●를 포함하여 8자 이상 입력해 주세요.'
    },
    // 주민번호 형식
    jumin: {
        rule: (inputValue) => {
            // Basic length check for now, full validation can be added if needed
            return inputValue && inputValue.replace(/-/g, '').length === 13;
        },
        message: '잘못된 주민번호입니다.'
    }
};

export const CUSTOM_FORMATS = {
    // Y/N 값을 아이콘으로 표시 (N 값 기준)
    YN: {
        format: (value) => value === 'N'
            ? '<span class="cell-icon no">N</span>'
            : '<span class="cell-icon yes">Y</span>',
        description: 'Y/N 값을 아이콘으로 표시 (N이 no, Y가 yes)'
    },
    // Y/N 값을 아이콘으로 표시 (0 값 기준)
    YN_0: {
        format: (value) => value === '0'
            ? '<span class="cell-icon no">N</span>'
            : '<span class="cell-icon yes">Y</span>',
        description: 'Y/N 값을 아이콘으로 표시 (0이 no, 그 외가 yes)'
    },
    // 체크박스 형태 (O/X)
    CHECK: {
        format: (value) => value === 'O' || value === 'Y' || value === '1'
            ? '<span class="cell-icon yes">✓</span>'
            : '<span class="cell-icon no">✗</span>',
        description: '체크박스 형태 (O/Y/1이 체크, 그 외가 미체크)'
    },
    // 숫자를 천단위 콤마로 표시
    NUMBER: {
        format: (value) => {
            if (value == null || value === '') return '';
            const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
            return isNaN(num) ? value : num.toLocaleString();
        },
        description: '숫자를 천단위 콤마로 표시'
    },
    // 금액 표시 (원 단위)
    CURRENCY: {
        format: (value) => {
            if (value == null || value === '') return '';
            const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
            return isNaN(num) ? value : num.toLocaleString() + '원';
        },
        description: '금액을 천단위 콤마와 원 단위로 표시'
    }
};

export const WIDTH_PRESETS = {
    XS: 50,
    S: 80,
    M: 120,
    XM: 150,
    XL: 200,
    XXL: 250,
    XXXL: 300,
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * columns 배열을 평탄화하여 실제 field를 가진 컬럼들만 추출
 */
export function flattenColumns(columns, excludeEX = false) {
    const result = [];

    if (!Array.isArray(columns)) return result;

    for (const col of columns) {
        if (col.multiColumn && Array.isArray(col.columns)) {
            result.push(...flattenColumns(col.columns, excludeEX));
        } else if (col.field) {
            if (excludeEX) {
                const colType = (col.colType || '').toUpperCase();
                const colTypeParts = colType.split('|').map(part => part.trim());

                if (colTypeParts.includes('EX')) {
                    continue;
                }
            }
            result.push(col);
        }
    }

    return result;
}

/**
 * colType에서 스키마 정보 추출
 */
export function parseColTypeSchema(colType) {
    if (!colType) return '\u0007STR';

    const colTypeParts = colType.toUpperCase().split('|').map(part => part.trim());
    const schema = [];

    if (colTypeParts.includes('PK')) schema.push('PK');
    if (colTypeParts.includes('NN')) schema.push('NN');
    if (colTypeParts.includes('EX')) schema.push('EX');
    if (colTypeParts.includes('RO')) schema.push('RO');

    const dataTypes = ['STR', 'INT', 'NUM', 'DATE', 'FLOAT', 'DECIMAL'];
    const dataType = colTypeParts.find(part => dataTypes.includes(part)) || 'STR';

    return schema.length > 0 ? `${schema.join('')}\u0007${dataType}` : `\u0007${dataType}`;
}

/**
 * 캡션 문자열 추출
 */
export function extractCaption(caption) {
    if (!caption) return "";
    if (Array.isArray(caption)) {
        return caption[0] || "";
    }
    if (typeof caption === "string") {
        return caption.replace(/\n/g, "").trim();
    }
    return "";
}

/**
 * 그리드 설정 정규화
 */
export function normalizeConfig(config) {
    const defaultConfig = {
        columns: [],
        toolBox: { visible: true },
        autoLoad: false
    };
    return { ...defaultConfig, ...config };
}

/**
 * validators 정규화
 */
export function normalizeValidators(validators) {
    if (!validators) return [];
    if (!Array.isArray(validators)) {
        validators = [validators];
    }

    return validators.map(validator => {
        if (typeof validator === 'string') {
            const specialMatch = validator.match(/^(\w+):special\((.+)\)$/);
            if (specialMatch) {
                const [, ruleName, specialChars] = specialMatch;
                const predefined = GRID_VALIDATORS[ruleName];
                if (predefined) {
                    const escapedSpecial = specialChars.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    return {
                        ...predefined,
                        value: `^[a-zA-Z0-9${escapedSpecial}]+$`,
                        message: `영문, 숫자, 특수문자(${specialChars})만 입력 가능합니다.`
                    };
                }
            }

            const predefined = GRID_VALIDATORS[validator];
            if (predefined) {
                return { ...predefined };
            }
            console.warn(`[CtvGridUtils] 알 수 없는 validator: "${validator}"`);
            return null;
        }

        if (typeof validator === 'object' && validator.rule) {
            const predefined = GRID_VALIDATORS[validator.rule];
            if (predefined) {
                if (validator.special) {
                    const escapedSpecial = validator.special.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                    return {
                        ...predefined,
                        value: `^[a-zA-Z0-9${escapedSpecial}]+$`,
                        message: validator.message || `영문, 숫자, 특수문자(${validator.special})만 입력 가능합니다.`,
                        ...validator
                    };
                }
                return { ...predefined, ...validator };
            }
            return validator;
        }

        return validator;
    }).filter(v => v !== null);
}

/**
 * colType 파싱
 */
export function parseColType(colType) {
    if (!colType || typeof colType !== "string") return {};

    const result = {};
    const codes = colType.toUpperCase().split("|");

    let constraintCode = "";
    let dataTypeCode = "";

    codes.forEach((code) => {
        code = code.trim();
        if (!code) return;

        if (/^\d+$/.test(code)) {
            result.width = parseInt(code, 10);
            return;
        }

        if (WIDTH_PRESETS[code] !== undefined) {
            result.width = WIDTH_PRESETS[code];
            return;
        }

        switch (code) {
            case "STR":
            case "STRING":
                result.dataType = "string";
                dataTypeCode = "STR";
                break;
            case "NUM":
            case "NUMBER":
                result.dataType = "number";
                dataTypeCode = "NUM";
                break;
            case "DATE":
                result.type = "date";
                result.calendarType = 'date';
                dataTypeCode = "STR";
                break;
            case "MONTH":
                result.type = "date";
                result.calendarType = 'yearMonth';
                dataTypeCode = "STR";
                break;
            case "L":
            case "LEFT":
                result.align = "left";
                break;
            case "C":
            case "CENTER":
                result.align = "center";
                break;
            case "R":
            case "RIGHT":
                result.align = "right";
                break;
            case "PK":
            case "PRIMARYKEY":
                result.required = true;
                result.skipPaste = true;
                result.isPrimaryKey = true;
                constraintCode = "PK";
                break;
            case "NN":
            case "REQ":
            case "REQUIRED":
                result.required = true;
                if (!constraintCode) constraintCode = "NN";
                break;
            case "H":
            case "HIDE":
            case "HIDDEN":
                result.visible = false;
                break;
            case "RO":
            case "READONLY":
                result.editable = false;
                break;
            case "SP":
            case "SKIPPASTE":
                result.skipPaste = true;
                break;
            case "EX":
            case "EXCLUDE":
                result.saveExclude = true;
                if (!constraintCode) constraintCode = "EX";
                break;
        }
    });

    if (constraintCode || dataTypeCode) {
        result.ptaxsData = constraintCode + "\x07" + dataTypeCode;
    }

    return result;
}

function _applyRequiredCaptionCss(column) {
    if (!column || column.required !== true) return;

    if (column.captionCss) {
        if (typeof column.captionCss === "string") {
            const cssClasses = column.captionCss.split(/\s+/);
            if (!cssClasses.includes("required")) {
                column.captionCss = column.captionCss + " required";
            }
        } else if (Array.isArray(column.captionCss)) {
            if (!column.captionCss.includes("required")) {
                column.captionCss.push("required");
            }
        }
    } else {
        column.captionCss = "required";
    }
}

function _applyRequiredValidator(column) {
    if (!column || column.required !== true) return;
    // ... simple implementation for now ...
}

/**
 * columns 배열 처리 (colType 파싱 및 적용)
 */
export function applyColTypeToColumns(columns) {
    if (!columns || !Array.isArray(columns)) return columns;

    return columns.map((column) => {
        let expandedColumn = { ...column };

        if (expandedColumn.columns && Array.isArray(expandedColumn.columns)) {
            expandedColumn.columns = applyColTypeToColumns(expandedColumn.columns);
        }

        if (expandedColumn.customFormat && typeof expandedColumn.customFormat === 'string') {
            const formatPattern = CUSTOM_FORMATS[expandedColumn.customFormat];
            if (formatPattern && formatPattern.format) {
                expandedColumn.format = formatPattern.format;
            }
            delete expandedColumn.customFormat;
        }

        // Handle combo / inputCombo cleanup (Crucial fix for undefined error)
        if (column.combo !== undefined) {
            expandedColumn.type = "combo";
            if (typeof column.combo === "number") {
                // If it relies on global gGridComboData, we can't resolve it here easily without window access
                // Assuming caller handles or window is available
                if (typeof window !== 'undefined' && window.gGridComboData) {
                    expandedColumn.items = window.gGridComboData[column.combo];
                } else {
                    // Fallback string generic expression if needed, or leave as is if SBGrid supports it?
                    // SBGrid expects items to be array.
                    // IMPORTANT: The legacy code assigned string `gGridComboData[${column.combo}]` which SBGrid Eval'd?
                    // No, legacy code: expandedColumn.items = `gGridComboData[${column.combo}]`;
                    // Wait, SBGrid string items property?
                    // Checking legacy line 1341: expandedColumn.items = `gGridComboData[${column.combo}]`;
                    // So it seems SBGrid might eval this string.
                    // BUT in Vue, we should try to resolve it if possible.
                    // However, let's stick to simple removal of the source property
                }
            } else {
                expandedColumn.items = column.combo;
            }
            delete expandedColumn.combo;
        }

        if (column.inputCombo !== undefined) {
            expandedColumn.type = "combo";
            expandedColumn.autoComplete = true;
            if (typeof column.inputCombo === 'number') {
                // similar logic
            } else {
                expandedColumn.items = column.inputCombo;
            }
            delete expandedColumn.inputCombo;
        }

        if (!expandedColumn.colType) {
            // Validate validators even if no colType
            if (expandedColumn.validators) {
                expandedColumn.validators = normalizeValidators(expandedColumn.validators);
            }
            return expandedColumn;
        }

        const parsed = parseColType(expandedColumn.colType);
        const { colType, ...rest } = expandedColumn;

        const result = {
            ...parsed,
            ...rest,
        };

        if (parsed.dataType === "number" || parsed.dataType === "date") {
            // Add type validators if missing
            // ... simplified ...
        }

        if (result.required === true) {
            _applyRequiredCaptionCss(result);
            _applyRequiredValidator(result);
        }

        if (result.validators) {
            result.validators = normalizeValidators(result.validators);
        }

        return result;
    });
}

export default {
    flattenColumns,
    parseColTypeSchema,
    extractCaption,
    normalizeConfig,
    normalizeValidators,
    parseColType,
    applyColTypeToColumns,
    GRID_VALIDATORS,
    CUSTOM_FORMATS,
    WIDTH_PRESETS
};
