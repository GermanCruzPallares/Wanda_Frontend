<template>
  <div v-if="!isLoading">
    <SectionTitle title="| Historial" />

    <section class="transactions-history">
      <div
        v-for="group in displayedTransactions"
        :key="group.date"
        class="transaction-group"
      >
        <div class="transaction-group__date">{{ group.formattedDate }}</div>

        <div class="transaction-list">
          <div
            v-for="transaction in group.transactions"
            :key="transaction.transaction_id"
            class="transaction-item"
            @click="handleTransactionClick(transaction.transaction_id)"
          >
            <!-- Icono de categoría + avatares superpuestos en conjunta -->
            <div class="transaction-item__icon-wrap">
              <div class="transaction-item__icon">
                <component :is="getCategoryIcon(transaction.category)" />
              </div>

              <div v-if="isJoint" class="transaction-item__user-avatars">
                <!-- Divided: un avatar por participante en los splits -->
                <template v-if="transaction.split_type === 'divided'">
                  <img
                    v-for="split in getSplitsForTransaction(transaction.transaction_id)"
                    :key="split.user_id"
                    :src="getMemberAvatar(split.user_id)"
                    :alt="getMemberName(split.user_id)"
                    class="transaction-item__user-avatar"
                  />
                  <!-- También el que pagó -->
                  <img
                    :src="getMemberAvatar(transaction.user_id)"
                    :alt="getMemberName(transaction.user_id)"
                    class="transaction-item__user-avatar"
                  />
                </template>
                <!-- Individual / contribution: solo quien hizo la transacción -->
                <img
                  v-else
                  :src="getMemberAvatar(transaction.user_id)"
                  :alt="getMemberName(transaction.user_id)"
                  class="transaction-item__user-avatar"
                />
              </div>
            </div>

            <div class="transaction-item__info">
              <h4 class="transaction-item__title">{{ transaction.category }}</h4>
              <p class="transaction-item__description">{{ getDescription(transaction) }}</p>

              <!-- Nombres de participantes solo en cuenta conjunta -->
              <p v-if="isJoint" class="transaction-item__user-name">
                <template v-if="transaction.split_type === 'divided'">
                  {{ getDividedParticipantNames(transaction) }}
                </template>
                <template v-else>
                  {{ getMemberName(transaction.user_id) }}
                </template>
              </p>
            </div>

            <div class="transaction-item__right">
              <span
                class="transaction-item__amount"
                :class="{
                  'transaction-item__amount--negative': transaction.transaction_type === 'expense' || transaction.transaction_type === 'saving',
                  'transaction-item__amount--positive': transaction.transaction_type === 'income'
                }"
              >
                {{ formatAmount(transaction.amount, transaction.transaction_type) }}
              </span>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="transaction-item__arrow">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div v-if="transactions.length === 0" class="empty-state">
        <p>No hay transacciones registradas</p>
      </div>

      <button v-if="canLoadMore" class="load-more-btn" @click="loadMore">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M19 9l-7 7-7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Ver más
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/TransactionStore';
import { useTransactionSplitStore } from '@/stores/TransactionSplitStore';
import { useAccountStore } from '@/stores/AccountStore';
import { useUserStore } from '@/stores/UserStore';
import { getAvatarDataUrl } from '@/components/icons/AvatarIcons';
import SectionTitle from '@/components/SectionTitle.vue';
import { getCategoryIcon } from '@/components/icons/CategoryIcons';
import type { Transaction, TransactionSplit, User } from '@/types/models';

// ==================== TIPOS ====================

interface TransactionGroup {
  date: string;
  formattedDate: string;
  transactions: Transaction[];
}

// ==================== PROPS ====================

interface Props {
  accountId?: number;
  accountType?: 'personal' | 'joint';
  initialLimit?: number;
  loadMoreIncrement?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialLimit: 5,
  loadMoreIncrement: 10
});

const emit = defineEmits<{
  transactionClick: [transactionId: number];
  transactionsLoaded: [transactions: Transaction[]];
}>();

// ==================== STORES ====================

const transactionStore = useTransactionStore();
const splitStore = useTransactionSplitStore();
const accountStore = useAccountStore();
const userStore = useUserStore();

// ==================== ESTADO ====================

const transactions = ref<Transaction[]>([]);
const members = ref<User[]>([]);
const splits = ref<TransactionSplit[]>([]);
const isLoading = ref(false);
const displayLimit = ref(props.initialLimit);

const isJoint = computed(() => props.accountType === 'joint');

// ==================== CARGA ====================

const loadTransactions = async (accountId: number) => {
  isLoading.value = true;
  transactions.value = await transactionStore.fetchTransactions(accountId);
  emit('transactionsLoaded', transactions.value);
  isLoading.value = false;
};

const loadMembers = async (accountId: number) => {
  if (!isJoint.value) return;
  members.value = await accountStore.fetchAccountMembers(accountId);
};

// Carga todos los splits del usuario actual de una vez
// Luego los cruza con las transacciones por transaction_id (sin N+1 queries)
const loadSplits = async () => {
  if (!isJoint.value) return;
  const userId = userStore.currentUser?.user_id;
  if (!userId) return;
  splits.value = await splitStore.fetchUserSplits(userId);
};

onMounted(() => {
  if (props.accountId) {
    loadTransactions(props.accountId);
    loadMembers(props.accountId);
    loadSplits();
  }
});

watch(() => props.accountId, (newId) => {
  if (newId) {
    displayLimit.value = props.initialLimit;
    loadTransactions(newId);
    loadMembers(newId);
    loadSplits();
  }
});

watch(() => props.accountType, () => {
  if (props.accountId) {
    loadMembers(props.accountId);
    loadSplits();
  }
});

// ==================== SPLITS ====================

// Devuelve los splits asociados a una transacción divided
// Los splits solo incluyen a los deudores (quien NO pagó)
const getSplitsForTransaction = (transactionId: number): TransactionSplit[] => {
  return splits.value.filter(s => s.transaction_id === transactionId);
};

// Nombres de todos los participantes en un gasto divided:
// quien pagó + los deudores de los splits
const getDividedParticipantNames = (transaction: Transaction): string => {
  const txSplits = getSplitsForTransaction(transaction.transaction_id);
  const debtorIds = txSplits.map(s => s.user_id);
  const allIds = [...new Set([transaction.user_id, ...debtorIds])];
  return allIds.map(id => getMemberName(id)).filter(Boolean).join(', ');
};

// ==================== MIEMBROS ====================

const getMemberAvatar = (_userId: number): string => getAvatarDataUrl('personal');

const getMemberName = (userId: number): string => {
  return members.value.find(m => m.user_id === userId)?.name ?? '';
};

// ==================== HELPERS ====================

const parseDate = (date: Date | string): Date =>
  typeof date === 'string' ? new Date(date) : date;

const getDescription = (transaction: Transaction): string => {
  let desc = transaction.concept || '';
  if (transaction.isRecurring && transaction.frequency) {
    const labels: Record<string, string> = { weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };
    const label = labels[transaction.frequency] ?? transaction.frequency;
    desc += desc ? ` * ${label}` : label;
  }
  return desc;
};

const groupedTransactions = computed<TransactionGroup[]>(() => {
  const groups = new Map<string, Transaction[]>();

  const sorted = [...transactions.value].sort(
    (a, b) => parseDate(b.transaction_date).getTime() - parseDate(a.transaction_date).getTime()
  );

  sorted.forEach(t => {
    const dateKey = parseDate(t.transaction_date).toISOString().split('T')[0] ?? '';
    if (!dateKey) return;
    if (!groups.has(dateKey)) groups.set(dateKey, []);
    groups.get(dateKey)!.push(t);
  });

  return Array.from(groups.entries()).map(([date, txs]) => ({
    date,
    formattedDate: formatDate(new Date(date)),
    transactions: txs
  }));
});

const displayedTransactions = computed(() => {
  let count = 0;
  const result: TransactionGroup[] = [];

  for (const group of groupedTransactions.value) {
    if (count >= displayLimit.value) break;
    const slots = displayLimit.value - count;
    const toShow = group.transactions.slice(0, slots);
    if (toShow.length > 0) {
      result.push({ ...group, transactions: toShow });
      count += toShow.length;
    }
  }
  return result;
});

const canLoadMore = computed(() => displayLimit.value < transactions.value.length);

const formatDate = (date: Date): string => {
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${date.getDate().toString().padStart(2,'0')} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatAmount = (amount: number, type: string): string => {
  const f = amount.toFixed(2).replace('.', ',');
  return type === 'income' ? `+${f} €` : `-${f} €`;
};

const loadMore = () => { displayLimit.value += props.loadMoreIncrement; };
const handleTransactionClick = (id: number) => emit('transactionClick', id);
</script>

<style scoped lang="scss">
@import '@/styles/base/variables.scss';

.transactions-history {
  padding: 0 $section-margin-horizontal 1.5rem;
}

.transaction-group {
  margin-bottom: 1.5rem;

  &__date {
    font-size: 12px;
    color: $color-text-gray;
    font-weight: 500;
    margin-bottom: 0.9rem;
    line-height: 3em;
    border-bottom: 1px solid $color-text-gray;
  }
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: $section-bg-primary;
  border-radius: $card-border-radius;
  padding: 25px 16px;
  cursor: pointer;
  transition: transform $transition-speed $transition-ease,
              box-shadow $transition-speed $transition-ease;

  &:hover {
    transform: translateX(2px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  }
  &:active { transform: translateX(1px); }

  &__icon-wrap {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }

  &__icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: $color-text-gray;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $color-white;
  }

  // Grupo de avatares superpuestos en esquina inferior derecha
  &__user-avatars {
    position: absolute;
    bottom: -4px;
    right: -4px;
    display: flex;
    flex-direction: row-reverse;
  }

  &__user-avatar {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid $section-bg-primary;
    margin-left: -5px;

    &:last-child { margin-left: 0; }
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: $color-text;
    margin: 0 0 4px 0;
  }

  &__description {
    font-size: 0.8rem;
    color: $color-text-gray;
    margin: 0 0 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__user-name {
    font-size: 0.75rem;
    color: $color-text-gray;
    font-weight: 500;
    margin: 0;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__amount {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    &--negative { color: $color-danger; }
    &--positive { color: $color-success; }
  }

  &__arrow {
    color: $color-text-gray;
    flex-shrink: 0;
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: $color-text-gray;
  p { margin: 0; font-size: 14px; }
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 12px;
  margin-top: 1rem;
  background-color: transparent;
  border: none;
  color: $color-text-gray;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: color $transition-speed $transition-ease;

  svg { transition: transform $transition-speed $transition-ease; }

  &:hover {
    color: $color-text;
    svg { transform: translateY(2px); }
  }
  &:active { transform: scale(0.98); }
}
</style>