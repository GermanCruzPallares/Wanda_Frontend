<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/UserStore';

const userStore = useUserStore();

const email = ref('');
const password = ref('');
const isPasswordVisible = ref(false);

function togglePassword() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

const handleLogin = async () => {
  // Estos logs te ayudarán a ver qué está pasando
  console.log("1. Botón pulsado");
  console.log("Email:", email.value);
  console.log("Pass:", password.value);

  if (!email.value || !password.value) {
    alert("Por favor rellena los campos");
    return;
  }
  
  await userStore.login(email.value, password.value);
};
</script>

<template>
  <section class="card card__login">
    <header class="card__header">
      <h3 class="card__subtitle">¡ Bienvenido de nuevo !</h3>
      <h2 class="card__title">Accede a tu cuenta</h2>
    </header>

    <form class="auth-form" @submit.prevent="handleLogin">
      <div class="form-group">
        <div class="form-group__field">
          <span class="form-group__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </span>
          
          <input 
            v-model="email"
            type="email" 
            class="form-group__input" 
            placeholder="Correo electrónico" 
            required 
          />
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__field" style="position: relative">
          <span class="form-group__icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
          </span>

          <input
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            id="password-input"
            class="form-group__input"
            placeholder="Contraseña"
            required
          />

          <button type="button" @click="togglePassword" class="form-group__toggle-btn">
            <svg v-if="!isPasswordVisible" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>

      <button type="submit" class="btn-primary">Enviar</button>
    </form>
  </section>

  <section class="bottom">
      <p class="bottom__question">¿No tienes una cuenta?</p>
      <RouterLink to="/register" class="bottom__link">Regístrate</RouterLink>
  </section>
</template>

<style>

a{
  text-decoration: none;
}

</style>