<template>
  <div class="wrapper">
    <div class="containerRegister">
      <div class="left">
        <img src="https://i.pinimg.com/736x/2b/ef/88/2bef8867c232a2985a64b3feede8e152.jpg" alt="Background Image" />
      </div>
      <div class="right">
        <div class="form-container">
          <img src="https://the-rumbling.github.io/StayMap-Landing_Page/starymaplogo.png" class="logo" />
          <h2><span class="purple">{{ $t('auth.register_title') }}</span> StayMap</h2>

          <form @submit.prevent="onSignUp">
            <label for="name">{{ $t('auth.name_label') }}</label>
            <input id="name" v-model="name" type="text" required />

            <label for="email">{{ $t('auth.email_label') }}</label>
            <input id="email" v-model="email" type="email" required />

            <label>{{ $t('auth.user_type_label') }}</label>
            <div class="radio-group">
              <label><input type="radio" value="Artist" v-model="type" /> {{ $t('auth.artist') }}</label>
              <label><input type="radio" value="Fan" v-model="type" /> {{ $t('auth.fan') }}</label>
            </div>

            <label for="username">{{ $t('auth.username_label') }}</label>
            <input id="username" v-model="username" type="text" :placeholder="$t('auth.username_placeholder')" required />

            <label for="password">{{ $t('auth.password_label') }}</label>
            <input id="password" v-model="password" type="password" required />

            <label for="profileImage">{{ $t('auth.profile_image_label') }}</label>
            <input id="profileImage" type="file" @change="onFileSelected" accept="image/*" required />

            <button type="submit" class="btn-submit">{{ $t('auth.register_button') }}</button>
          </form>

          <p v-if="error" class="error">{{ error }}</p>
          <p v-if="success" class="success">
            {{ $t('auth.register_success') }}
            <router-link to="/sign-in">{{ $t('auth.login_link') }}</router-link>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../services/authentication.store.js'
import { SignUpRequest } from '../model/sign-up.request.js'
import {uploadToCloudinary} from "@/shared/services/cloudinary.service.js";


export default {
  name: 'SignUp',
  data() {
    return {
      authenticationStore: useAuthStore(),
      username: '',
      password: '',
      name: '',
      email: '',
      type: 'Fan',
      profileImage: '',
      file: null,
      success: false,
      error: ''
    }
  },
  methods: {
    onFileSelected(e) {
      this.file = e.target.files[0]
    },
    async onSignUp() {
      try {
        if (!this.username || !this.password || !this.name || !this.email || !this.file) {
          this.error = 'Todos los campos son obligatorios'
          return
        }


        const imageUrl = await uploadToCloudinary(this.file)
        this.profileImage = imageUrl


        const signUpRequest = new SignUpRequest(
            this.username,
            this.password,
            this.name,
            this.email,
            this.profileImage,
            this.type
        )


        await this.authenticationStore.signUp(signUpRequest, this.$router)
        this.success = true
        this.error = ''
      } catch (e) {
        console.error(e)
        this.error = 'Error al registrar usuario.'
        this.success = false
      }
    }
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
}
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}
.containerRegister {
  display: flex;
  width: 90vw;
  height: 90vh;
  max-width: 900px;
  max-height: 600px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #0e0e0e 60%, #1f1f1f);
}
.left {
  flex: 1;
}
.left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.right {
  flex: 1;
  background: #121212;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 30px;
  overflow-y: auto;
}
.form-container {
  width: 100%;
  max-width: 320px;
  text-align: center;
}
.logo {
  width: 80px;
  margin-bottom: 20px;
}
h2 {
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
}
.purple {
  color: #cb6ce6;
}
form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
label {
  text-align: left;
  font-weight: 600;
  color: #ccc;
}
input {
  padding: 12px;
  border-radius: 25px;
  border: 1.5px solid #555;
  background: transparent;
  color: #eee;
  font-size: 1rem;
}
input::placeholder {
  color: #777;
}
input:focus {
  outline: none;
  border-color: #cb6ce6;
  box-shadow: 0 0 6px #cb6ce6;
}
.radio-group {
  display: flex;
  gap: 20px;
  justify-content: center;
}
.btn-submit {
  padding: 14px 0;
  border: none;
  border-radius: 25px;
  background: #cb6ce6;
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-submit:hover {
  background: #a35be5;
}
.error {
  color: #e74c3c;
  margin-top: 10px;
  text-align: left;
}
.success {
  color: #2ecc71;
  margin-top: 10px;
}
</style>
