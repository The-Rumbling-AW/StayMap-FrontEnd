<script>
import { Loader } from '@googlemaps/js-api-loader';
import { ConcertService } from '@/concerts/services/concert.services';
import { Concert } from '@/concerts/model/concert.entity';

export default {
  name: "concert-map-component",
  data() {
    return {
      concerts: [],
      map: null,
      infoWindow: null,
      markers: [],
      userLocation: {
        lat: null,
        lng: null,
        icon: 'https://the-rumbling.github.io/StayMap-Landing_Page/starymaplogo.png'
      },
      concertService: null,
    };
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

    getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
              this.userLocation.lat = position.coords.latitude;
              this.userLocation.lng = position.coords.longitude;
              this.fetchConcerts(); // continúa después de obtener ubicación
            },
            (error) => {
              console.warn("Error al obtener ubicación:", error.message);
              // fallback a Lima
              this.userLocation.lat = -12.0464;
              this.userLocation.lng = -77.0428;
              this.fetchConcerts();
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        console.warn("Geolocalización no soportada");
        this.userLocation.lat = -12.0464;
        this.userLocation.lng = -77.0428;
        this.fetchConcerts();
      }
    },

    fetchConcerts() {
      this.concertService = new ConcertService();
      this.concertService.getAll().then(response => {
        this.concerts = response.data.map(c => new Concert(c));
        this.$nextTick(() => {
          this.loadMap(); // se asegura que el ref ya está disponible
        });
      });
    },

    loadMap() {
      const mapDiv = this.$refs.map;

      const loader = new Loader({
        apiKey: 'AIzaSyAd-IuCKmGRzA4BsS2Yz_hR5FD6-XHUqjA',
        version: 'weekly',
        libraries: ['places']
      });

      loader.load().then(() => {
        this.map = new google.maps.Map(mapDiv, {
          center: this.userLocation,
          zoom: 13,
          disableDefaultUI: false, //  Habilita todos los controles por defecto
          streetViewControl: true, // Asegura que Street View esté activo
        });

        new google.maps.Marker({
          position: this.userLocation,
          map: this.map,
          icon: {
            url: this.userLocation.icon,
            scaledSize: new google.maps.Size(40, 40)
          }
        });

        this.infoWindow = new google.maps.InfoWindow();

        this.concerts.forEach(concert => {
          const position = {
            lat: Number(concert.venueLat) + this.getRandomOffset(),
            lng: Number(concert.venueLng) + this.getRandomOffset()
          };

          const marker = new google.maps.Marker({
            position,
            map: this.map,
            icon: {
              url: 'https://the-rumbling.github.io/StayMap-Landing_Page/starymaplogo.png',
              scaledSize: new google.maps.Size(40, 40)
            }
          });

          marker.addListener('click', () => {
            const data = { ...concert };
            this.infoWindow.setContent(
                `<div style="font-family: Arial, sans-serif; color: black; padding: 4px; max-width: 250px;">
                <h3 style="margin: 0 0 6px 0; font-size: 16px;">${data.name}</h3>
                <img src="${data.image}" alt="${data.name}" style="width: 100%; height: auto; border-radius: 10px; margin-bottom: 6px;" />
                <p style="margin: 0; font-size: 14px;"><strong>Lugar:</strong> ${data.venueName}</p>
                <p style="margin: 0; font-size: 14px;"><strong>Fecha:</strong> ${this.formatConcertDate(data.date)}</p>
              </div>`
            );
            this.infoWindow.open(this.map, marker);
          });

          this.markers.push(marker);
        });
      });
    },

    getRandomOffset() {
      return (Math.random() - 0.5) * 0.00005;
    },

    goToDetails(concertId) {
      this.$router.push(`/concerts/${concertId}`);
    },

    zoomToVenue(concert) {
      const lat = Number(concert.venueLat);
      const lng = Number(concert.venueLng);
      if (this.map && lat && lng) {
        this.map.setZoom(17);
        this.map.panTo({ lat, lng });

        // Buscar el marcador correspondiente por lat/lng
        const marker = this.markers.find(m =>
            Math.abs(m.getPosition().lat() - lat) < 0.0001 &&
            Math.abs(m.getPosition().lng() - lng) < 0.0001
        );

        if (marker) {
          const data = { ...concert };
          this.infoWindow.setContent(
              `<div style="font-family: Arial, sans-serif; color: black; padding: 4px; max-width: 250px;">
          <h3 style="margin: 0 0 6px 0; font-size: 16px;">${data.name}</h3>
          <img src="${data.image}" alt="${data.name}" style="width: 100%; height: auto; border-radius: 10px; margin-bottom: 6px;" />
          <p style="margin: 0; font-size: 14px;"><strong>Lugar:</strong> ${data.venueName}</p>
          <p style="margin: 0; font-size: 14px;"><strong>Fecha:</strong> ${this.formatConcertDate(data.date)}</p>
        </div>`
          );
          this.infoWindow.open(this.map, marker);
        }
      }
    }
  },
  mounted() {
    this.getUserLocation();
  }
};
</script>

<template>
  <div class="container">
    <div class="sidebar">
      <div v-for="concert in concerts" :key="concert.id" class="card">
        <h3 @click="goToDetails(concert.id)" style="cursor: pointer; color: #b54cf4;">
          {{ concert.name }}
        </h3>

        <p @click="zoomToVenue(concert)" style="cursor: pointer; text-decoration: underline;">
          {{ concert.venueName }} - {{ formatConcertDate(concert.date) }}
        </p>

        <span :class="['status-badge', concert.status === 'Available' ? 'available' : 'soldout']">
          {{ concert.status }}
        </span>
      </div>
    </div>

    <div class="map-section">
      <h1>{{ $t('concert.map_title_part1') }} <span class="resaltado">{{ $t('concert.map_title_highlight') }}</span></h1>

      <!-- Solo renderiza el mapa si hay lat/lng -->
      <div v-if="userLocation.lat && userLocation.lng" ref="map" class="mapa-style"></div>

      <!--  Mensaje mientras se obtiene ubicación -->
      <div v-else style="color: white; text-align: center; padding: 2rem;">
        {{ $t('concert.locating') }}
      </div>

    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  background-color: #121212;
  color: white;
  font-family: system-ui, Arial, sans-serif;
}

/* SIDEBAR */
.sidebar {
  width: 300px;
  background-color: #1e1e1e;
  padding: 1rem;
  overflow-y: auto;
  border-right: 1px solid #2b2b2b;
}

/* Card */
.card {
  background: #2a2a2a;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: scale(1.01);
  box-shadow: 0 0 14px rgba(181, 76, 244, 0.4);
}

.card h3,
.card p {
  margin: 0;
  cursor: pointer;
  color: white;
}

.card h3 {
  color: #cb6ce6;
  font-weight: bold;
  font-size: 1rem;
}

.card h3:hover,
.card p:hover {
  color: #e5c1ff;
}

/* Badges */
.status-badge {
  display: inline-block;
  margin-top: 0.7rem;
  padding: 0.25rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.available {
  background-color: #2ecc71;
  color: white;
}

.soldout {
  background-color: #e74c3c;
  color: white;
}

.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.map-section h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: white;
}

.mapa-style {
  flex: 1;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
}

.resaltado {
  color: #cb6ce6;
  font-weight: bold;
}
</style>
