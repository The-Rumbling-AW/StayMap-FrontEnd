<script>
const defaultStyle = { width: '400px' };

export default {
  name: "create-and-edit",
  props: {
    entity: Object,
    visible: Boolean,
    entityName: String,
    edit: Boolean,
    size: {
      type: String,
      default: 'default'
    }
  },
  emits: ['cancel-action-requested', 'save-action-requested'],
  methods: {
    onCancel() {
      this.$emit('cancel-action-requested');
    },
    onSave() {
      this.$emit('save-action-requested', this.entity);
    },
    getHeaderTitle() {
      return `${this.edit ? 'Editar' : 'Crear'} ${this.entityName}`;
    },
    getSubmitLabel() {
      return this.edit ? 'Modificar' : 'Crear';
    },
    getDialogStyle() {
      if (this.size === 'large') return { width: '900px' };
      if (this.size === 'standard') return { width: '600px' };
      return { width: '400px' };
    }
  }
}
</script>

<template>
  <div v-if="visible" class="overlay">
    <div class="custom-dialog" :style="getDialogStyle()">
      <div class="concert-header-title">
        <h2>{{ getHeaderTitle() }}</h2>
      </div>

      <div class="dialog-content">
        <slot name="content" />
      </div>

      <div class="dialog-footer">
        <button class="dialog-btn primary" @click="onSave">
          ✔ {{ getSubmitLabel() }}
        </button>
        <button class="dialog-btn cancel" @click="onCancel">
          ✖ Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.custom-dialog {
  background-color: #1a1a1a;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 0 25px rgba(203, 108, 230, 0.3);
  color: white;
  max-height: 90vh;
  overflow-y: auto;
}

.concert-header-title h2 {
  color: #cb6ce6;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.dialog-content {
  margin-bottom: 1.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dialog-btn {
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dialog-btn.primary {
  background-color: #cb6ce6;
  color: white;
}

.dialog-btn.primary:hover {
  background-color: #b347d3;
}

.dialog-btn.cancel {
  background-color: transparent;
  border: 1px solid #cb6ce6;
  color: #cb6ce6;
}

.dialog-btn.cancel:hover {
  background-color: #cb6ce6;
  color: white;
}
</style>
