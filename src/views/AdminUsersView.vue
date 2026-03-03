<script setup lang="ts">
import AdminAsidenav from '@/components/Admin/AdminAsidenav.vue';
import AdminBottomnav from '@/components/Admin/AdminBottomnav.vue';
import TopNav from '@/components/Navs/TopNav.vue';
import CreateAdminForm from '@/components/Admin/CreateAdminForm.vue';
import SectionTitle from '@/components/SectionTitle.vue';
</script>

<template>
  <AdminAsidenav />
  <TopNav class="mobile-only" />

  <main class="admin-users">
    <section class="admin-users__section">
      <SectionTitle title="| Gestión de Usuarios" />
      <div class="admin-users__grid">
        <CreateAdminForm />
        <!-- Aquí irán los otros dos componentes -->
      </div>
    </section>
  </main>

  <AdminBottomnav class="mobile-only" />
</template>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}

.admin-users {
  margin-left: $aside-nav-width;
  min-height: 100vh;
  background-color: $background-principal;
  padding: 24px;

  @media (max-width: $breakpoint-mobile) {
    margin-left: 0;
    padding-top: $navbar-height;
    padding-bottom: 100px;
  }

  &__section {
    max-width: 1200px;
    margin: 0 auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
    padding: 0 $section-margin-horizontal;

    @media (max-width: $breakpoint-mobile) {
      grid-template-columns: 1fr;
    }
  }
}
</style>