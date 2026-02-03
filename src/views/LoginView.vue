<template>
  <v-app>
    <v-main class="login-background d-flex flex-column">
      <AppHeader />
      
      <v-container class="flex-grow-1 d-flex align-center justify-center">
        <v-sheet color="transparent" width="100%" max-width="400" class="px-4">
          
          <div class="text-center mb-6">
            <div class="text-white text-body-1 mb-2">¡ Bienvenido de nuevo !</div>
            <h1 class="text-white text-h4 font-weight-bold">Accede a tu cuenta</h1>
          </div>

          <LoginForm />
          
          <SocialLogin />

          <div class="text-center mt-8 text-white">
            <span class="text-body-2">¿No tienes una cuenta? </span>
            <a href="#" class="register-link text-body-2 font-weight-bold text-decoration-none">
              Regístrate
            </a>
          </div>

        </v-sheet>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import AppHeader from '../components/Header.vue'
import LoginForm from '../components/LoginForm.vue'
import SocialLogin from '../components/SocialLogin.vue'
</script>

<style scoped>
.login-background {
  background-color: #A88FA2;
}

.register-link {
  color: #EBCC6D;
}
</style>