<script>
import { ConcertService } from '@/concerts/services/concert.services.js';
import { Concert } from '@/concerts/model/concert.entity.js';
import { UserService } from '@/users/services/user.service.js';
import ConcertsByPlatformDialog from '@/concerts/pages/concert-by-platform-dialog.vue'

export default {
  name: 'ConcertPageDetails',
  components: {
    ConcertsByPlatformDialog
  },
  data() {
    return {
      concert: new Concert({}),
      user: null,
      isAttending: false,
      userService: new UserService(),
      concertService: new ConcertService(),
      attendeeNames: [],
      showDialog: false,
      selectedPlatform: '',
      concertsByPlatform: [],
      loadingConcertsByPlatform: false,
    };
  },
  created() {
    // 1️⃣ Recuperar el usuario logueado
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }

    // 2️⃣ Cargar el concierto
    const concertId = this.$route.params.id;
    this.concertService.getById(concertId)
        .then(res => {
          this.concert = res.data;

          // venue (solo si falta)
          if (!this.concert.venueAddress) {
            this.loadVenueData();
          }

          // 3️⃣ Ahora sí estas funciones tienen this.user
          this.checkAttendance();
          this.loadAttendeeNames();
        })
        .catch(err => console.error("Error cargando concierto:", err));
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        this.loadConcert(newId);
      }
    }
  },
  methods: {
    async loadConcert(id) {
      try {
        const res = await this.concertService.getById(id);
        this.concert = res.data;

        if (!this.concert.venueAddress) {
          this.loadVenueData();
        }

        this.checkAttendance();
        this.loadAttendeeNames();
      } catch (err) {
        console.error("Error al cargar concierto:", err);
      }
    },

    //go to concert
    goToConcertPage(concertId) {
      console.log("Navegando al concierto", concertId);
      this.showDialog = false;
      this.$router.push(`/concerts/${concertId}`);
    },
//dialog
    async openDialog(platform) {
      this.selectedPlatform = platform;
      this.showDialog = true;
      this.loadingConcertsByPlatform = true;
      this.concertsByPlatform = [];

      try {
        const res = await this.concertService.getByPlatform(platform);
        this.concertsByPlatform = res.data;
      } catch (error) {
        console.error("❌ Error cargando conciertos por plataforma:", error);
      } finally {
        this.loadingConcertsByPlatform = false;
      }
    },

    formatConcertDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },

    checkAttendance() {
      if (!this.user || !Array.isArray(this.concert.attendees)) {
        this.isAttending = false;
        return;
      }
      this.isAttending = this.concert.attendees.includes(this.user.id);
    },
    async loadVenueData() {
      if (!this.concert.venueId) return;

      try {
        const response = await this.concertService.getVenueById(this.concert.venueId);
        const venue = response.data;
        this.concert.venueName = venue.name;
        this.concert.venueAddress = venue.address;
      } catch (error) {
        console.error("❌ Error cargando el venue:", error);
      }
    }
,
    async loadAttendeeNames() {
      try {
        const res = await this.userService.getAll();
        const allUsers = res.data;

        const attendingUsers = allUsers.filter(user =>
            this.concert.attendees?.includes(user.id)
        );

        this.attendeeNames = attendingUsers.map(user => `@${user.username}`);
      } catch (error) {
        console.error("❌ Error cargando usuarios:", error);
      }
    },

    async toggleAttendance() {
      if (!this.user || !this.concert.id) return;

      const isAlreadyAttending = this.concert.attendees.includes(this.user.id);

      try {
        if (isAlreadyAttending) {
          await this.concertService.deleteAttendance(this.concert.id, this.user.id);
        } else {
          await this.concertService.attendConcert(this.concert.id, this.user.id);
        }

        // ✅ Forzar recarga de datos del concierto
        const updatedConcert = await this.concertService.getById(this.concert.id);
        this.concert = updatedConcert.data;
        this.checkAttendance();

        this.$toast.add({
          severity: 'success',
          summary: 'Asistencia actualizada',
          detail: this.isAttending ? 'Asistencia confirmada' : 'Asistencia cancelada',
          life: 3000
        });

        this.loadAttendeeNames();
      } catch (error) {
        console.error("Error al actualizar asistencia:", error);
        this.$toast.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la asistencia',
          life: 3000
        });
      }
    }
  }
};
</script>

<template>
  <div class="concert-detail-page">
    <div class="header-section">
      <!-- Imagen tipo banner, alineada a la izquierda -->
      <div class="image-container">
        <img :src="concert.image" :alt="concert.name" class="banner-img" />
      </div>

      <!-- Info del concierto a la derecha -->
      <div class="details-container-info">
        <div class="concert-info">
          <h1 class="title">{{ $t('concert.arrives_in_lima', { name: concert.name }) }}</h1>
          <p class="description">{{ concert.description }}</p>

          <div class="venue-section">
            <h3>📍 {{ $t('concert.venue_prefix') }} {{ concert.venueName }}</h3>
            <p>
              {{ formatConcertDate(concert.date) }} -
              {{ concert.venueAddress || $t('concert.no_address') }}
            </p>
          </div>
        </div>


        <div class="button-group">
          <pv-button
              :label="isAttending ? $t('concert.cancel_attendance') : $t('concert.confirm_attendance')"
              class="button"
              severity="plain"
              @click="toggleAttendance"
          />
          <div class="platform-section" v-if="concert.platform">
            <h4 class="platform-title">Entradas a la venta en:</h4>

            <div class="platform-logo-container">
              <a
                  v-if="concert.platform === 'Teleticket'"
                  href="https://teleticket.com.pe"
                  target="_blank"
                  rel="noopener"
              >
                <img
                    src="https://yt3.googleusercontent.com/E4LWQc_szds7dK-uBf1MhIS_udkQDvvy-EMbJn9ei_tmjLo67QHtbNxN9K2kKcCQoKUG0Bpon60=s900-c-k-c0x00ffffff-no-rj"
                    alt="Teleticket"
                    class="platform-logo"
                />
              </a>

              <a
                  v-if="concert.platform === 'Joinnus'"
                  href="https://www.joinnus.com/"
                  target="_blank"
                  rel="noopener"
              >
                <img
                    src="https://cdn-blog.joinnus.com/blog/wp-content/uploads/2018/12/19185753/joinnus-logo.jpg"
                    alt="Joinnus"
                    class="platform-logo"
                />
              </a>

              <a
                  v-if="concert.platform === 'Ticketmaster'"
                  href="https://www.ticketmaster.com/"
                  target="_blank"
                  rel="noopener"
              >
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRxQJbZXKweMOFmtB1YVrzer0kg28UAa24qg&s"
                    alt="Ticketmaster"
                    class="platform-logo"
                />
              </a>

              <span class="platform-name" @click="openDialog(concert.platform)">
                                   {{ concert.platform }}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>

    <pv-dialog
        :visible="showDialog"
        modal
        header="Conciertos por plataforma"
        :style="{ width: '40vw' }"
        @update:visible="showDialog = $event"
    >
      <div v-if="loadingConcertsByPlatform">Cargando conciertos...</div>
      <div v-else-if="concertsByPlatform.length === 0">No se encontraron conciertos.</div>
      <div v-else class="concert-list">
        <div
            v-for="concert in concertsByPlatform"
            :key="concert.id"
            class="concert-item"
            @click="goToConcertPage(concert.id)"
        >
           {{ concert.name }} – {{ formatConcertDate(concert.date) }}
        </div>
      </div>
    </pv-dialog>

    <div class="fan-section">
      <h4 class="fan-header">{{ $t('concert.fan_community_title') }}</h4>
      <div class="fan-container">
        <p>
          {{ $t('concert.meet') }} <span class="highlight">{{ $t('concert.fans') }}</span>
          {{ $t('concert.who_will_attend') }}
        </p>


        <div class="fan-list">
          <template v-if="attendeeNames.length > 0">
            <span
                class="fan-handle"
                v-for="(name, index) in attendeeNames"
                :key="index"
            >
              {{ name }}
            </span>
          </template>

          <span v-else class="fan-handle fan-placeholder">
           {{ $t('concert.no_attendees') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>




<style scoped>
.concert-detail-page {
  padding: 2rem;
  color: white;
  background-color: #000;
  min-height: 100vh;
}

.header-section {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5rem;
  flex-wrap: wrap;
}

/* Imagen fija, alargada tipo banner */
.image-container {
  width: 50%;
  height: 18rem;
  overflow: hidden;
  border-radius: 20px;
  flex-shrink: 0;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  display: block;
}

.details-container-info {
  flex: 1;
  min-width: 300px;
}

.concert-info {
  text-align: left;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.description {
  font-size: 1rem;
  text-align: justify;
  margin-bottom: 1rem;
  max-width: 600px;
}

.venue-section {
  margin-top: 1.5rem;
}

.button-group {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
}

.button {
  width: 250px;
  background-color: #000;
  border: 2px solid #cb6ce6;
  color: white;
  border-radius: 20px;
  padding: 0.5rem 1rem;
}

.button-group {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.fan-section {
  margin-top: 2rem;
  text-align: center;
}

.fan-header {
  background-color: #cb6ce6;
  color: black;
  padding: 0.5rem;
  box-shadow: 0 0 10px #cb6ce6;
  width: 100%;
}

.fan-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.fan-container p {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.fan-list {
  width: 80%;
  min-height: 8rem;
  background-color: #1a1a1a;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
}

.fan-handle {
  background-color: #2c2c2c;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  white-space: nowrap;
}

.fan-placeholder {
  color: gray;
  background-color: transparent;
  border: 1px dashed #444;
}

.button:hover {
  background-color: #CB6CE6;
  color: black;
  border-color: #CB6CE6;
  transition: background-color 0.3s, color 0.3s;
}

.platform-title {
  font-size: 1.8rem;
  font-weight: bold;
  color: #cb6ce6;
  margin-bottom: 1rem;
}

.platform-name {
  font-weight: bold;
  font-size: 2rem;
  color: white;
  cursor: pointer;
}
.platform-section {
  margin-top: 1.5rem;
}

.platform-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}

.platform-logo {
  height: 120px;
  width: auto;
  object-fit: contain;
  border-radius: 6px;
  background-color: white;
  padding: 2px;
}

/* Fondo del modal */
:deep(.p-dialog-mask) {
  backdrop-filter: blur(8px);
  background: rgba(20, 20, 20, 0.75);
}

/* Contenedor del diálogo */
:deep(.p-dialog) {
  background-color: #111;
  border-radius: 20px;
  box-shadow: 0 0 20px #cb6ce6;
  color: white;
}

/* Header del modal */
:deep(.p-dialog .p-dialog-header) {
  background-color: transparent;
  border-bottom: 1px solid #cb6ce6;
  justify-content: center;
}

:deep(.p-dialog-title) {
  color: #cb6ce6;
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
}

/* Contenido del diálogo */
:deep(.p-dialog-content) {
  background-color: transparent;
  padding-top: 1rem;
  padding-bottom: 1.5rem;
}

/* Lista de conciertos */
.concert-item {
  padding: 0.75rem 1rem;
  margin: 0.5rem 0;
  background-color: #1a1a1a;
  border: 1px solid #cb6ce6;
  border-radius: 12px;
  font-size: 1rem;
  transition: transform 0.2s;
}

.concert-item:hover {
  transform: scale(1.02);
  box-shadow: 0 0 10px #cb6ce6;
  cursor: pointer;
}
</style>
