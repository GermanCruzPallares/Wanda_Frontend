<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleClose">
        <div class="modal-content" @click.stop>
          <!-- Botón cerrar -->
          <button class="modal-close" @click="handleClose">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>

          <!-- Sección: Añadir usuarios -->
          <section class="modal-section">
            <h2 class="section-title">| Añadir usuarios a la cuenta conjunta</h2>
            <p class="section-description">
              Para crear una cuenta conjunta debes añadir al menos un usuario más de Wanda.
            </p>

            <!-- Input de email -->
            <div class="input-wrapper">
              <input
                v-model="newUserEmail"
                type="email"
                placeholder="Email de usuario"
                class="email-input"
                :disabled="isValidatingEmail"
                @keyup.enter="handleAddUser"
              />
              <button 
                v-if="isValidEmail(newUserEmail) && !isValidatingEmail"
                class="input-check"
                @click="handleAddUser"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <!-- Spinner de validación -->
              <div v-if="isValidatingEmail" class="input-spinner">
                <div class="spinner"></div>
              </div>
            </div>

            <!-- Botón añadir usuario -->
            <button 
              class="add-user-btn" 
              :disabled="isValidatingEmail"
              @click="handleAddUser"
            >
              {{ isValidatingEmail ? 'Validando...' : 'Añadir usuario +' }}
            </button>
          </section>

          <!-- Sección: Usuarios de la cuenta -->
          <section class="modal-section">
            <h3 class="section-title">| Usuarios de la cuenta</h3>

            <div class="users-list">
              <!-- Usuario actual (el que crea la cuenta) -->
              <div class="user-item user-item--owner">
                <img 
                  :src="getAvatarUrl(currentUser.email)" 
                  :alt="currentUser.name"
                  class="user-avatar"
                />
                <span class="user-name">{{ currentUser.name }} (Tú)</span>
              </div>

              <!-- Usuarios añadidos -->
              <div
                v-for="user in addedUsers"
                :key="user.email"
                class="user-item"
              >
                <img 
                  :src="getAvatarUrl(user.email)" 
                  :alt="user.name"
                  class="user-avatar"
                />
                <span class="user-name">{{ user.name }}</span>
                <button 
                  class="remove-user-btn"
                  @click="handleRemoveUser(user.email)"
                  title="Eliminar usuario"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Mensaje de ayuda -->
            <p v-if="addedUsers.length === 0" class="help-text">
              Añade al menos un usuario más para crear la cuenta conjunta
            </p>
          </section>

          <!-- Sección: Nombre de la cuenta -->
          <section class="modal-section">
            <h3 class="section-title">| Nombre de la cuenta</h3>

            <div class="input-wrapper">
              <input
                v-model="accountName"
                type="text"
                placeholder="Ej: Casa Ana y Juan"
                class="account-name-input"
              />
              <button 
                v-if="accountName.length > 0"
                class="input-check"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </section>

          <!-- Botón crear cuenta -->
          <button 
            class="create-account-btn"
            :disabled="!canCreateAccount"
            @click="handleCreateAccount"
          >
            Crear cuenta
          </button>

          <!-- Mensaje de error/validación -->
          <p v-if="!canCreateAccount && (addedUsers.length > 0 || accountName.length > 0)" class="validation-message">
            {{ validationMessage }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/UserStore';
import type { User } from '@/types/models';

interface Props {
  isOpen: boolean;
  currentUser: User;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  close: [];
  createAccount: [accountName: string, userEmails: string[]];
}>();

// ✅ Usar el store de Pinia
const userStore = useUserStore();

const newUserEmail = ref('');
const accountName = ref('');
const addedUsers = ref<User[]>([]);
const isValidatingEmail = ref(false);

// Validar email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Verificar si se puede crear la cuenta
const canCreateAccount = computed(() => {
  return addedUsers.value.length >= 1 && accountName.value.trim().length > 0;
});

// Mensaje de validación
const validationMessage = computed(() => {
  if (addedUsers.value.length === 0) {
    return 'Debes añadir al menos un usuario más';
  }
  if (accountName.value.trim().length === 0) {
    return 'Debes introducir un nombre para la cuenta';
  }
  return '';
});

// ✅ Añadir usuario con validación desde el store
const handleAddUser = async () => {
  if (!isValidEmail(newUserEmail.value)) {
    alert('Por favor, introduce un email válido');
    return;
  }

  // Verificar si es el usuario actual
  if (newUserEmail.value.toLowerCase() === props.currentUser.email.toLowerCase()) {
    alert('No puedes añadirte a ti mismo. Ya eres miembro de la cuenta.');
    newUserEmail.value = '';
    return;
  }

  // Verificar si el usuario ya está añadido
  const alreadyAdded = addedUsers.value.some(
    u => u.email.toLowerCase() === newUserEmail.value.toLowerCase()
  );
  if (alreadyAdded) {
    alert('Este usuario ya está añadido');
    newUserEmail.value = '';
    return;
  }

  // ✅ Validar usando el store
  isValidatingEmail.value = true;
  const user = await userStore.checkUserExists(newUserEmail.value);
  isValidatingEmail.value = false;
  
  if (!user) {
    alert('Este usuario no está registrado en Wanda');
    return;
  }

  addedUsers.value.push(user);
  newUserEmail.value = '';
};

// Eliminar usuario
const handleRemoveUser = (email: string) => {
  addedUsers.value = addedUsers.value.filter(u => u.email !== email);
};

// Crear cuenta
const handleCreateAccount = () => {
  if (!canCreateAccount.value) return;

  // Enviar solo los emails al backend (incluye al usuario actual)
  const userEmails = [
    props.currentUser.email,
    ...addedUsers.value.map(u => u.email)
  ];
  
  emit('createAccount', accountName.value, userEmails);
  handleClose();
};

// Cerrar modal
const handleClose = () => {
  // Limpiar formulario
  newUserEmail.value = '';
  accountName.value = '';
  addedUsers.value = [];
  
  emit('close');
};

// Generar avatar desde el email
const getAvatarUrl = (email: string): string => {
  return `https://i.pravatar.cc/150?u=${email}`;
};
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background-color: $background-principal;
  border-radius: $card-border-radius;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px 24px;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  cursor: pointer;
  color: $color-text-gray;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color $transition-speed $transition-ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.modal-section {
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 24px;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: $color-text;
  margin: 0 0 8px 0;
}

.section-description {
  font-size: 13px;
  color: $color-text-gray;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.input-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.email-input,
.account-name-input {
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 1px solid #e5e5e5;
  border-radius: $card-border-radius;
  font-size: 14px;
  color: $color-text;
  background-color: $color-white;
  transition: border-color $transition-speed $transition-ease;

  &:focus {
    outline: none;
    border-color: $color-text;
  }

  &::placeholder {
    color: $color-text-gray;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
}

.input-check,
.input-spinner {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.input-check {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e0e0e0;
  border-top-color: $color-text;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.add-user-btn {
  width: 100%;
  padding: 14px;
  background-color: $color-text;
  color: $color-white;
  border: none;
  border-radius: $card-border-radius;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity $transition-speed $transition-ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background-color: $section-bg-secondary;
  border-radius: $card-border-radius;
  position: relative;

  &--owner {
    background-color: rgba(66, 133, 244, 0.1);
    border: 1px solid rgba(66, 133, 244, 0.2);
  }
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: $color-text;
  flex: 1;
}

.remove-user-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: $color-text-gray;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color $transition-speed $transition-ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: $color-danger;
  }
}

.help-text {
  font-size: 12px;
  color: $color-text-gray;
  margin: 12px 0 0 0;
  text-align: center;
  font-style: italic;
}

.create-account-btn {
  width: 100%;
  padding: 14px;
  background-color: $color-text;
  color: $color-white;
  border: none;
  border-radius: $card-border-radius;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity $transition-speed $transition-ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:active:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.validation-message {
  font-size: 12px;
  color: $color-danger;
  margin: 12px 0 0 0;
  text-align: center;
}

// Animaciones
.modal-enter-active,
.modal-leave-active {
  transition: opacity $transition-speed $transition-ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform $transition-speed $transition-ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>