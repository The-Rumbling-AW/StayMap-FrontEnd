<template>
  <div class="wrapper">
    <div class="containerLogin">
      <div class="left">
        <img src="https://the-rumbling.github.io/StayMap-Landing_Page/taylor.jpeg" alt="Logo Image" />
      </div>
      <div class="right">
        <div class="form-container">
          <img src="https://the-rumbling.github.io/StayMap-Landing_Page/starymaplogo.png" class="logo" />
          <h2>{{ $t('auth.welcome') }} <span class="purple">StayMap</span>!</h2>
          <form @submit.prevent="onSignIn">
            <label for="username">{{ $t('auth.username_label') }}</label>
            <input id="username" v-model="username" type="text" :placeholder="$t('auth.username_placeholder')" required />

            <label for="password">{{ $t('auth.password_label') }}</label>
            <input id="password" v-model="password" type="password" :placeholder="$t('auth.password_placeholder')" required />

            <button type="submit" class="btn-submit">{{ $t('auth.login_button') }}</button>
            <p v-if="error" class="error">{{ error }}</p>
          </form>

          <div class="divider"><span>—————— o ——————</span></div>

          <router-link to="/sign-up" class="btn-register">
            {{ $t('auth.register_prompt') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../services/authentication.store.js'
import { SignInRequest } from '../model/sign-in.request.js'

export default {
  name: 'SignIn',
  data() {
    return {
      username: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async onSignIn() {
      try {
        const authStore = useAuthStore();
        const request = new SignInRequest(this.username, this.password);
        await authStore.signIn(request, this.$router);
      } catch (e) {
        this.error = 'Credenciales incorrectas o error de conexión.';
        console.error(e);
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
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
}
.containerLogin {
  display: flex;
  width: 90vw;
  height: 90vh;
  max-width: 900px;
  max-height: 600px;
  border-radius: 10px;
  overflow: hidden;
  justify-content: center;
  box-shadow: 0 0 25px rgba(184,111,255,0.5);
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
  background-color: #0e0e0e;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 30px;
}
.form-container {
  width: 100%;
  max-width: 320px;
  text-align: center;
}
.logo {
  width: 80px;
  margin-bottom: 15px;
}
h2 {
  margin-bottom: 20px;
  color: #fff;
}
.purple {
  color: #CB6CE6;
}
form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
label {
  display: block;
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
  border-color: #CB6CE6;
  box-shadow: 0 0 6px #CB6CE6;
}
.btn-submit {
  padding: 14px 0;
  border: none;
  border-radius: 25px;
  background: #CB6CE6;
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  transition: background 0.3s;
}
.btn-submit:hover {
  background: #A35BE5;
}
.divider {
  margin: 15px 0;
  color: #ccc;
  text-align: center;
}
.btn-register {
  display: inline-block;
  margin-top: 10px;
  padding: 10px 20px;
  border-radius: 20px;
  background-color: transparent;
  border: 1px solid #CB6CE6;
  color: #CB6CE6;
  text-decoration: none;
  font-weight: bold;
  transition: background 0.3s, color 0.3s;
}
.btn-register:hover {
  background-color: #CB6CE6;
  color: #1e1e1e;
}
.error {
  color: #e74c3c;
  margin-top: 8px;
  text-align: left;
}
</style>