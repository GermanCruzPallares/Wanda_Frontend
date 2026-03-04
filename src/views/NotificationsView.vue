<template>
  <div class="notifications-page">
    <AsideNav
      :active-item="activeMenuItem"
      :account-id="activeAccount?.account_id"
      @navigate="handleNavigate"
    />

    <HeaderNav
      title="Notificaciones"
      @back="handleBack"
      class="mobile-only"
    />

    <div class="desktop-header">
      <h1 class="page-title">Notificaciones</h1>
    </div>

    <main class="notifications-content">
      <DebtNotificationsComponent
        v-if="userId"
        :user-id="userId"
      />

      <div v-else class="loading-container">
        <p>Cargando datos del usuario...</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/UserStore';
import HeaderNav from '@/components/Navs/HeaderNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import DebtNotificationsComponent from '@/components/Notifications/DebtNotificationsComponent.vue';
import type { AccountUI } from '@/types/models';

const router = useRouter();
const userStore = useUserStore();

// ==================== ESTADO UI LOCAL ====================

const activeMenuItem = ref('notificaciones');

// ==================== COMPUTED (User Store) ====================

const userId = computed(() => userStore.userId);

const accounts = computed<AccountUI[]>(() => {
  return userStore.accounts.map(account => ({
    ...account,
    isActive: account.account_id === userStore.activeAccountId
  }));
});

const activeAccount = computed(() => {
  return accounts.value.find(acc => acc.isActive);
});

// ==================== ACTIONS ====================

const handleBack = () => router.back();

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  if (itemId === 'inicio') router.push('/home');
};

// ==================== LIFECYCLE ====================

onMounted(async () => {
  if (!userStore.isAuthenticated) {
    router.push('/login');
    return;
  }

  if (!userStore.currentUser && userStore.userId) {
    try {
      await userStore.loadUserData(userStore.userId);
    } catch (error) {
      console.error('Error cargando datos:', error);
      router.push('/login');
    }
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.notifications-page {
  min-height: 100vh;
  background-color: $background-principal;
}

.desktop-header {
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-left: 240px;
    padding: 32px 32px 0;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: $color-text;
  margin: 0 0 24px 0;
}

.notifications-content {
  padding-top: 80px;
  padding-bottom: 80px;
  padding-left: $section-margin-horizontal;   
  padding-right: $section-margin-horizontal;  
  min-height: 100vh;

  @media (min-width: 768px) {
    margin-left: 240px;
    padding-top: 20px;
    padding-bottom: 40px;
    padding-left: 32px;   
    padding-right: 32px;  
  }
}

.loading-container {
  padding: 40px;
  text-align: center;
  color: $color-text-gray;
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>