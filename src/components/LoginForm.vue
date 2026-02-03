<template>
  <v-form @submit.prevent>
    <v-text-field
      placeholder="email o telefono"
      bg-color="white"
      variant="solo"
      flat
      hide-details
      rounded="lg"
      class="mb-4 custom-input"
    ></v-text-field>

    <v-text-field
      placeholder="Contraseña"
      bg-color="white"
      variant="solo"
      flat
      hide-details
      rounded="lg"
      type="password"
      class="mb-8 custom-input"
    ></v-text-field>

    <v-btn
      block
      color="#333333"
      height="50"
      rounded="xl"
      class="text-capitalize text-body-1 text-white"
      flat
    >
      Enviar
    </v-btn>
  </v-form>
</template>

<script setup>
</script>

<style scoped>
.custom-input :deep(.v-field) {
  border-radius: 12px;
}
</style>