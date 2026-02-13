import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Account } from '@/types/models';

export const useAccountStore = defineStore('account', () => {
  // ✅ Estado: Map para cachear cuentas
  const accounts = ref<Map<number, Account>>(new Map());

  // ✅ Obtener cuenta (con caché automático)
  const fetchAccount = async (accountId: number): Promise<Account | null> => {
    // Si ya está en caché, devolverla
    if (accounts.value.has(accountId)) {
      return accounts.value.get(accountId)!;
    }

    // TODO: Fetch real cuando tengas backend
    // const response = await fetch(`/api/accounts/${accountId}`);
    // const account = await response.json();
    // accounts.value.set(accountId, account);
    // return account;

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 400));
    
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

    const account = mockAccounts[accountId];
    
    if (account) {
      accounts.value.set(accountId, account);
      return account;
    }
    
    return null;
  };

  return {
    accounts,
    fetchAccount
  };
});