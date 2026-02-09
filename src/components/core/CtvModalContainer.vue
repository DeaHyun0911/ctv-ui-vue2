<template>
  <div class="ctv-modal-container">
    <ctv-modal
      v-for="modal in modals"
      :key="modal.id"
      :config="modal.config"
      :z-index="modal.zIndex"
      @close="(result) => close(modal.id, result)"
    ></ctv-modal>
  </div>
</template>

<script setup>
import CtvModal from './CtvModal.vue';

const props = defineProps({
  modals: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close']);

const close = (id, result) => {
  emit('close', id, result);
};
</script>
