<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import { useAccountStore } from '@/stores/AccountStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import AccountSwitcherModal from '@/components/Modals/AccountSwitcherModal.vue';

// ✅ IMPORTANTE: Mantener las props aunque no las usemos directamente
// HomeView las pasa para mantener la reactividad
interface Props {
  accountId?: number;
}

defineProps<Props>();

const userStore = useUserStore();
const accountStore = useAccountStore();

const isAccountSwitcherOpen = ref(false);

// ✅ Avatar reactivo desde el store
const avatarSrc = computed(() => {
  const account = userStore.activeAccount;
  if (!account) return getAvatarDataUrl('personal');
  
  if (account.account_picture_url) {
    return account.account_picture_url;
  }
  
  return getAvatarDataUrl(account.account_type || 'personal');
});

const openAccountSwitcher = () => {
  console.log('🖱️ Opening account switcher');
  isAccountSwitcherOpen.value = true;
};

const closeAccountSwitcher = () => {
  console.log('❌ Closing account switcher');
  isAccountSwitcherOpen.value = false;
};

const handleSelectAccount = (accountId: number) => {
  console.log('🔄 Account selected:', accountId);
  userStore.setActiveAccount(accountId);
  closeAccountSwitcher();
};

/**
 * ✅ Manejar creación de cuenta conjunta y activarla automáticamente
 */
const handleCreateJointAccount = async (accountName: string, userIds: number[]) => {
  console.log('➕ Creando cuenta conjunta:', accountName, userIds);
  
  try {
    await accountStore.createJointAccount({
      name: accountName,
      userIds: userIds
    });
    
    // ✅ Refrescar cuentas y establecer la nueva como activa
    await userStore.refreshAccounts(true);
    
    closeAccountSwitcher();
    
    console.log('✅ Cuenta conjunta creada y activada');
    
  } catch (error) {
    console.error('❌ Error creando cuenta conjunta:', error);
    alert('Error al crear la cuenta. Por favor, intenta de nuevo.');
  }
};
</script>

<template>
  <div class="header-nav">
    <div class="header-nav__logo">
      <img src="../../images/OscuroReducido.png" alt="Logo" class="logo-image" />
    </div>

    <!-- Estado de carga -->
    <div v-if="isLoading" class="header-nav__avatar header-nav__avatar--loading">
      <div class="skeleton-avatar"></div>
    </div>

    <!-- Avatar cargado -->
    <div v-else class="header-nav__avatar">
      <img
        :src="account?.account_picture_url || 'https://i.pravatar.cc/150?img=5'"
        alt="User avatar"
        class="avatar-image"
        @click="openAccountSwitcher"
      />
    </div>

    <!-- Modal -->
    <AccountSwitcherModal
      v-if="userStore.currentUser"
      :is-open="isAccountSwitcherOpen"
      :user-id="userStore.userId"
      :active-account-id="userStore.activeAccountId"
      :current-user="userStore.currentUser"
      @close="closeAccountSwitcher"
      @select-account="handleSelectAccount"
      @create-account="handleCreateJointAccount"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Account } from '@/types/models'

interface Props {
  accountId?: number // ✅ Solo necesita el ID
}

const props = defineProps<Props>()

const emit = defineEmits<{
  avatarClick: []
  accountLoaded: [account: Account]
}>()

// ✅ Estado local
const account = ref<Account | null>(null)
const isLoading = ref(false)

// ✅ Simular llamada GET /api/accounts/{id}
const fetchAccount = async (accountId: number) => {
  console.log(`📡 TopNav: Simulando llamada GET /api/accounts/${accountId}`)

  isLoading.value = true

  await new Promise((resolve) => setTimeout(resolve, 300))

  const mockAccounts: Record<number, Account> = {
    1: {
      account_id: 1,
      name: 'Clara',
      account_type: 'personal',
      amount: 13789.37,
      weekly_budget: 200,
      monthly_budget: 2000,
      account_picture_url: 'https://i.pravatar.cc/150?img=5',
      creation_date: new Date(),
    },
    2: {
      account_id: 2,
      name: 'Cuenta Conjunta',
      account_type: 'joint',
      amount: 25600.5,
      weekly_budget: 300,
      monthly_budget: 3500,
      account_picture_url: 'https://i.pravatar.cc/150?img=2',
      creation_date: new Date(),
    },
    3: {
      account_id: 3,
      name: 'Ahorros',
      account_type: 'personal',
      amount: 8430.2,
      weekly_budget: 150,
      monthly_budget: 1500,
      account_picture_url: 'https://i.pravatar.cc/150?img=3',
      creation_date: new Date(),
    },
  }

  const accountData = mockAccounts[accountId]

  if (accountData) {
    account.value = accountData
    isLoading.value = false

    emit('accountLoaded', accountData)

    console.log('✅ TopNav: Cuenta cargada:', accountData)
  } else {
    console.error('❌ TopNav: Cuenta no encontrada')
    isLoading.value = false
  }
}

// ✅ Cargar cuando se monta
onMounted(() => {
  if (props.accountId) {
    fetchAccount(props.accountId)
  }
})

// ✅ Recargar cuando cambia la cuenta
watch(
  () => props.accountId,
  (newAccountId) => {
    if (newAccountId) {
      console.log('🔄 TopNav: Cuenta cambiada, recargando...')
      fetchAccount(newAccountId)
    }
  },
)

const handleAvatarClick = () => {
  emit('avatarClick')
}
</script>

<style scoped lang="scss">
.header-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  box-sizing: border-box;
  background-color: #e5e5e5;
  padding: 20px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);

  &__logo {
    .logo-image {
      width: 40px;
      height: 40px;
      display: block;
      border-radius: 8px;
    }
  }

  &__avatar {
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }

    &--loading {
      cursor: default;

      &:hover {
        transform: none;
      }
    }

    .avatar-image {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
      display: block;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

// ✅ Estado de carga
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
@media (min-width: 768px) {
  .header-nav {
    display: none;
  }
}
</style>
