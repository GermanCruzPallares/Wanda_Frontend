<template>
  <div class="d-flex align-center my-8">
    <v-divider color="white" class="border-opacity-50"></v-divider>
    <span class="mx-4 text-white text-caption">o continuar con</span>
    <v-divider color="white" class="border-opacity-50"></v-divider>
  </div>

  <v-btn
    block
    color="white"
    height="50"
    rounded="xl"
    class="text-capitalize text-body-2 text-black"
    flat
  >
    <template v-slot:prepend>
      <v-icon icon="mdi-google" color="#EA4335" class="mr-2"></v-icon>
    </template>
    Continua con Google
  </v-btn>
</template>

<script setup>
</script>