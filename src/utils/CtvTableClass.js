import { createApp, h, reactive } from 'vue';
import CtvTableComponent from '@/components/core/CtvTable.vue';
import CtvSelect from '@/components/base/CtvSelect.vue';
import CtvCheck from '@/components/base/CtvCheck.vue';
import CtvDate from '@/components/base/CtvDate.vue';

class CtvTable {
    constructor(config) {
        this.config = config;
        this.container = null;
        this.app = null;
        this.instance = null;

        // Reactive state for Vue
        this.state = reactive({
            data: config.data || [],
            columns: config.columns || [],
            options: config.options || {}
        });
    }

    render() {
        // Legacy code calls .render() to get HTML string
        // We will return a placeholder div ID and mount Vue on it later
        // But HStep01 uses `html: content` in CtvModal.show
        // We need a unique ID
        this.id = 'ctv-table-' + Math.random().toString(36).substr(2, 9);
        return `<div id="${this.id}"></div>`;
    }

    bindEvents(modal) {
        // Modal is the DOM element where content was injected
        const container = modal.querySelector(`#${this.id}`);
        if (!container) return;

        this.container = container;

        // Mount Vue App
        this.app = createApp({
            render: () => h(CtvTableComponent, {
                data: this.state.data,
                columns: this.state.columns,
                options: this.state.options,
                ref: (el) => { this.instance = el; } // Capture ref
            })
        });

        // Register components used inside
        this.app.component('ctv-select', CtvSelect);
        this.app.component('ctv-check', CtvCheck);
        this.app.component('ctv-date', CtvDate);

        this.app.mount(container);
    }

    getData() {
        if (this.instance) {
            return this.instance.getData();
        }
        return {};
    }

    setData(data) {
        if (this.instance) {
            this.instance.setData(data);
        }
    }
}

export default CtvTable;
