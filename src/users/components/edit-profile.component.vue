<template>
  <create-and-edit-component
      class="dialog-container"
      :entity="localUser"
      :visible="visible"
      :edit="true"
      entity-name="Perfil"
      size="standard"
      @cancel-action-requested="onCancelRequested"
      @save-action-requested="onSaveRequested"
  >
    <template #header>
      <h2 class="concert-form-header">Editar perfil</h2>
    </template>

    <template #content>
      <div class="concert-form-container">
        <!-- Nombre -->
        <div class="concert-form-field">
          <label for="name">Nombre completo</label>
          <input
              id="name"
              type="text"
              v-model="localUser.name"
              :class="{ invalid: submitted && !localUser.name }"
              placeholder="Escribe tu nombre"
          />
        </div>

        <!-- Email -->
        <div class="concert-form-field">
          <label for="email">Correo electrónico</label>
          <input
              id="email"
              type="email"
              v-model="localUser.email"
              :class="{ invalid: submitted && !localUser.email }"
              placeholder="tucorreo@email.com"
          />
        </div>

        <!-- Imagen de perfil -->
        <div class="concert-form-field">
          <label for="profileImageFile">Imagen de perfil</label>
          <input id="profileImageFile" type="file" accept="image/*" @change="onFileSelected" />

          <div class="concert-form-hint uploading" v-if="uploading">Subiendo imagen…</div>
          <div class="concert-form-hint error" v-if="uploadError">{{ uploadError }}</div>

          <div v-if="localUser.profileImage" class="concert-form-preview">
            <img :src="localUser.profileImage" alt="preview" />
          </div>
        </div>
      </div>
    </template>
  </create-and-edit-component>
</template>

<script>
import CreateAndEditComponent from "@/shared/components/create-and-edit.component.vue";
import { uploadToCloudinary } from "@/shared/services/cloudinary.service.js";

export default {
  name: "edit-profile",
  components: { CreateAndEditComponent },
  props: {
    user: Object,
    visible: Boolean
  },
  emits: ['cancel-requested', 'save-requested'],
  data() {
    return {
      localUser: { ...this.user },
      submitted: false,
      uploading: false,
      uploadError: ''
    };
  },
  watch: {
    user(newUser) {
      this.localUser = { ...newUser };
    }
  },
  methods: {
    onCancelRequested() {
      this.$emit('cancel-requested');
    },
    async onFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.uploading = true;
      this.uploadError = '';
      try {
        const url = await uploadToCloudinary(file);
        this.localUser.profileImage = url;
      } catch (err) {
        console.error(err);
        this.uploadError = err.message;
      } finally {
        this.uploading = false;
      }
    },
    onSaveRequested() {
      this.submitted = true;
      if (this.localUser.name && this.localUser.email) {
        this.$emit('save-requested', this.localUser);
      }
    }
  }
};
</script>

<style scoped>
input,
select {
  border-radius: 12px;
  padding: 10px 12px;
  background-color: #1a1a1a;
  border: 1px solid #cb6ce6;
  color: white;
  font-size: 0.95rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

input::placeholder,
select::placeholder {
  color: #aaa;
}

input:focus,
select:focus {
  border-color: #e58cff;
  box-shadow: 0 0 8px #cb6ce6;
  outline: none;
}

.invalid {
  border-color: #ff5c5c !important;
  box-shadow: 0 0 8px #ff5c5c !important;
}

.concert-form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.concert-form-field {
  display: flex;
  flex-direction: column;
}

label {
  color: #cb6ce6;
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
}

.concert-form-preview img {
  max-width: 200px;
  border-radius: 10px;
  border: 1px solid #cb6ce6;
  margin-top: 0.5rem;
}

.concert-form-hint {
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.concert-form-hint.uploading {
  color: #cb6ce6;
}

.concert-form-hint.error {
  color: #ff5c5c;
}

.concert-form-header {
  color: #cb6ce6;
  text-align: center;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}
</style>
