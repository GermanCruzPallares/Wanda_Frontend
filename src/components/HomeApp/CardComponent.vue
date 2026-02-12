<template>
  <div class="dashboard-card">
    <div class="dashboard-card__header">
      <h2 class="dashboard-card__title">{{ greeting }}</h2>
      <button class="dashboard-card__edit-btn" @click="handleEdit">
        Editar
      </button>
    </div>
    
    <!-- Estado de carga -->
    <div v-if="isLoading" class="dashboard-card__loading">
      <p>Cargando...</p>
    </div>

    <!-- Contenido -->
    <template v-else>
      <div class="dashboard-card__balance">
        {{ formattedBalance }}
      </div>
      
      <div class="dashboard-card__stats">
        <div class="stat">
          <div class="stat__labels">
            <div class="stat__label">Gasto mensual</div>
            <div class="stat__label">Ingreso mensual</div>
          </div>
          <div class="stat__bar stat__bar--expense">
            <div 
              class="stat__bar-fill stat__bar-fill--expense" 
              :style="{ width: expensePercentage + '%' }"
            ></div>
          </div>
          <div class="stat__amounts">
            <div class="stat__amount stat__amount--expense">{{ formattedMonthlyExpense }}</div>
            <div class="stat__amount stat__amount--income">{{ formattedMonthlyIncome }}</div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import type { Account } from '@/types/models';

interface Props {
  accountId?: number;
  userName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  userName: 'Clara'
});

const emit = defineEmits<{
  edit: [];
  accountLoaded: [account: Account];
}>();

// ✅ Estado local - guardamos la cuenta completa
const account = ref<Account | null>(null);
const isLoading = ref(false);

// ✅ Simular llamada GET /api/accounts/{id}
const fetchAccount = async (accountId: number) => {
  console.log(`📡 CardComponent: Simulando llamada GET /api/accounts/${accountId}`);
  
  isLoading.value = true;
  
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // TODO: En producción, esto sería:
  // const response = await fetch(`/api/accounts/${accountId}`);
  // const accountData = await response.json();
  
  // Por ahora, datos simulados
  const mockAccounts: Record<number, Account> = {
    1: {
      account_id: 1,
      name: 'Clara',
      account_type: 'personal',
      amount: 13789.37,
      weekly_budget: 200,
      monthly_budget: 2000,
      account_picture_url: 'https://i.pravatar.cc/150?img=5',
      creation_date: new Date()
    },
    2: {
      account_id: 2,
      name: 'Cuenta Conjunta',
      account_type: 'joint',
      amount: 25600.50,
      weekly_budget: 300,
      monthly_budget: 3500,
      account_picture_url: 'https://i.pravatar.cc/150?img=2',
      creation_date: new Date()
    },
    3: {
      account_id: 3,
      name: 'Ahorros',
      account_type: 'personal',
      amount: 8430.20,
      weekly_budget: 150,
      monthly_budget: 1500,
      account_picture_url: 'https://i.pravatar.cc/150?img=3',
      creation_date: new Date()
    }
  };
  
  const accountData = mockAccounts[accountId];
  
  if (accountData) {
    account.value = accountData;
    isLoading.value = false;
    
    // ✅ Emitir la cuenta completa al padre
    emit('accountLoaded', accountData);
    
    console.log('✅ CardComponent: Cuenta cargada:', accountData);
  } else {
    console.error('❌ CardComponent: Cuenta no encontrada');
    isLoading.value = false;
  }
};

// ✅ Cargar cuando se monta el componente
onMounted(() => {
  if (props.accountId) {
    fetchAccount(props.accountId);
  }
});

// ✅ Recargar cuando cambia la cuenta
watch(() => props.accountId, (newAccountId) => {
  if (newAccountId) {
    console.log('🔄 CardComponent: Cuenta cambiada, recargando...');
    fetchAccount(newAccountId);
  }
});

// Computed properties
const greeting = computed(() => `Hola ${props.userName} !`);

const formattedBalance = computed(() => {
  if (!account.value) return '0,00 €';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(account.value.amount);
});

// ✅ Calculamos los gastos del mes actual basado en las transacciones
// (en producción vendría del backend o lo calcularíamos desde TransactionsHistoryComponent)
const monthlyExpense = computed(() => {
  // TODO: Esto debería calcularse desde las transacciones del mes
  // Por ahora, estimación basada en el presupuesto mensual
  if (!account.value) return 0;
  return account.value.monthly_budget * 0.6; // 60% del presupuesto como ejemplo
});

const monthlyIncome = computed(() => {
  if (!account.value) return 0;
  return account.value.monthly_budget;
});

const formattedMonthlyExpense = computed(() => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monthlyExpense.value);
});

const formattedMonthlyIncome = computed(() => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monthlyIncome.value);
});

const expensePercentage = computed(() => {
  if (monthlyIncome.value === 0) return 0;
  return Math.min((monthlyExpense.value / monthlyIncome.value) * 100, 100);
});

const handleEdit = () => {
  emit('edit');
};
</script>

<style lang="scss">
.dashboard-card {
  background-image: linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
        url(../../images/fondo.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  padding: 24px;
  margin: 16px;
  color: white;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  &__title {
    font-size: 22px;
    font-weight: 600;
    margin: 0;
  }
  
  &__edit-btn {
    background-color: rgba(255, 255, 255, 0.25);
    border: none;
    border-radius: 8px;
    color: white;
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.35);
    }
    
    &:active {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  &__loading {
    min-height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
  }
  
  &__balance {
    font-size: 25px;
    margin-bottom: 32px;
    letter-spacing: -0.5px;
  }
  
  &__stats {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
}

.stat {
  &__labels {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  
  &__label {
    font-size: 13px;
    opacity: 0.95;
    font-weight: 400;
  }
  
  &__bar {
    height: 6px;
    border-radius: 3px;
    margin-bottom: 6px;
    overflow: hidden;
    
    &--expense {
      background-color: rgba(255, 255, 255, 0.25);
    }
    
    &--income {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
  
  &__bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s ease;
    
    &--expense {
      background: #F70D0D;
    }
  }
  
  &__amounts {
    display: flex;
    justify-content: space-between;
  }
  
  &__amount {
    font-size: 14px;
    font-weight: 600;
    
    &--expense {
      color: #F70D0D;
    }
    
    &--income {
      color: #4a8659;
    }
  }
}
</style>