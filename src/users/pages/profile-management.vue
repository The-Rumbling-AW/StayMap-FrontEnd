<script>
import { ConcertService } from "@/concerts/services/concert.services.js";
import { User } from "@/users/model/user.entity.js";
import EditProfile from "@/users/components/edit-profile.component.vue";
import { UserService } from "@/users/services/user.service.js";
import { PostService } from "@/community/services/post.service.js";


export default {
  name: "profile-management",
  components: { EditProfile },
  data() {
    
    
    
    return {
      user: null,
      allConcerts: [],
      upcomingConcerts: [],
      attendedConcerts: [],
      concertService: new ConcertService(),
      userService: new UserService(),
      editDialogVisible: false,
      likedPostsData: [], // ← Aquí guardaremos los posts con like
      postService: new PostService(),


    };
  },
  async mounted() {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.id) {
        console.error("Usuario no disponible en localStorage");
        return;
      }

      this.user = storedUser;

      // ✅ Cambiar this.userService.getById(...).then(...) por await
      const response = await this.userService.getById(this.user.id);
      const fetchedUser = response.data;

      if (fetchedUser.type) {
        fetchedUser.type = fetchedUser.type.toLowerCase(); // normaliza tipo
      }

      this.user = fetchedUser;
      localStorage.setItem('user', JSON.stringify(this.user)); // actualiza storage

      // ✅ Ahora sí puedes usar await sin error
      await this.loadLikedPosts();  // <- esta línea daba error antes

      // ✅ Luego cargar conciertos
      this.loadConcerts();

    } catch (error) {
      console.error("Error al montar componente:", error);
    }
  },

  methods: {

    async loadLikedPosts() {
      this.likedPostsData = [];

      if (!this.user.likedPosts || this.user.likedPosts.length === 0) return;

      try {
        const postPromises = this.user.likedPosts.map(id => this.postService.getById(id));
        const responses = await Promise.all(postPromises);
        this.likedPostsData = responses.map(res => res.data);
      } catch (error) {
        console.error("Error al cargar posts que te gustaron:", error);
      }
    },


    async loadConcerts() {
      try {
        this.allConcerts = await this.concertService.getAllConcerts();
        const now = new Date();

        this.upcomingConcerts = this.allConcerts.filter(concert =>
            concert.attendees &&
            concert.attendees.includes(this.user.id) &&
            new Date(concert.date) >= now
        );

        this.attendedConcerts = this.allConcerts.filter(concert =>
            concert.attendees &&
            concert.attendees.includes(this.user.id) &&
            new Date(concert.date) < now
        );
      } catch (error) {
        console.error("Error al cargar conciertos:", error);
      }
    },
    async handleSave(updatedUser) {
      try {
        await this.userService.update(updatedUser.id, updatedUser);
        this.user = updatedUser;
        localStorage.setItem("user", JSON.stringify(this.user));
        this.editDialogVisible = false;
        this.$toast.add({ severity: "success", summary: "Perfil actualizado", life: 3000 });
      } catch (err) {
        this.$toast.add({ severity: "error", summary: "Error al actualizar", detail: err.message });
      }
    }
  }
};
</script>

<template>
  <div class="profile-container">
    <div v-if="user" class="profile-card">
      <div class="profile-info">
        <h1><strong>Tipo:</strong> {{ user.type.toLowerCase() === 'fan' ? 'Fan' : 'Artista' }}</h1>
        <img :src="user.profileImage || 'https://via.placeholder.com/100'" alt="Foto de perfil" class="profile-img" />
        <p>{{ user.name }}</p>
        <p class="profile-email-info">{{ user.email }}</p>
        <button class="edit-button" @click="editDialogVisible = true">Editar perfil</button>
        <edit-profile
            :user="user"
            :visible="editDialogVisible"
            @cancel-requested="editDialogVisible = false"
            @save-requested="handleSave"
        />
      </div>

      <div class="profile-concert-to-attended">
        <h1><strong>Conciertos por Asistir</strong></h1>
        <p v-if="upcomingConcerts.length === 0">No tienes conciertos pendientes.</p>
        <router-link
            v-for="concert in upcomingConcerts"
            :key="'upcoming-' + concert.id"
            :to="`/concerts/${concert.id}`"
            class="concert-link"
        >
          {{ concert.name }} - {{ new Date(concert.date).toLocaleDateString("es-PE", {
          year: 'numeric', month: 'long', day: 'numeric'
        }) }}
        </router-link>
      </div>

      <div class="profile-concert-attended">
        <h1><strong>Conciertos Asistidos</strong></h1>
        <p v-if="attendedConcerts.length === 0">Aún no has asistido a ningún concierto.</p>
        <router-link
            v-for="concert in attendedConcerts"
            :key="'attended-' + concert.id"
            :to="`/concerts/${concert.id}`"
            class="concert-link"
        >
          {{ concert.name }} - {{ concert.date }}
        </router-link>
      </div>

      <div class="profile-liked-posts">
        <h1><strong>Posts que te gustaron</strong></h1>
        <p v-if="likedPostsData.length === 0">No has dado like a ningún post aún.</p>
        <div
            v-for="post in likedPostsData"
            :key="'liked-' + post.id"
            class="liked-post-card"
        >
          <p><strong>Contenido:</strong> {{ post.content }}</p>
          <p v-if="post.imageUrl">
            <img
                :src="post.imageUrl"
                alt="Imagen del post"
                style="max-width: 100%; border-radius: 10px; margin-top: 10px;"
            />
          </p>
        </div>
      </div>



    </div>

    <div v-else>
      <p>No hay información de usuario disponible.</p>
    </div>
  </div>
</template>

<style scoped>
.concert-link {
  display: block;
  font-size: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid #333;
  padding-bottom: 6px;
  color: white;
  text-decoration: none;
  transition: color 0.2s;
}
.concert-link:hover {
  color: #CB6CE6;
}
.profile-container {
  display: flex;
  justify-content: center;
  background-color: #000;
  color: white;
  font-family: Arial, sans-serif;
  padding: 40px;
  flex-wrap: wrap;
}
.profile-card {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  justify-content: center;
}
.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 350px;
  padding: 30px;
  border-radius: 20px;
}
.profile-img {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 4px solid #a855f7;
  object-fit: cover;
  margin-bottom: 20px;
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
}
.profile-info h1 {
  font-size: 22px;
  margin-bottom: 10px;
}
.profile-info p {
  font-size: 18px;
}
.profile-email-info {
  color: #aaa;
  font-size: 16px;
}
.profile-concert-attended,
.profile-concert-to-attended {
  background-color: #1f1f1f;
  padding: 30px;
  border-radius: 20px;
  width: 300px;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}
.profile-concert-attended h1,
.profile-concert-to-attended h1 {
  font-size: 20px;
  margin-bottom: 16px;
}
.profile-concert-attended p,
.profile-concert-to-attended p {
  font-size: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid #333;
  padding-bottom: 6px;
}
@media (max-width: 768px) {
  .profile-info {
    max-width: 100%;
    padding: 20px;
  }
  .profile-img {
    max-width: 150px;
  }
  .profile-concert-attended,
  .profile-concert-to-attended {
    width: 90%;
    padding: 20px;
  }
  .profile-info h1,
  .profile-concert-attended h1,
  .profile-concert-to-attended h1 {
    font-size: 18px;
  }
  .profile-info p,
  .profile-concert-attended p,
  .profile-concert-to-attended p {
    font-size: 14px;
  }
}
.edit-button {
  background-color: #CB6BE6;
  padding: 0.6rem 1.5rem;
  border-radius: 20px;
  color: white;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}
.edit-button:hover {
  background-color: #9333ea;
}

.profile-liked-posts {
  background-color: #1f1f1f;
  padding: 30px;
  border-radius: 20px;
  width: 300px;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.liked-post-card {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #333;
  border-radius: 10px;
  background-color: #2a2a2a;
  color: white;
}
.profile-liked-posts h1 {
  font-size: 20px;
  margin-bottom: 16px;
}

.profile-liked-posts p {
  font-size: 16px;
  margin-bottom: 12px;
  border-bottom: 1px solid #333;
  padding-bottom: 6px;
}

</style>