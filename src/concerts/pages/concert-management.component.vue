<script>
import DataManager from "@/shared/components/data-manager.component.vue";
import { Concert } from "@/concerts/model/concert.entity.js";
import ConcertItemCreateAndEditComponent from "@/concerts/components/concert-item-create-and-edit.component.vue";
import { ConcertService } from "@/concerts/services/concert.services.js";

export default {
  name: "concert-management",
  components: { ConcertItemCreateAndEditComponent, DataManager },
  props: {
    searchQuery: String
  },
  data() {
    return {
      title: { singular: "Concert", plural: "Concerts" },
      concerts: [],
      concert: new Concert({}),
      selectedConcerts: [],
      concertService: null,
      createAndEditDialogIsVisible: false,
      isEdit: false,
      submitted: false,
      selectedGenres: [],
      genres: ["Pop", "Rock", "Kpop", "Indie", "Urbano", "Electrónica", "Salsa", "Cumbia", "Jazz"],
      currentUser: null
    };
  },
  computed: {
    filteredConcerts() {
      return this.concerts.filter(concert => {
        const matchesGenre = this.selectedGenres.length === 0 || this.selectedGenres.includes(concert.genre);
        const matchesSearch = this.searchQuery.trim() === '' ||
            concert.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        return matchesGenre && matchesSearch;
      });
    },
    isArtist() {
      return this.currentUser && this.currentUser.type === 'artist';
    }
  },

  methods: {
    formatConcertDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },

    notifySuccessfulAction(message) {
      this.$toast.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    },
    findIndexById(id) {
      return this.concerts.findIndex(concert => concert.id === id);
    },
    onNewItem() {
      this.concert = new Concert({});
      this.isEdit = false;
      this.submitted = false;
      this.createAndEditDialogIsVisible = true;
    },
    onEditItem(item) {
      this.concert = new Concert(item);
      this.isEdit = true;
      this.submitted = false;
      this.createAndEditDialogIsVisible = true;
    },
    onDeleteItem(item) {
      this.concert = { ...item };
      this.deleteConcert();
    },
    onDeleteSelectedItems(selectedItems) {
      this.selectedConcerts = selectedItems;
      this.deleteSelectedConcerts();
    },
    onCancelRequested() {
      this.createAndEditDialogIsVisible = false;
      this.submitted = false;
      this.isEdit = false;
    },
    onSaveRequested(item) {
      this.submitted = true;
      if (item.name && item.name.trim()) {
        if (item.id) {
          this.updateConcert(item);
        } else {
          this.createConcert(item);
        }
        this.createAndEditDialogIsVisible = false;
        this.isEdit = false;
      }
    },
    createConcert(item) {
      if (!this.concertService || typeof this.concertService.create !== 'function') {
        console.error("❌ concertService no está inicializado correctamente.");
        return;
      }

      const concertToSend = {
        name: item.name,
        genre: item.genre,
        platform: item.platform,
        image: item.image,
        description: item.description,
        date: item.date,
        nameVenue: item.venueName,
        address: item.venueAddress,
        latitude: item.venueLat || 0,
        longitude: item.venueLng || 0,
        capacity: item.venueCapacity || 0
      };

      this.concertService.create(concertToSend).then(response => {
        const concert = new Concert(response.data);
        concert.isCreatedByCurrentUser = true;
        this.concerts.push(concert);

        // ✅ GUARDA EL ID EN LOCALSTORAGE
        const ids = JSON.parse(localStorage.getItem('createdConcertIds') || '[]');
        ids.push(concert.id);
        localStorage.setItem('createdConcertIds', JSON.stringify(ids));

        this.notifySuccessfulAction("Concierto creado correctamente");
      }).catch(error => {
        console.error('❌ Error al crear el concierto', error.response?.data || error.message);
      });
    }
    ,
    updateConcert(item) {
      const updatedConcert = {
        id: item.id,
        artist: [{ name: item.name, genre: item.genre }],
        image: item.image,
        description: item.description,
        date: item.date,
        venue: {
          name: item.venueName,
          address: item.venueAddress,
          location: {
            lat: 0,
            lng: 0
          }
        },
        status: item.status || 'Disponible'
      };

      this.concertService.update(item.id, updatedConcert).then(response => {
        const index = this.findIndexById(item.id);
        this.concerts[index] = new Concert(response.data);
        this.notifySuccessfulAction("Concierto actualizado");
      }).catch(error => console.error('Error al actualizar', error));
    },
    deleteConcert() {
      this.concertService.delete(this.concert.id).then(() => {
        let index = this.findIndexById(this.concert.id);
        this.concerts.splice(index, 1);
        this.notifySuccessfulAction("concert Deleted");
      }).catch(error => console.error(error));
    },
    deleteSelectedConcerts() {
      this.selectedConcerts.forEach((concert) => {
        this.concertService.delete(concert.id).then(() => {
          this.concert = this.concerts.filter((t) => t.id !== this.concert.id);
        });
      });
      this.notifySuccessfulAction("concert Deleted");
    }
  },

  created() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
    }

    this.concertService = new ConcertService();

    const createdIds = JSON.parse(localStorage.getItem('createdConcertIds') || '[]');

    this.concertService.getAll().then(response => {
      this.concerts = response.data.map(c => {
        const concert = new Concert(c);
        concert.isCreatedByCurrentUser = createdIds.includes(concert.id);
        return concert;
      });
    }).catch(error => {
      console.error('❌ Error al cargar conciertos:', error.response?.data || error.message);
    });
  }
}
</script>

<template>
  <div class="w-full">
    <div class="flex justify-content-between align-items-center mb-4" style="margin-left: 1.5rem;">
      <h2 class="text-2xl">{{ $t('concert.list_title') }}</h2>
      <pv-button
          v-if="isArtist"
          :label="$t('concert.new_button')"
          icon="pi pi-plus"
          severity="success"
          @click="onNewItem"
          style="background-color: #CB6CE6; border-radius: 25px; border: none; color: white; font-weight: bold;"
      />
    </div>

    <div class="concerts-filter-container">
      <!-- Filtro lateral -->
      <div class="filter-container">
        <div class="filter-header">
          <span>{{ $t('concert.filter_label') }}</span>
        </div>
        <div class="filter-options">
          <label v-for="genre in genres" :key="genre" class="checkbox-label">
            <input type="checkbox" :value="genre" v-model="selectedGenres" />
            {{ genre }}
          </label>
        </div>
      </div>

      <!-- Tarjetas de conciertos -->
      <div class="concerts-grid">
        <div v-for="concert in filteredConcerts" :key="concert.id" class="concert-card">
          <router-link :to="`/concerts/${concert.id}`" class="concert-link">
            <img :src="concert.image" :alt="concert.name" />
            <div class="concert-info">
              <h3>{{ concert.name }}</h3>
              <p>{{ formatConcertDate(concert.date) }}, {{ concert.venueName }}</p>
            </div>
          </router-link>

          <pv-button
              v-if="isArtist && concert.isCreatedByCurrentUser"
              icon="pi pi-trash"
              severity="danger"
              class="concert-delete-button"
              @click.stop.prevent="onDeleteItem(concert)"
          />
        </div>
      </div>
    </div>

    <concert-item-create-and-edit-component
        :edit="isEdit"
        :item="concert"
        :visible="createAndEditDialogIsVisible"
        @cancel-requested="onCancelRequested"
        @save-requested="onSaveRequested($event)"
    />
  </div>
</template>

<style scoped>
.concerts-filter-container {
  display: flex;
  gap: 2rem;
  padding: 1rem;
}

.concerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  flex: 1;
}

/* --- Card --- */
.concert-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background-color: #222;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease-in-out;
}

.concert-card:hover {
  transform: scale(1.03);
}

.concert-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

/* Imagen ocupa completamente parte superior */
.concert-card img {
  width: 100%;
  height: 190px;
  object-fit: cover;
  display: block;
  margin: 0;
}

/* Info */
.concert-info {
  padding: 1rem;
  color: white;
  background-color: #2a2a2a;
}

/* Botón de eliminar encima */
.concert-delete-button {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: #e53935 !important;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 90;
}

/* --- Filtros --- */
.filter-container {
  background-color: #111;
  border: 1px solid #cb6ce6;
  border-radius: 20px;
  padding: 1.5rem;
  width: 230px;
  max-height: 75vh;
  overflow-y: auto;
  box-shadow: 0 0 18px rgba(203, 108, 230, 0.15);
}

.filter-header {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #cb6ce6;
  margin-bottom: 1.2rem;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  color: white;
  gap: 0.5rem;
}

.checkbox-label input[type="checkbox"] {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #cb6ce6;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  position: relative;
}

.checkbox-label input[type="checkbox"]:checked {
  background-color: #cb6ce6;
}

.filter-container::-webkit-scrollbar {
  width: 6px;
}
.filter-container::-webkit-scrollbar-thumb {
  background-color: #cb6ce6;
  border-radius: 10px;
}
.filter-container::-webkit-scrollbar-track {
  background-color: transparent;
}
</style>

