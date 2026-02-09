/**
 * 기존 ctv-Component.js의 ComponentUtils를 Vue 유틸리티로 변환
 */

/**
 * HTML 이스케이프
 */
export function escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * camelCase를 kebab-case로 변환
 */
export function camelToKebab(str) {
    // on으로 시작하는 이벤트 핸들러는 특별 처리
    if (str.startsWith('on') && str.length > 2) {
        return str.charAt(0).toLowerCase() + str.slice(1).replace(/([a-z0-9])([A-Z])/g, '$1$2').toLowerCase();
    }
    // 일반 속성: maxSize -> max-size
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 라벨 클래스 생성
 */
export function buildLabelClass(labelAlign = '', required = false) {
    let labelClass = 'ctv-input-label';
    if (labelAlign === 'left') {
        labelClass += ' left-align';
    } else if (labelAlign === 'center') {
        labelClass += ' center-align';
    }
    if (required) {
        labelClass += ' required';
    }
    return labelClass;
}

/**
 * 한글 초성 (19자)
 */
export const CHOSUNG = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';

/**
 * 한글 중성 (21자) - 유니코드 순서
 */
export const JUNGSUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';

/**
 * 문자열이 초성만으로 이루어졌는지 (공백 제외)
 */
export function isChosungOnly(str) {
    if (!str || typeof str !== 'string') return false;
    const s = str.trim();
    if (s.length === 0) return false;
    for (let i = 0; i < s.length; i++) {
        if (CHOSUNG.indexOf(s[i]) === -1) return false;
    }
    return true;
}

/**
 * 문자열에서 한글 초성만 추출
 */
export function getChosung(str) {
    if (!str || typeof str !== 'string') return '';

    let result = '';
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xac00 && code <= 0xd7a3) {
            const idx = Math.floor((code - 0xac00) / 588);
            result += CHOSUNG[idx];
        } else if (CHOSUNG.indexOf(str[i]) !== -1) {
            result += str[i];
        }
    }
    return result;
}

/**
 * 첫 한글 음절의 초성+중성
 */
export function getFirstSyllableChosungJung(str) {
    if (!str || typeof str !== 'string') return '';

    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if (code >= 0xac00 && code <= 0xd7a3) {
            const offset = code - 0xac00;
            const choIdx = Math.floor(offset / 588);
            const jungIdx = Math.floor((offset % 588) / 28);
            return CHOSUNG[choIdx] + JUNGSUNG[jungIdx];
        }
        if (CHOSUNG.indexOf(str[i]) !== -1) return str[i];
    }
    return '';
}

/**
 * combo 연관검색: label, value 전체 + 한글 규칙
 */
export function matchComboKeyword(keyword, item) {
    if (!item) return false;
    if (!keyword || keyword.trim() === '') return true;

    const k = keyword.trim();
    const texts = [item.label, item.value];
    if (Array.isArray(item.values)) {
        texts.push(...item.values);
    }

    const kLower = k.toLowerCase();
    for (const text of texts) {
        if (!text) continue;
        if (String(text).toLowerCase().includes(kLower)) return true;
    }

    // 초성 검색
    if (isChosungOnly(k)) {
        const chosungKeyword = getChosung(k);
        if (chosungKeyword.length > 0) {
            for (const text of texts) {
                if (!text) continue;
                const chosungText = getChosung(String(text));
                if (chosungText && chosungText.startsWith(chosungKeyword)) return true;
            }
        }
        return false;
    }

    // 첫 음절 초성+중성 검색
    const cjKeyword = getFirstSyllableChosungJung(k);
    if (cjKeyword.length >= 1) {
        for (const text of texts) {
            if (!text) continue;
            const cjText = getFirstSyllableChosungJung(String(text));
            if (cjText && cjText.startsWith(cjKeyword)) return true;
        }
    }

    return false;
}

/**
 * 간소화된 한글 검색 함수 (문자열 직접 검색)
 * @param {string} text - 검색 대상 텍스트
 * @param {string} keyword - 검색 키워드
 * @returns {boolean} 매칭 여부
 */
export function matchesKeyword(text, keyword) {
    if (!text) return false;
    if (!keyword || keyword.trim() === '') return true;

    const k = keyword.trim().toLowerCase();
    const t = String(text).toLowerCase();

    // 일반 텍스트 검색
    if (t.includes(k)) return true;

    // 초성 검색
    if (isChosungOnly(k)) {
        const chosungKeyword = getChosung(k);
        const chosungText = getChosung(text);
        if (chosungText && chosungText.startsWith(chosungKeyword)) return true;
    }

    // 첫 음절 초성+중성 검색
    const cjKeyword = getFirstSyllableChosungJung(k);
    const cjText = getFirstSyllableChosungJung(text);
    if (cjText && cjKeyword && cjText.startsWith(cjKeyword)) return true;

    return false;
}

