<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';

const router = useRouter();
const userStore = useUserStore();

const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const acceptTerms = ref(false);
const acceptPrivacy = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleSubmit = async (e: Event) => {
  e.preventDefault();
  
  // Validación
  if (!name.value || !email.value || !password.value) {
    errorMessage.value = 'Por favor, completa todos los campos';
    return;
  }

  if (!acceptTerms.value || !acceptPrivacy.value) {
    errorMessage.value = 'Debes aceptar los términos y la política de privacidad';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    await userStore.register({
      name: name.value,
      email: email.value,
      password: password.value
    });

    console.log('✅ Registro exitoso');
    
    // Redirigir a la home
    router.push('/home');
  } catch (error: any) {
    console.error('❌ Error en registro:', error);
    errorMessage.value = error.message || 'Error al registrarse. Por favor, intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="card card__sign">
    <header class="card__header">
      <h3 class="card__subtitle">¡ Hola !</h3>
      <h2 class="card__title">Empecemos</h2>
    </header>

    <form class="register-form" @submit="handleSubmit">
      <!-- Mensaje de error -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="form-group">
        <div class="form-group__field">
          <span class="form-group__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </span>
          <input 
            type="text" 
            v-model="name"
            class="form-group__input" 
            placeholder="Nombre" 
            required 
            :disabled="isLoading"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__field">
          <span class="form-group__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>
          </span>
          <input 
            type="email" 
            v-model="email"
            class="form-group__input" 
            placeholder="Correo electrónico" 
            required 
            :disabled="isLoading"
          />
        </div>
      </div>

      <div class="form-group">
        <div class="form-group__field" style="position: relative">
          <span class="form-group__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
              />
            </svg>
          </span>

          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            id="password-input"
            class="form-group__input"
            placeholder="Contraseña"
            required
            :disabled="isLoading"
          />

          <button 
            type="button" 
            id="toggle-password" 
            class="form-group__toggle-btn"
            @click="togglePasswordVisibility"
          >
            <svg
              id="eye-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
              <line v-if="showPassword" x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          </button>
        </div>
      </div>

      <div class="form-group">
        <label class="form-group__checkbox-container">
          <input 
            type="checkbox" 
            v-model="acceptTerms"
            class="form-group__checkbox" 
            required 
            :disabled="isLoading"
          />
          <span class="form-group__checkbox-text">
            He leido y acepto los
            <a href="#" class="form-group__checkbox-link">Términos y Condiciones</a>
          </span>
        </label>

        <label class="form-group__checkbox-container">
          <input 
            type="checkbox" 
            v-model="acceptPrivacy"
            class="form-group__checkbox" 
            required 
            :disabled="isLoading"
          />
          <span class="form-group__checkbox-text">
            He leido y acepto la
            <a href="#" class="form-group__checkbox-link">Política de Privacidad</a>
          </span>
        </label>
      </div>

      <button type="submit" class="btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Registrando...' : 'Enviar' }}
      </button>
    </form>
  </section>

   <section class="bottom">
      <p class="bottom__question">¿Ya tienes una cuenta?</p>
      <RouterLink to="/login"><a href="./login.html" class="bottom__link">Inicia Sesión</a></RouterLink>
    </section>
</template>

<style scoped lang="scss">
.error-message {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid #f44336;
  padding: 12px 16px;
  border-radius: 8px;
  color: #c41e3a;
  font-size: 14px;
  margin-bottom: 1rem;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-group__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>