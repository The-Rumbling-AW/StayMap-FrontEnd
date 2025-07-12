<template>
  <create-and-edit-component
      class="concert-form-dialog"
      :entity="item"
      :visible="visible"
      
      :edit="edit"
      :entity-name="$t('concert.entity_name')"
      size="standard"
      @cancel-action-requested="onCancelRequested"
      @save-action-requested="onSaveRequested"
  >
    <template #header>
      <h2 class="concert-form-header">{{ $t('concert.new_title') }}</h2>
    </template>

    <template #content>
      <div class="concert-form-container">

        <!-- Nombre -->
        <div class="concert-form-field">
          <label for="name">{{ $t('concert.name_label') }}</label>
          <input
              id="name"
              v-model="item.name"
              :class="{ 'invalid': submitted && !item.name }"
              type="text"
              placeholder=" "
          />
        </div>

        <!-- Género -->
        <div class="concert-form-field">
          <label for="genre">{{ $t('concert.genre_label') }}</label>
          <select
              id="genre"
              v-model="item.genre"
              :class="{ 'invalid': submitted && !item.genre }"
          >
            <option disabled value="">{{ $t('concert.genre_placeholder') }}</option>
            <option>{{ $t('concert.genres.pop') }}</option>
            <option>{{ $t('concert.genres.rock') }}</option>
            <option>{{ $t('concert.genres.kpop') }}</option>
            <option>{{ $t('concert.genres.indie') }}</option>
            <option>{{ $t('concert.genres.urbano') }}</option>
            <option>{{ $t('concert.genres.electronica') }}</option>
            <option>{{ $t('concert.genres.salsa') }}</option>
            <option>{{ $t('concert.genres.cumbia') }}</option>
            <option>{{ $t('concert.genres.jazz') }}</option>
          </select>
        </div>

        <!-- Imagen -->
        <div class="concert-form-field">
          <label for="imageFile">{{ $t('concert.image_label') }}</label>
          <input id="imageFile" type="file" accept="image/*" @change="onFileSelected" />

          <div v-if="item.image" class="concert-form-preview">
            <img :src="item.image" alt="preview" />
          </div>
          <span v-if="uploadInProgress" class="concert-form-hint uploading">{{ $t('concert.uploading') }}</span>
          <span v-if="uploadError" class="concert-form-hint error">{{ uploadError }}</span>
        </div>

        <!-- Descripción -->
        <div class="concert-form-field">
          <label for="description">{{ $t('concert.description_label') }}</label>
          <input id="description" v-model="item.description" type="text" />
        </div>

        <!-- Plataforma -->
        <div class="concert-form-field">
          <label for="platform">{{ $t('concert.platform_label') }}</label>
          <select
              id="platform"
              v-model="item.platform"
              :class="{ 'invalid': submitted && !item.platform }"
          >
            <option disabled value="">{{ $t('concert.platform_placeholder') }}</option>
            <option value="Ticketmaster">Ticketmaster</option>
            <option value="Teleticket">Teleticket</option>
            <option value="Joinnus">Joinnus</option>
          </select>
        </div>


        <!-- Fecha -->
        <div class="concert-form-field">
          <label for="date">{{ $t('concert.date_label') }}</label>
          <input
              id="date"
              type="date"
              v-model="item.date"
              :class="{ 'invalid': submitted && !item.date }"
          />
        </div>

        <!-- Lugar -->
        <div class="concert-form-field">
          <label for="venueName">{{ $t('concert.venue_name_label') }}</label>
          <input
              id="venueName"
              v-model="item.venueName"
              :class="{ 'invalid': submitted && !item.venueName }"
              type="text"
          />
        </div>

        <div class="concert-form-field">
          <label for="venueAddress">{{ $t('concert.venue_address_label') }}</label>
          <input
              id="venueAddress"
              v-model="item.venueAddress"
              :class="{ 'invalid': submitted && !item.venueAddress }"
              type="text"
          />
        </div>

        <div class="concert-form-field" v-show="false">
          <label for="venueLat">{{ $t('concert.venue_lat_label') }}</label>
          <input id="venueLat" v-model.number="item.venueLat" type="number" />
        </div>

        <div class="concert-form-field" v-show="false">
          <label for="venueLng">{{ $t('concert.venue_lng_label') }}</label>
          <input id="venueLng" v-model.number="item.venueLng" type="number" />
        </div>

        <!-- Capacidad -->
        <div class="concert-form-field">
          <label for="venueLng">{{ $t('concert.capacity_label') }}</label>
          <input
              id="venueCapacity"
              type="number"
              v-model="item.venueCapacity"
              :class="{ 'invalid': submitted && item.venueCapacity === null }"
              :placeholder="$t('concert.capacity_placeholder')"
          />
        </div>
      </div>
    </template>
  </create-and-edit-component>
</template>

<script>
import CreateAndEditComponent from '@/shared/components/create-and-edit.component.vue'
import { uploadToCloudinary } from "@/shared/services/cloudinary.service.js";
import { Loader } from "@googlemaps/js-api-loader";

const loader = new Loader({
  apiKey: 'AIzaSyAd-IuCKmGRzA4BsS2Yz_hR5FD6-XHUqjA',
  version: 'weekly',
  libraries: ['places']
});

async function geocodeAddress(address) {
  await loader.load();
  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng()
        });
      } else {
        reject(new Error(`Geocoding falló: ${status}`));
      }
    });
  });
}

export default {
  name: 'concert-item-create-and-edit-dialog',
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
      uploadInProgress: false,
      uploadError: ''
    }
  },
  methods: {
    onCancelRequested() {
      this.$emit('cancel-requested')
    },
    async onFileSelected(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.uploadInProgress = true;
      this.uploadError = '';

      try {
        const url = await uploadToCloudinary(file);
        this.item.image = url;
      } catch (err) {
        console.error(err);
        this.uploadError = err.message;
      } finally {
        this.uploadInProgress = false;
      }
    },
    async onSaveRequested() {
      this.submitted = true;

      if (!this.item.venueLat || !this.item.venueLng) {
        try {
          const fullAddress = this.item.venueAddress || '';
          const coords = await geocodeAddress(fullAddress);
          this.item.venueLat = coords.lat;
          this.item.venueLng = coords.lng;
        } catch (err) {
          console.error('❌ Error geocodificando:', err.message);
          this.$toast?.error?.('Dirección inválida. Verifica e intenta de nuevo.');
          return;
        }
      }

      this.$emit('save-requested', this.item);
    }
  }
}
</script>

<style>
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
