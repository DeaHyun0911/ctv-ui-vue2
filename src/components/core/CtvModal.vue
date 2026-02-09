<template>
  <div class="ctv-modal-overlay" @click="handleOverlayClick" :style="{ zIndex: zIndex }">
    <div class="ctv-modal-box" :style="{ width: config.width || 'auto', zIndex: zIndex + 1 }">
      <div class="ctv-modal-header">
        <h3 class="ctv-modal-title">{{ config.title }}</h3>
        <button type="button" class="ctv-modal-close" @click="close(null)">×</button>
      </div>
      
      <div class="ctv-modal-body">
        <!-- Message -->
        <p v-if="config.message" class="ctv-modal-message" v-html="formattedMessage"></p>
        
        <!-- Custom HTML -->
        <div v-if="config.html" class="ctv-modal-html" v-html="config.html"></div>
        
        <!-- Fields -->
        <div v-if="config.fields && config.fields.length > 0" class="ctv-modal-fields">
          <div v-for="(field, index) in config.fields" :key="index" class="ctv-modal-field">
            <label v-if="field.label" class="ctv-modal-label">
              {{ field.label }}
              <span v-if="field.required" style="color: red;">*</span>
            </label>
            
            <textarea
              v-if="field.type === 'textarea'"
              v-model="fieldValues[field.name || index]"
              class="ctv-modal-textarea"
              :rows="field.rows || 3"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :readonly="field.readonly"
            ></textarea>

            <select
              v-else-if="field.type === 'select'"
              v-model="fieldValues[field.name || index]"
              class="ctv-modal-select"
              :disabled="field.disabled"
            >
              <option v-for="opt in field.options" :key="opt.value || opt" :value="opt.value || opt">
                {{ opt.text || opt }}
              </option>
            </select>
            
            <input
              v-else
              :type="field.type || 'text'"
              v-model="fieldValues[field.name || index]"
              class="ctv-modal-input"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :readonly="field.readonly"
              @keydown.enter="handleEnter(index)"
            />
            
            <small v-if="field.help" class="ctv-modal-help" :style="getHelpStyle(field.help)">{{ field.help }}</small>
          </div>
        </div>
      </div>
      
      <div class="ctv-modal-footer">
        <button 
          v-for="(btn, index) in config.buttons" 
          :key="index"
          type="button"
          :class="['ctv-modal-btn', { 'ctv-modal-btn-primary': btn.primary }]"
          @click="handleButtonClick(btn)"
        >
          {{ btn.text }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, reactive } from 'vue';

const props = defineProps({
  config: {
    type: Object,
    required: true,
    default: () => ({})
  },
  zIndex: {
    type: Number,
    default: 10000
  }
});

const emit = defineEmits(['close']);

// Local state for field values
const fieldValues = reactive({});

// Initialize field values
if (props.config.fields) {
  props.config.fields.forEach((field, index) => {
    const key = field.name || index;
    fieldValues[key] = field.value || null; // Changed empty string to null for better handling, or keep ''
    if (field.value === undefined && (field.type === 'text' || !field.type)) {
       fieldValues[key] = ''; 
    }
  });
}

const formattedMessage = computed(() => {
  const msg = props.config.message || '';
  // Simple check for HTML tags, if found assume HTML, else text
  // The original implementation checks /<[^>]+>/
  if (/<[^>]+>/.test(msg)) {
      return msg;
  }
  return msg.replace(/\n/g, '<br>');
});

const getHelpStyle = (helpText) => {
  if (helpText && helpText.includes('⚠')) {
    return { color: '#dc2626', fontWeight: '500' };
  }
  return {};
};

const handleOverlayClick = () => {
  if (props.config.closeOnOverlay !== false) {
    emit('close', null);
  }
};

const close = (result) => {
  emit('close', result);
};

const handleButtonClick = (btn) => {
  // If btn.value is null (Cancel/Close), just close
  if (btn.value === null) {
    close(null);
    return;
  }

  // Validate fields if any
  if (props.config.fields && props.config.fields.length > 0) {
    for (const field of props.config.fields) {
      const key = field.name; // Use name as key
      const val = fieldValues[key];
      if (field.required && !val) {
        alert(`${field.label || '값'}을(를) 입력하세요.`); // Fallback alert or use internal error state
        return;
      }
    }
    // Return field values combined with button value boolean?
    // Original implementation: prompt returns result.input or result.password
    // We should return object if fields exist
    
    // Construct result object
    // If fields exist, return { ...fieldValues, button: btn.value } or just fieldValues?
    // prompt expects just the value. 
    // Let's return the whole object and let service handle it, or mimic legacy 'result' object
    // Legacy prompt: .then((result) => (result ? result.input : null));
    // So result is { input: "value" }
    
    close({ ...fieldValues, _button: btn.value });
  } else {
    // No fields, just return button value
    close(btn.value);
  }
};

const handleEnter = (index) => {
    // Logic to move focus or submit
    // Simplified for now
};

onMounted(() => {
    // Auto focus first input
    const inputs = document.querySelector('.ctv-modal-input'); // This might select from other modals? Scoped selection needed
    // In Vue, standard refs are better, but difficult with v-for
});

</script>

<style scoped>
/* Scoped styles based on legacy ctv-modal.css (simplified) */
.ctv-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ctv-modal-box {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 320px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  /* animation: slideIn 0.2s ease-out; */
}

.ctv-modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ctv-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.ctv-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  line-height: 1;
}

.ctv-modal-body {
  padding: 24px 20px;
  overflow-y: auto;
  max-height: 70vh;
}

.ctv-modal-message {
  margin: 0;
  font-size: 15px;
  color: #444;
  white-space: pre-wrap;
}

.ctv-modal-footer {
  padding: 16px 20px;
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ctv-modal-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.ctv-modal-btn:hover {
  background: #f5f5f5;
}

.ctv-modal-btn-primary {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.ctv-modal-btn-primary:hover {
  background: #2563eb;
}

.ctv-modal-field {
    margin-bottom: 12px;
}
.ctv-modal-label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
}
.ctv-modal-input, .ctv-modal-select, .ctv-modal-textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
}
</style>
