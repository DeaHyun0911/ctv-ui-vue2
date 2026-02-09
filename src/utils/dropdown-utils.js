/**
 * 기존 ctv-Component.js의 CtvDropdownUtils를 Vue 유틸리티로 변환
 * Select, Date 등의 드롭다운 컴포넌트에서 사용
 */

/**
 * 드롭다운 아이템에 포커스 및 스크롤
 */
export function focusAndScrollToItem(
    container,
    itemSelector,
    dropdownSelector,
    currentValue,
    hoverClass = 'hover'
) {
    const items = container.querySelectorAll(itemSelector);
    const dropdown = container.querySelector(dropdownSelector);

    // 모든 아이템에서 hover 클래스 제거
    items.forEach((item) => item.classList.remove(hoverClass));

    // 현재 선택된 값이 있으면 해당 아이템 찾기
    let targetItem = null;
    if (currentValue !== null && currentValue !== undefined && currentValue !== '') {
        targetItem = container.querySelector(`${itemSelector}[data-value="${currentValue}"]`);
    }

    // 선택된 값이 없으면 첫 번째 아이템
    if (!targetItem) {
        targetItem = container.querySelector(`${itemSelector}:not(.disabled)`);
    }

    if (targetItem) {
        targetItem.classList.add(hoverClass);

        // 스크롤 위치 조정
        if (dropdown) {
            setTimeout(() => {
                const scrollTop =
                    targetItem.offsetTop -
                    dropdown.clientHeight / 2 +
                    targetItem.clientHeight / 2;
                dropdown.scrollTop = Math.max(0, scrollTop);
            }, 0);
        }
    }
}

/**
 * 키보드 네비게이션 처리
 * @returns {HTMLElement|null} - Enter/Space 시 선택된 아이템
 */
export function handleKeyboardNavigation(container, itemSelector, e, hoverClass = 'hover') {
    const items = Array.from(container.querySelectorAll(`${itemSelector}:not(.disabled)`));
    if (items.length === 0) return null;

    const currentHover = container.querySelector(`${itemSelector}.${hoverClass}`);
    let currentIndex = currentHover ? items.indexOf(currentHover) : -1;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % items.length;
        items.forEach((i) => i.classList.remove(hoverClass));
        items[currentIndex].classList.add(hoverClass);
        items[currentIndex].scrollIntoView({ block: 'nearest' });
        return null;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items.forEach((i) => i.classList.remove(hoverClass));
        items[currentIndex].classList.add(hoverClass);
        items[currentIndex].scrollIntoView({ block: 'nearest' });
        return null;
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        return currentHover;
    }

    return null;
}

/**
 * 외부 클릭 리스너 추가
 * @returns {Function} - 리스너 제거용 핸들러
 */
export function addClickOutsideListener(container, closeCallback) {
    const handler = (e) => {
        if (!container.contains(e.target)) {
            closeCallback();
        }
    };
    setTimeout(() => {
        document.addEventListener('click', handler);
    }, 0);
    return handler;
}

/**
 * 외부 클릭 리스너 제거
 */
export function removeClickOutsideListener(handler) {
    if (handler) {
        document.removeEventListener('click', handler);
    }
}

/**
 * 외부 클릭 감지 유틸리티 (간소화된 버전)
 * @param {HTMLElement} element - 클릭 감지할 요소
 * @param {Function} callback - 외부 클릭 시 실행할 콜백
 * @returns {Function} cleanup 함수
 */
export function setupClickOutside(element, callback) {
    const handleClickOutside = (e) => {
        if (element && !element.contains(e.target)) {
            callback();
            cleanup();
        }
    };

    const cleanup = () => {
        document.removeEventListener('click', handleClickOutside, true);
    };

    // 약간의 지연 후 리스너 추가 (현재 클릭 이벤트가 전파되는 것을 방지)
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
    }, 0);

    return cleanup;
}
