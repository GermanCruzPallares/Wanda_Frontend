<template>
  <Teleport to="body">
    <!-- Modal de selección de cuenta -->
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <Transition name="slide">
          <div v-if="isOpen" class="modal-drawer" @click.stop>
            <!-- Estado de carga -->
            <div v-if="isLoading" class="loading-state">
              <p>Cargando cuentas...</p>
            </div>

            <!-- Lista de cuentas -->
            <div v-else class="accounts-list">
              <div
                v-for="account in accounts"
                :key="account.account_id"
                class="account-item"
                :class="{ 'account-item--active': account.account_id === activeAccountId }"
                @click="handleSelectAccount(account.account_id)"
              >
                <div class="account-item__wrapper">
                  <div class="account-item__avatar">
                    <img :src="account.account_picture_url" :alt="account.name" />
                  </div>
                  <div class="account-item__info">
                    <span class="account-item__name">{{ account.name }}</span>
                  </div>
                  <div v-if="account.account_id === activeAccountId" class="account-item__check">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                      <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Separador -->
              <div class="separator"></div>

              <!-- Botón añadir cuenta -->
              <button class="add-account-btn" @click="handleAddAccount">
                <div class="add-account-btn__wrapper">
                  <div class="add-account-btn__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <span class="add-account-btn__text">Añadir cuenta conjunta</span>
                </div>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal de crear cuenta conjunta -->
  <CreateJointAccountModal
    :is-open="isJointAccountModalOpen"
    :current-user="currentUser"
    @close="handleCloseJointAccountModal"
    @create-account="handleCreateJointAccount"
  />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type { Account, User } from '@/types/models';
import CreateJointAccountModal from './CreateJointAccountModal.vue';

interface Props {
  isOpen: boolean;
  userId?: number; // ✅ Solo necesita el userId para cargar sus cuentas
  activeAccountId?: number; // ✅ Para saber cuál está activa
  currentUser: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  selectAccount: [accountId: number];
  accountsLoaded: [accounts: Account[]]; // ✅ Emite las cuentas al padre
  createJointAccount: [accountName: string, userEmails: string[]];
}>();

// ✅ Estado local
const accounts = ref<Account[]>([]);
const isLoading = ref(false);
const isJointAccountModalOpen = ref(false);

// ✅ Simular llamada GET /api/users/{userId}/accounts
const fetchUserAccounts = async (userId: number) => {
  console.log(`📡 AccountSwitcherModal: Simulando llamada GET /api/users/${userId}/accounts`);
  
  isLoading.value = true;
  
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // TODO: En producción, esto sería:
  // const response = await fetch(`/api/users/${userId}/accounts`);
  // const data = await response.json();
  
  // Simulación: Cuentas del usuario
  const mockUserAccounts: Record<number, Account[]> = {
    1: [
      {
        account_id: 1,
        name: 'Clara',
        account_type: 'personal',
        amount: 13789.37,
        weekly_budget: 200,
        monthly_budget: 2000,
        account_picture_url: 'https://i.pravatar.cc/150?img=5',
        creation_date: new Date()
      },
      {
        account_id: 2,
        name: 'Casa Clara y Juan',
        account_type: 'joint',
        amount: 5200.00,
        weekly_budget: 300,
        monthly_budget: 1500,
        account_picture_url: 'https://i.pravatar.cc/150?img=8',
        creation_date: new Date()
      }
    ]
  };
  
  const userAccounts = mockUserAccounts[userId] || [];
  
  accounts.value = userAccounts;
  isLoading.value = false;
  
  // ✅ Emitir las cuentas al padre
  emit('accountsLoaded', userAccounts);
  
  console.log('✅ AccountSwitcherModal: Cuentas cargadas:', userAccounts.length);
};

// ✅ Cargar cuando se abre el modal
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.userId && accounts.value.length === 0) {
    fetchUserAccounts(props.userId);
  }
  
  // Bloquear/desbloquear scroll
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

// ✅ Recargar si cambia el userId
watch(() => props.userId, (newUserId) => {
  if (newUserId && props.isOpen) {
    fetchUserAccounts(newUserId);
  }
});

const handleClose = () => {
  emit('close');
};

const handleSelectAccount = (accountId: number) => {
  emit('selectAccount', accountId);
  handleClose();
};

const handleAddAccount = () => {
  isJointAccountModalOpen.value = true;
};

const handleCloseJointAccountModal = () => {
  isJointAccountModalOpen.value = false;
};

const handleCreateJointAccount = (accountName: string, userEmails: string[]) => {
  emit('createJointAccount', accountName, userEmails);
  isJointAccountModalOpen.value = false;
  handleClose();
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  backdrop-filter: blur(2px);
}

.modal-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: $color-white;
  border-radius: $section-border-radius $section-border-radius 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 1002;
}

.loading-state {
  padding: 40px 20px;
  text-align: center;
  
  p {
    margin: 0;
    font-size: 14px;
    color: $color-text-gray;
  }
}

.accounts-list {
  padding: 0;
}

.account-item {
  display: flex;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: $color-white;
  padding: 16px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 70%;
    padding: 0 20px;
    margin: 0.5em 0;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__name {
    font-size: 16px;
    font-weight: 400;
    color: $color-text;
    display: block;
  }

  &__check {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.separator {
  height: 1px;
  background-color: #e5e5e5;
  margin: 0;
}

.add-account-btn {
  display: flex;
  justify-content: center;
  width: 100%;
  border: none;
  background-color: $color-white;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: $color-text;
  padding: 16px 0;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;
    max-width: 70%;
    padding: 0 20px;
    margin: 0.5em 0;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    border: 2px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: $color-text;
  }

  &__text {
    font-size: 16px;
    font-weight: 400;
    text-align: left;
    color: $color-text;
  }
}

// Animaciones
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.slide-enter-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.6, 1);
}

.slide-enter-from {
  transform: translateY(100%);
}

.slide-leave-to {
  transform: translateY(100%);
}

.slide-enter-to {
  transform: translateY(0);
}
</style>