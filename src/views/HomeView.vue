<script setup lang="ts">
import { ref } from 'vue';
import BottomNav from '@/components/BottomNav.vue';
import BalanceComponent from '@/components/HomeApp/BalanceComponent.vue';
import CardComponent from '@/components/HomeApp/CardComponent.vue';
import ObjectivesComponent from '@/components/HomeApp/ObjectivesComponent.vue';
import TransactionsHistoryComponent from '@/components/HomeApp/TransactionsHistoryComponent.vue';
import TopNav from '@/components/TopNav.vue';
import AccountSwitcherModal from '@/components/AccountSwitcherModal.vue';
import type { Account } from '@/components/TopNav.vue';
import type { Transaction } from '@/components/HomeApp/TransactionsHistoryComponent.vue';

const getCurrentDayOfWeek = (): number => {
  const today = new Date();
  const day = today.getDay(); 
  return day === 0 ? 6 : day - 1;
};

const currentDay = getCurrentDayOfWeek();

const objectives = ref([
  {
    id: '1',
    name: 'Coche nuevo',
    currentAmount: 7000,
    targetAmount: 10000,
    progress: 70
  },
  {
    id: '2',
    name: 'Entrada Casa',
    currentAmount: 3756,
    targetAmount: 20000,
    progress: 20
  }
]);

// Transacciones de ejemplo (esto vendrá del backend)


// Estado del modal de cuentas
const isAccountModalOpen = ref(false);

const accounts = ref<Account[]>([
  {
    id: '1',
    name: 'Clara',
    avatar: 'https://i.pravatar.cc/150?img=5',
    isActive: true
  },
]);

const handleAvatarClick = () => {
  isAccountModalOpen.value = true;
};

const handleCloseModal = () => {
  isAccountModalOpen.value = false;
};

const handleSelectAccount = (accountId: string) => {
  accounts.value = accounts.value.map(acc => ({
    ...acc,
    isActive: acc.id === accountId
  }));
  console.log('Cuenta seleccionada:', accountId);
};

const handleAddAccount = () => {
  console.log('Añadir nueva cuenta');
};

const handleAddObjective = () => {
  console.log('Añadir objetivo');
};

const handleShowInfo = (id: string) => {
  console.log('Mostrar info del objetivo:', id);
};

const handleTransactionClick = (transactionId: string) => {
  console.log('Transacción clickeada:', transactionId);
  
};

const handleLoadMore = () => {
  console.log('Cargar más transacciones');
 
};


const transactions = ref<Transaction[]>([
  {
    transaction_id: 1,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Alimentación',
    amount: 54.15,
    transaction_type: 'expense',
    concept: 'Mercadona',
    transaction_date: new Date(2026, 0, 2),
    isRecurring: true,
    frequency: 'weekly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 2)
  },
  {
    transaction_id: 2,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Alimentación',
    amount: 54.15,
    transaction_type: 'expense',
    concept: 'Mercadona',
    transaction_date: new Date(2026, 0, 2),
    isRecurring: true,
    frequency: 'weekly',
    end_date: null,
    split_type: 'none',
    last_execution_date: null
  },
  {
    transaction_id: 3,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Salario',
    amount: 2500.00,
    transaction_type: 'income',
    concept: 'Nómina mensual',
    transaction_date: new Date(2026, 0, 1),
    isRecurring: true,
    frequency: 'monthly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 1)
  },
  {
    transaction_id: 4,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Transporte',
    amount: 45.50,
    transaction_type: 'expense',
    concept: 'Gasolina',
    transaction_date: new Date(2026, 0, 1),
    isRecurring: false,
    frequency: null,
    end_date: null,
    split_type: 'none',
    last_execution_date: null
  },
{
    transaction_id: 5,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Vivienda',
    amount: 850.00,
    transaction_type: 'expense',
    concept: 'Alquiler Enero',
    transaction_date: new Date(2026, 0, 1),
    isRecurring: true,
    frequency: 'monthly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 1)
  },
  {
    transaction_id: 6,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Suscripciones',
    amount: 14.99,
    transaction_type: 'expense',
    concept: 'Netflix',
    transaction_date: new Date(2026, 0, 3),
    isRecurring: true,
    frequency: 'monthly',
    end_date: null,
    split_type: 'none',
    last_execution_date: new Date(2026, 0, 3)
  },
  {
    transaction_id: 7,
    account_id: 1,
    user_id: 1,
    objective_id: 0,
    category: 'Ocio',
    amount: 32.40,
    transaction_type: 'expense',
    concept: 'Cine y Palomitas',
    transaction_date: new Date(2026, 0, 4),
    isRecurring: false,
    frequency: null,
    end_date: null,
    split_type: 'none',
    last_execution_date: null
  },  
]);
  

</script>

<template>
  <TopNav 
    :accounts="accounts" 
    @avatar-click="handleAvatarClick"
  />
  
  <main class="home-content">
    <CardComponent></CardComponent>
    
    <BalanceComponent
      :weekly-budget="200"
      :current-week-expenses="80"
      :today-day-of-week="currentDay"
    ></BalanceComponent>
    
    <ObjectivesComponent
      :objectives="objectives"
      @add-objective="handleAddObjective"
      @show-info="handleShowInfo"
    ></ObjectivesComponent>

    <TransactionsHistoryComponent
      :transactions="transactions"
      :initial-limit="5"
      :load-more-increment="10"
      @load-more="handleLoadMore"
    ></TransactionsHistoryComponent>
  </main>
  
  <BottomNav></BottomNav>

  <AccountSwitcherModal
    :is-open="isAccountModalOpen"
    :accounts="accounts"
    @close="handleCloseModal"
    @select-account="handleSelectAccount"
    @add-account="handleAddAccount"
  />
</template>

<style scoped>
.home-content {
  padding-top: 100px;
  padding-bottom: 80px;
}
</style>