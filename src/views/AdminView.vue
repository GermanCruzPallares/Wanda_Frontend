<script setup lang="ts">
import AdminAsidenav from '@/components/Admin/AdminAsidenav.vue';
import AdminBottomnav from '@/components/Admin/AdminBottomnav.vue';
import TopNav from '@/components/Navs/TopNav.vue';

</script>

<template>

<AdminAsidenav></AdminAsidenav>
<TopNav 
    class="mobile-only"
/>

<AdminBottomnav class="mobile-only"></AdminBottomnav>

</template>

<style scoped lang="scss">

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>