<script setup>
import { useAuthStore } from './iam/services/authentication.store'
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from "@/public/language-switcher.vue";



const drawer = ref(false)
const searchQuery = ref('')

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()


onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    authStore.user = JSON.parse(storedUser)
  }
})

const isAuthenticated = computed(() => authStore.user !== null)
const user = computed(() => authStore.user)

const items = [
  { label: 'option.concerts', to: '/concerts' },
  { label: 'option.map', to: '/concerts-map' },
  { label: 'option.communities', to: '/communities' }
]

const logout = () => {
  authStore.signOut(router)
}

const isAuthPage = computed(() =>
    ['login', 'register', 'sign-in', 'sign-up'].includes(route.name)
)
</script>

<template>
  <pv-toast />
  <pv-confirm-dialog />

  <header v-if="!isAuthPage">
    <pv-toolbar class="custom-toolbar">
      <!-- Logo -->
      <template #start>
        <div class="logo-section">
          <img
              src="https://the-rumbling.github.io/StayMap-Landing_Page/starymaplogo.png"
              alt="Logo"
              class="logo"
          />
        </div>
      </template>

      <!-- Navegación -->
      <template #center>
        <div class="flex gap-7 justify-center items-center">
          <router-link
              v-for="item in items"
              :key="item.label"
              :to="item.to"
              class="nav-button"
          >
            {{ $t(item.label) }}
          </router-link>
          <input
              v-model="searchQuery"
              :placeholder="$t('navbar.search_placeholder')"
              class="your-input-class"
          />
        </div>
      </template>

      <!-- Login o Perfil -->
      <template #end>
        <div class="flex items-center gap-3 h-full">
          <language-switcher />
          <router-link v-if="!isAuthenticated" to="/sign-in" class="nav-button">
            {{ $t('navbar.login') }}
          </router-link>


          <div v-else class="flex items-center gap-2 logout-container">
            <router-link to="/profile">
              <img
                  :src="user?.profileImage || 'https://via.placeholder.com/32'"
                  alt="Perfil"
                  class="user-avatar"
              />
            </router-link>
            <button @click="logout" class="logout-button">
              {{ $t('navbar.logout') }}
            </button>

          </div>
        </div>
      </template>
    </pv-toolbar>
    <pv-drawer v-model:visible="drawer" />
  </header>

  <main>
    <router-view :searchQuery="searchQuery" />
  </main>


</template>

<style scoped>
.logout-button {
  background-color: #CB6BE6;
  color: #000;
  box-shadow: 0 0 5px rgba(203, 107, 230, 0.5);
  font-weight: bold;
  padding: 0.3rem 0.9rem;
  border-radius: 20px;
  border: none;
  font-size: 0.85rem;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background-color 0.3s ease;
}

.logout-container {
  display: flex;
  align-items: center; /* Asegura alineación vertical */
  gap: 10px;
}
.logout-button {
  height: 42px; /* ligeramente más alto para mejor match con el avatar */
  padding: 0.3rem 1.1rem;
}

.logout-button:hover {
  background-color: #e2e2e2;
  cursor: pointer;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #CB6BE6;
  box-shadow: 0 0 5px rgba(203, 107, 230, 0.5);
  transition: transform 0.2s ease-in-out;
}
.user-avatar:hover {
  transform: scale(1.05);
}

</style>
