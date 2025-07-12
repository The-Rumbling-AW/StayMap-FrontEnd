<script>
import { ConcertService } from '@/concerts/services/concert.services.js';

export default {
  props: {
    visible: Boolean,
    platform: String
  },
  data() {
    return {
      internalVisible: false,
      concerts: [],
      loading: false,
      concertService: new ConcertService()
    };
  },
  watch: {
    visible(newVal) {
      this.internalVisible = newVal;
      if (newVal) this.fetchConcerts();
    }
  },
  methods: {
    async fetchConcerts() {
      this.loading = true;
      try {
        const res = await this.concertService.getByPlatform(this.platform);
        this.concerts = res.data;
      } catch (error) {
        console.error("Error al cargar conciertos:", error);
      } finally {
        this.loading = false;
      }
    },
    handleDialogClose(newVal) {
      this.internalVisible = newVal;
      this.$emit('update:visible', newVal);
    }
  }
};
</script>

<template>
  <pv-dialog
      :visible="internalVisible"
      modal
      header="Conciertos por plataforma"
      :style="{ width: '40vw' }"
      @update:visible="handleDialogClose"
  >
    <div v-if="loading">Cargando conciertos...</div>
    <div v-else-if="concerts.length === 0">No se encontraron conciertos.</div>
    <ul v-else>
      <li v-for="concert in concerts" :key="concert.id" class="concert-item">
        🎵 {{ concert.name }} – {{ concert.date }}
      </li>
    </ul>
  </pv-dialog>
</template>

<style scoped>
.concert-item {
  padding: 0.5rem;
  color: white;
}
</style>