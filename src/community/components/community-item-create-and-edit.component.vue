<script>
import CreateAndEditComponent from '@/shared/components/create-and-edit.component.vue'
import {uploadToCloudinary} from "@/shared/services/cloudinary.service.js";


export default {
  name: 'community-item-create-and-edit-dialog',
  components: { CreateAndEditComponent },
  props: {
    item: null,
    visible: false,
    edit: false
  },
  emits: ['cancel-requested', 'save-requested'],
  data() {
    return {
      submitted: false,
      uploading: false,
      uploadError: ''
    }
  },
  methods: {
    onCancelRequested() {
      this.$emit('cancel-requested')
    },
    async onFileSelected(e) {
      const file = e.target.files[0]
      if (!file) return
      this.uploading = true
      this.uploadError = ''

      try {
        const url = await uploadToCloudinary(file)
        this.item.image = url                        // ← guarda la URL en el modelo
      } catch (err) {
        console.error(err)
        this.uploadError = err.message
      } finally {
        this.uploading = false
      }
    },
    onSaveRequested() {
      this.submitted = true
      this.$emit('save-requested', this.item)
    }
  }
}
</script>

<template>
  <create-and-edit-component
      class="concert-form-dialog"
      :entity="item"
      :visible="visible"
      :edit="edit"
      entity-name="Comunidad"
      @cancel-action-requested="onCancelRequested"
      @save-action-requested="onSaveRequested"
  >
    <template #header>
      <h2 class="header-title">{{ $t('community.new_title') }}</h2>
    </template>

    <template #content>
      <div class="form-content">
        <!-- Nombre -->
        <div class="field">
          <label for="name">{{ $t('community.name_label') }}</label>
          <input id="name" v-model="item.name"
                 :class="{ invalid: submitted && !item.name }"
                 :placeholder="$t('community.name_placeholder')" />
        </div>

        <!-- Miembros -->
        <!--       <div class="field">
               <label for="memberQuantity">{{ $t('community.members_label') }}</label>
               <input id="memberQuantity" v-model.number="item.memberQuantity"
                      type="number" :placeholder="$t('community.members_placeholder')" />
             </div>-->

             <!-- Imagen -->
        <div class="field">
          <label for="image">{{ $t('community.image_label') }}</label>
          <!-- selector de archivo -->
          <input id="imageFile" type="file" accept="image/*"
                 @change="onFileSelected" />

          <!-- preview y estado -->
          <div v-if="item.image" class="mt-2">
            <img :src="item.image" alt="preview"
                 style="max-width: 180px; border-radius: 8px" />
          </div>
          <span v-if="uploading" class="text-sm" style="color:#cb6ce6">{{ $t('community.uploading') }}</span>
          <span v-if="uploadError" class="text-sm" style="color:#ff5c5c">{{ uploadError }}</span>
        </div>
      </div>
    </template>
  </create-and-edit-component>
</template>


<style scoped>



.p-dialog-mask {
  backdrop-filter: blur(8px);
  background: rgba(20, 20, 20, 0.75);
}

.header-title {
  color: #cb6ce6;
  text-align: center;
  width: 100%;
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  color: #cb6ce6;
  font-weight: 600;
  margin-bottom: 5px;
  font-size: 0.95rem;
}

input {
  border-radius: 12px;
  padding: 10px;
  background-color: #1a1a1a;
  border: 1px solid #cb6ce6;
  color: white;
  font-size: 0.95rem;
}

input::placeholder {
  color: #bbb;
}

input:focus {
  border-color: #e58cff;
  box-shadow: 0 0 8px #cb6ce6;
}

.invalid {
  border-color: #ff5c5c !important;
  box-shadow: 0 0 8px #ff5c5c !important;
}

input {
  border-radius: 12px;
  padding: 10px 12px;
  background-color: #1a1a1a;
  border: 1px solid #cb6ce6;
  color: white;
  font-size: 0.95rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
}

input::placeholder {
  color: #aaa;
}

input:focus {
  border-color: #e58cff;
  box-shadow: 0 0 8px #cb6ce6;
  outline: none;
}

.invalid {
  border-color: #ff5c5c !important;
  box-shadow: 0 0 8px #ff5c5c !important;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  color: #cb6ce6;
  font-weight: 600;
  margin-bottom: 0.4rem;
  font-size: 0.95rem;
}

</style>

