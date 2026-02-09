import { reactive, createApp } from 'vue';
import CtvModalContainer from '@/components/core/CtvModalContainer.vue';

const state = reactive({
    modals: [], // { id, config, zIndex, resolve, reject }
});

let _baseZIndex = 11000;
let _idCounter = 0;

const CtvModalService = {
    show(options) {
        return new Promise((resolve, reject) => {
            const id = ++_idCounter;
            const normalizedConfig = this._normalizeConfig(options);

            const modalItem = {
                id,
                config: normalizedConfig,
                zIndex: _baseZIndex + (state.modals.length * 10),
                resolve,
                reject
            };

            state.modals.push(modalItem);
        });
    },

    alert(message, title = "알림") {
        return this.show({
            title: title,
            message: message,
            buttons: ["확인"],
        });
    },

    confirm(message, title = "확인") {
        return this.show({
            title: title,
            message: message,
            buttons: ["취소", "확인"],
        });
    },

    prompt(message, title = "입력", defaultValue = "") {
        return this.show({
            title: title,
            message: message,
            fields: [
                {
                    type: "text",
                    name: "input",
                    value: defaultValue,
                    placeholder: "입력하세요",
                },
            ],
            buttons: ["취소", "확인"],
        }).then((result) => (result ? result.input : null));
    },

    close(id, result) {
        const index = state.modals.findIndex(m => m.id === id);
        if (index !== -1) {
            const modal = state.modals[index];
            modal.resolve(result);
            state.modals.splice(index, 1);
        }
    },

    _normalizeConfig(options) {
        if (typeof options === "string") {
            options = { message: options };
        }

        return {
            title: options.title || "알림",
            message: options.message || "",
            html: options.html || "",
            fields: options.fields || [],
            buttons: this._normalizeButtons(options.buttons || ["확인"]),
            closeOnOverlay: options.closeOnOverlay !== false,
            width: options.width || "auto",
        };
    },

    _normalizeButtons(buttons) {
        return buttons.map((btn, index) => {
            if (typeof btn === "string") {
                const isPrimary = index === buttons.length - 1;
                const value = btn === "취소" || btn === "닫기" ? null : true;
                return { text: btn, primary: isPrimary, value: value };
            }
            return btn;
        });
    }
};

// Mount function to be called in main.js
export function mountModalContainer() {
    // Create a dedicated root for modals
    const el = document.createElement('div');
    el.id = 'ctv-modal-root';
    document.body.appendChild(el);

    const app = createApp(CtvModalContainer, {
        modals: state.modals,
        onClose: (id, result) => {
            CtvModalService.close(id, result);
        }
    });

    // Register any plugins if needed inside modal (e.g. i18n)
    app.mount(el);
}

export default CtvModalService;
