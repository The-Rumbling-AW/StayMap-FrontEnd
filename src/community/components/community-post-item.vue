<script>
import { User } from '@/users/model/user.entity.js'
import { Post } from '@/community/model/post.entity.js'
import { UserService } from '@/users/services/user.service.js'
import { uploadToCloudinary } from "@/shared/services/cloudinary.service.js"
import {PostService} from "@/community/services/post.service.js";

export default {
  name: 'community-post-item',
  emits: ['post-submitted', 'cancel-post','post-deleted'],
  props: {
    post: { type: Post, required: true }
  },
  data() {
    return {
      currentUser: null,
      postService: new PostService(),  // 👈 inicializamos el servicio aquí
      user: new User({}),
      userService: new UserService(),
      postedAtText: '',
      intervalId: null,
      uploading: false,
      uploadError: '',
      isLiked: false, // 👈 ESTO ES NECESARIO
      likeCount: 0  // 👈 contador local
    }
  },
  created() {

    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser = JSON.parse(user);
      this.isLiked = this.currentUser.likedPosts?.includes(this.post.id) || false;
    }

    this.likeCount = this.post.likeCount ?? 0;
    
    // cargar user
    if (this.post.userId) {
      this.userService.getById(this.post.userId).then(r => { this.user = r.data })
    }
    // reloj
    this.updatePostedAtText()
    this.intervalId = setInterval(this.updatePostedAtText, 1000)
    console.log("currentUser.id:", this.currentUser?.id, "post.userId:", this.post.userId);

  },
  beforeUnmount() {
    clearInterval(this.intervalId)
  },
  methods: {
    updatePostedAtText() {
      const postedAt = new Date(this.post.postedAt)
      const diff = Math.max(Date.now() - postedAt.getTime(), 0)
      const s = Math.floor(diff / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      this.postedAtText =
          s < 60 ? `${s}s`
              : m < 60 ? `${m}min`
                  : h < 24 ? `${h}h`
                      : postedAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) + '.'
    },

    async deletePost() {
      try {
        const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este post?')
        if (!confirmDelete) return;

        await this.postService.delete(this.post.id)
        this.$emit('post-deleted', this.post.id) // opcional si el padre debe eliminarlo del array
      } catch (error) {
        console.error('Error al eliminar el post:', error)
        alert('Hubo un error al eliminar el post.')
      }
    },

    async onFileSelected(e) {
      const file = e.target.files[0]
      if (!file) return
      this.uploading = true
      this.uploadError = ''
      try {
        const url = await uploadToCloudinary(file)
        this.post.imageUrl = url
      } catch (err) {
        console.error(err)
        this.uploadError = err.message
      } finally {
        this.uploading = false
      }
    },

    async toggleLike() {
      if (!this.currentUser) return alert("Inicia sesión para dar like");

      try {
        if (this.isLiked) {
          // Ya estaba likeado → eliminar like
          await this.userService.removeLikeFromPost(this.currentUser.id, this.post.id);
          this.isLiked = false;
          this.likeCount = Math.max(0, this.likeCount - 1);
        } else {
          // No estaba likeado → dar like
          await this.userService.likePost(this.currentUser.id, this.post.id);
          this.isLiked = true;
          this.likeCount += 1;
        }
      } catch (err) {
        console.error("Error al alternar like:", err);
      }
    },





    submitPost() {
      if (!this.post.content || !this.post.content.trim()) return

      this.$emit('post-submitted', {
        content: this.post.content,
        imageUrl: this.post.imageUrl
      })

      // Limpiar los campos después de enviar
      this.post.content = ''
      this.post.imageUrl = ''
    },

    cancel() {
      this.$emit('cancel-post')
    }
  }
}
</script>

<template>
  <div class="post-card">
    <img class="avatar" :src="user.profileImage" :alt="user.name" />
    <div class="post-content">
      <!-- EXISTING POST -->
      <template v-if="post.id !== 0">
        <div class="post-header">
          <strong>{{ user.name }}</strong>
          <span class="timestamp">· {{ postedAtText }}</span>
        </div>
        <div class="post-text">{{ post.content }}</div>

        <div v-if="post.imageUrl" class="post-image">
          <img :src="post.imageUrl" alt="imagen" />
        </div>

        <!--  Botón Like + contador -->
        <div class="post-actions">

          <button
              :class="['like-button', { liked: isLiked }]"
              @click="toggleLike"
          >
            ❤️ {{ isLiked ? 'Liked' : 'Like' }} • {{ likeCount }}
          </button>

          <button
              v-if="currentUser && Number(currentUser.id) === Number(post.userId)"
              class="btn-delete"
              @click="deletePost"
          >
            Eliminar
          </button>
        </div>

      </template>

      <!-- NEW POST -->
      <template v-else>
        <textarea v-model="post.content" class="post-input" placeholder="¿Qué está pasando?" />

        <div class="post-actions-row">
          <label class="upload-icon">
            📷
            <input type="file" accept="image/*" @change="onFileSelected" hidden />
          </label>
          <div v-if="uploading" class="uploading">Subiendo imagen…</div>
          <div v-if="uploadError" class="error">{{ uploadError }}</div>
        </div>

        <div v-if="post.imageUrl" class="post-image">
          <img :src="post.imageUrl" alt="preview" />
        </div>

        <div class="post-footer">
          <button class="btn-post" @click="submitPost">Postear</button>
          <button class="btn-cancel" @click="cancel">Cancelar</button>
        </div>
      </template>
    </div>
  </div>
</template>


<style scoped>
.post-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background-color: #16181c;
  border-bottom: 1px solid #2f3336;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  object-fit: cover;
}


.post-content {
  flex: 1;
}

.post-header {
  font-size: 15px;
  color: #e7e9ea;
}

.timestamp {
  font-weight: normal;
  color: #71767b;
  margin-left: 6px;
}

.post-text {
  margin-top: 4px;
  font-size: 15px;
  color: #d9d9d9;
  white-space: pre-wrap;
}

.post-input {
  width: 100%;
  background: transparent;
  border: none;
  resize: none;
  color: #e7e9ea;
  font-size: 15px;
  outline: none;
  padding: 8px 0;
  min-height: 50px;
}

.post-actions-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.upload-icon {
  cursor: pointer;
  font-size: 18px;
  color: #1d9bf0;
  transition: color 0.2s;
}

.upload-icon:hover {
  color: #8ecdf8;
}

.uploading {
  color: #cb6ce6;
  font-size: 0.9rem;
}

.error {
  color: #ff5c5c;
  font-size: 0.9rem;
}

.post-image {
  margin-top: 10px;
  max-height: 300px;
  overflow: hidden;
  border-radius: 12px;
}

.post-image img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #2f3336;
  display: block;
}

.post-footer {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.btn-post {
  background-color: #cb6ce6;
  color: white;
  font-weight: bold;
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-post:hover {
  background-color: #b347d3;
}

.btn-cancel {
  background-color: transparent;
  color: #aaa;
  border: 1px solid #444;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: border 0.2s, color 0.2s;
}

.btn-cancel:hover {
  border-color: #666;
  color: #fff;
}


.btn-delete {
  margin-top: 12px;
  background-color: #ff5c5c;
  color: white;
  padding: 8px 16px;
  border: 2px solid #e41717;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: bold;


}

.btn-delete:hover {
  background-color: #ff3b3b;
}


.like-button {
  margin-top: 12px;
  padding: 8px 16px;
  background-color: transparent;
  color: #cb6ce6;
  border: 2px solid #cb6ce6;
  border-radius: 999px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  font-size: 14px;
}

.like-button:hover {
  background-color: #cb6ce6;
  color: white;
}

.like-button.liked {
  background-color: #cb6ce6;
  color: white;
  border-color: #cb6ce6;
}

.post-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}


</style>
