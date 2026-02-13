<template>
  <div class="objective-contributions-page">
    <!-- AsideNav para desktop -->
    <AsideNav 
      :active-item="activeMenuItem"
      :account-id="activeAccount?.account_id"
      @navigate="handleNavigate"
      @avatar-click="handleAvatarClick"
    />

    <!-- Header con navegación (solo móvil) -->
    <HeaderNav 
      title="Historial de Aportaciones" 
      @back="handleBack"
      class="mobile-only"
    />

    <!-- Título para desktop -->
    <div class="desktop-header">
      <h1 class="page-title">Historial de Aportaciones</h1>
    </div>

    <!-- Contenido principal -->
    <main class="contributions-content">
      <ContributionHistory
        :account-id="activeAccount?.account_id"
        :objectives="objectives"
        :initial-selected-objective="initialObjectiveId"
        @saving-click="handleSavingClick"
        @transactions-loaded="handleTransactionsLoaded"
      />
    </main>

    <!-- Bottom Nav solo en móvil -->
    <BottomNav class="mobile-only" />

    <!-- Modal de cambio de cuenta -->
    <AccountSwitcherModal
      :is-open="isAccountModalOpen"
      :user-id="currentUser.user_id"
      :active-account-id="activeAccount?.account_id"
      :current-user="currentUser"
      @close="handleCloseModal"
      @select-account="handleSelectAccount"
      @create-joint-account="handleCreateJointAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useObjectiveStore } from '@/stores/ObjectiveStore';
import HeaderNav from '@/components/Navs/HeaderNav.vue';
import ObjectiveSavingsHistory from '@/components/HomeApp/ContributionHistory.vue';
import BottomNav from '@/components/Navs/BottomNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue';
import type { Transaction, Objective, AccountUI, User, Account } from '@/types/models';
import ContributionHistory from '@/components/HomeApp/ContributionHistory.vue';

const router = useRouter();
const route = useRoute();

// ✅ Usar el store de objetivos
const objectiveStore = useObjectiveStore();

// Obtener el ID del objetivo desde la ruta
const objectiveIdParam = computed(() => route.params.objectiveId as string);

// Convertir a número si es necesario (o null para "todos")
const initialObjectiveId = computed(() => {
  const id = objectiveIdParam.value;
  return id && id !== 'all' ? parseInt(id) : null;
});

// Estado del menú
const activeMenuItem = ref('libro');

// Usuario actual
const currentUser = ref<User>({
  user_id: 1,
  name: 'Clara',
  email: 'clara@wandaapp.com'
});

// Estado de cuentas
const accounts = ref<AccountUI[]>([
  {
    account_id: 1,
    name: 'Clara',
    account_type: 'personal',
    amount: 13789.37,
    weekly_budget: 200,
    monthly_budget: 2000,
    account_picture_url: 'https://i.pravatar.cc/150?img=5',
    creation_date: new Date(),
    isActive: true
  }
]);

const activeAccount = computed(() => {
  return accounts.value.find(acc => acc.isActive);
});

const isAccountModalOpen = ref(false);

// ✅ Objetivos - vendrán del store
const objectives = ref<Objective[]>([]);
const transactions = ref<Transaction[]>([]);

// ✅ Cargar objetivos desde el store
const loadObjectives = async (accountId: number) => {
  objectives.value = await objectiveStore.fetchObjectives(accountId);
};

// ✅ Handler para recibir transacciones del hijo
const handleTransactionsLoaded = (loadedTransactions: Transaction[]) => {
  console.log('💰 ObjectiveContributionsView: Aportaciones recibidas:', loadedTransactions.length);
  transactions.value = loadedTransactions;
};


// Funciones de navegación
const handleBack = () => {
  router.push('/home');
};

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  if (itemId === 'inicio') {
    router.push('/home');
  }
};

const handleSavingClick = (transactionId: number) => {
  console.log('Aportación clickeada:', transactionId);
  // Aquí podrías abrir un modal con detalles de la transacción
};

// Funciones de cuenta
const handleAvatarClick = () => {
  isAccountModalOpen.value = true;
};

const handleCloseModal = () => {
  isAccountModalOpen.value = false;
};

const handleSelectAccount = (accountId: number) => {
  accounts.value = accounts.value.map(acc => ({
    ...acc,
    isActive: acc.account_id === accountId
  }));
};

const handleCreateJointAccount = (accountName: string, userEmails: string[]) => {
  console.log('Crear cuenta conjunta:', accountName, userEmails);
  
  const newAccount: AccountUI = {
    account_id: accounts.value.length + 1,
    name: accountName,
    account_type: 'joint',
    amount: 0,
    weekly_budget: 0,
    monthly_budget: 0,
    account_picture_url: `https://i.pravatar.cc/150?img=${accounts.value.length + 1}`,
    creation_date: new Date(),
    isActive: false
  };
  
  accounts.value.push(newAccount);
};

// ✅ Cargar objetivos cuando se monta
onMounted(() => {
  if (activeAccount.value?.account_id) {
    loadObjectives(activeAccount.value.account_id);
  }
});

// ✅ Recargar objetivos cuando cambia la cuenta
watch(() => activeAccount.value?.account_id, (newAccountId) => {
  if (newAccountId) {
    loadObjectives(newAccountId);
  }
});
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.objective-contributions-page {
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

.contributions-content {
  padding-top: 80px;
  padding-bottom: 80px;
  min-height: 100vh;

  @media (min-width: 768px) {
    margin-left: 240px;
    padding-top: 20px;
    padding-bottom: 40px;
  }
}

.mobile-only {
  @media (min-width: 768px) {
    display: none;
  }
}
</style>