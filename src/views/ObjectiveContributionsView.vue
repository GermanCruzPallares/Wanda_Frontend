<template>
  <div class="objective-contributions-page">
    <!-- AsideNav para desktop -->
    <AsideNav 
      :active-item="activeMenuItem"
      :accounts="accounts"
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
      <ObjectiveSavingsHistory
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
      :accounts="accounts"
      :current-user="currentUser"
      @close="handleCloseModal"
      @select-account="handleSelectAccount"
      @create-joint-account="handleCreateJointAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import HeaderNav from '@/components/Navs/HeaderNav.vue';
import ObjectiveSavingsHistory from '@/components/HomeApp/ContributionHistory.vue';
import BottomNav from '@/components/Navs/BottomNav.vue';
import AsideNav from '@/components/Navs/AsideNav.vue';
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue';
import type { Transaction, Objective, AccountUI, User } from '@/types/models';

const router = useRouter();
const route = useRoute();

// Obtener el ID del objetivo desde la ruta
const objectiveIdParam = computed(() => route.params.objectiveId as string);

// Convertir a número si es necesario (o null para "todos")
const initialObjectiveId = computed(() => {
  const id = objectiveIdParam.value;
  console.log('Objective ID from route:', id);
  return id && id !== 'all' ? parseInt(id) : null;
});

// Estado del menú
const activeMenuItem = ref('libro');

// Usuario actual (debería venir del sistema de autenticación)
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

// ✅ Objetivos vacíos - vendrán del hijo
const objectives = ref<Objective[]>([]);

// ✅ Transacciones vacías - vendrán del hijo
const transactions = ref<Transaction[]>([]);

// ✅ Handler para recibir transacciones
const handleTransactionsLoaded = (loadedTransactions: Transaction[]) => {
  console.log('💰 ObjectiveContributionsView: Aportaciones recibidas:', loadedTransactions.length);
  transactions.value = loadedTransactions;
};

// Cargar objetivos (podrían venir de ObjectivesComponent o hacerse aquí)
const fetchObjectives = async () => {
  console.log('📡 Cargando objetivos...');
  
  // Simulación - en producción: GET /api/accounts/{accountId}/objectives
  const mockObjectives: Objective[] = [
    {
      objective_id: 1,
      account_id: 1,
      name: 'Coche nuevo',
      target_amount: 10000,
      current_save: 7500,
      deadline: new Date(2026, 11, 31),
      objective_picture_url: ''
    },
    {
      objective_id: 2,
      account_id: 1,
      name: 'Entrada Casa',
      target_amount: 50000,
      current_save: 15000,
      deadline: new Date(2028, 5, 30),
      objective_picture_url: ''
    }
  ];
  
  objectives.value = mockObjectives;
};

// Funciones de navegación
const handleBack = () => {
  router.push('/home');
};

const handleNavigate = (itemId: string) => {
  activeMenuItem.value = itemId;
  console.log('Navegando a:', itemId);
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
  console.log('Cuenta seleccionada:', accountId);
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
  console.log('Nueva cuenta creada:', newAccount);
};

// Cargar al montar
onMounted(() => {
  console.log('Route params:', route.params);
  console.log('Initial objective ID:', initialObjectiveId.value);
  fetchObjectives();
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