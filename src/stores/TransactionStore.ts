import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Transaction } from '@/types/models';

export const useTransactionStore = defineStore('transaction', () => {
  // ✅ Estado: Map para cachear transacciones por accountId
  const transactionsByAccount = ref<Map<number, Transaction[]>>(new Map());

  const savingsByAccount = ref<Map<number, Transaction[]>>(new Map());

  // ✅ Obtener transacciones de una cuenta (con caché automático)
  const fetchTransactions = async (accountId: number): Promise<Transaction[]> => {
    // Si ya están en caché, devolverlas
    if (transactionsByAccount.value.has(accountId)) {
      return transactionsByAccount.value.get(accountId)!;
    }

    // TODO: Fetch real cuando tengas backend
    // const response = await fetch(`/api/accounts/${accountId}/transactions`);
    // const transactions = await response.json();
    // transactionsByAccount.value.set(accountId, transactions);
    // return transactions;

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockTransactions: Record<number, Transaction[]> = {
      1: [
        // ✅ GASTOS
        {
          transaction_id: 1,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Alimentación',
          amount: 54.15,
          transaction_type: 'expense',
          concept: 'Mercadona',
          transaction_date: new Date(2026, 1, 13, 18, 30),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 2,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Transporte',
          amount: 15.00,
          transaction_type: 'expense',
          concept: 'Uber',
          transaction_date: new Date(2026, 1, 13, 14, 15),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 3,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Compras',
          amount: 89.90,
          transaction_type: 'expense',
          concept: 'Amazon',
          transaction_date: new Date(2026, 1, 12, 16, 20),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 4,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Facturas',
          amount: 65.00,
          transaction_type: 'expense',
          concept: 'Factura luz',
          transaction_date: new Date(2026, 1, 10, 10, 0),
          isRecurring: true,
          frequency: 'monthly',
          end_date: null,
          split_type: 'individual',
          last_execution_date: new Date(2026, 1, 10, 10, 0)
        },
        {
          transaction_id: 5,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Suscripciones',
          amount: 14.99,
          transaction_type: 'expense',
          concept: 'Netflix',
          transaction_date: new Date(2026, 1, 8, 9, 0),
          isRecurring: true,
          frequency: 'monthly',
          end_date: null,
          split_type: 'individual',
          last_execution_date: new Date(2026, 1, 8, 9, 0)
        },
        {
          transaction_id: 6,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Ocio',
          amount: 32.40,
          transaction_type: 'expense',
          concept: 'Cine y palomitas',
          transaction_date: new Date(2026, 1, 7, 20, 30),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 7,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Salud',
          amount: 25.00,
          transaction_type: 'expense',
          concept: 'Farmacia',
          transaction_date: new Date(2026, 1, 5, 12, 15),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 8,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Hogar',
          amount: 850.00,
          transaction_type: 'expense',
          concept: 'Alquiler febrero',
          transaction_date: new Date(2026, 1, 1, 10, 0),
          isRecurring: true,
          frequency: 'monthly',
          end_date: null,
          split_type: 'individual',
          last_execution_date: new Date(2026, 1, 1, 10, 0)
        },
        
        // ✅ INGRESOS
        {
          transaction_id: 20,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Salario',
          amount: 2500.00,
          transaction_type: 'income',
          concept: 'Nómina febrero',
          transaction_date: new Date(2026, 1, 1, 9, 0),
          isRecurring: true,
          frequency: 'monthly',
          end_date: null,
          split_type: 'individual',
          last_execution_date: new Date(2026, 1, 1, 9, 0)
        },
        {
          transaction_id: 21,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Freelance',
          amount: 300.00,
          transaction_type: 'income',
          concept: 'Proyecto web',
          transaction_date: new Date(2026, 1, 5, 14, 30),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 22,
          account_id: 1,
          user_id: 1,
          objective_id: 0,
          category: 'Venta',
          amount: 120.00,
          transaction_type: 'income',
          concept: 'Venta muebles',
          transaction_date: new Date(2026, 1, 8, 11, 0),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        
        // ✅ AHORROS (objetivos)
        {
          transaction_id: 101,
          account_id: 1,
          user_id: 1,
          objective_id: 1,
          category: 'Ahorro',
          amount: 500,
          transaction_type: 'saving',
          concept: null,
          transaction_date: new Date(2026, 1, 10, 10, 30),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 102,
          account_id: 1,
          user_id: 1,
          objective_id: 2,
          category: 'Ahorro',
          amount: 500,
          transaction_type: 'saving',
          concept: null,
          transaction_date: new Date(2026, 1, 10, 15, 45),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 103,
          account_id: 1,
          user_id: 1,
          objective_id: 1,
          category: 'Ahorro',
          amount: 300,
          transaction_type: 'saving',
          concept: null,
          transaction_date: new Date(2026, 1, 3, 12, 0),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        }
      ],
      2: [
        {
          transaction_id: 30,
          account_id: 2,
          user_id: 1,
          objective_id: 0,
          category: 'Hogar',
          amount: 1200.00,
          transaction_type: 'expense',
          concept: 'Alquiler piso conjunto',
          transaction_date: new Date(2026, 1, 1, 10, 0),
          isRecurring: true,
          frequency: 'monthly',
          end_date: null,
          split_type: 'individual',
          last_execution_date: new Date(2026, 1, 1, 10, 0)
        },
        {
          transaction_id: 31,
          account_id: 2,
          user_id: 1,
          objective_id: 0,
          category: 'Alimentación',
          amount: 156.80,
          transaction_type: 'expense',
          concept: 'Compra semanal',
          transaction_date: new Date(2026, 1, 8, 17, 0),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        }
      ]
    };

    const transactions = mockTransactions[accountId] || [];
    
    transactionsByAccount.value.set(accountId, transactions);
    
    return transactions;
  };

    const fetchSavings = async (accountId: number): Promise<Transaction[]> => {
    if (savingsByAccount.value.has(accountId)) {
      return savingsByAccount.value.get(accountId)!;
    }

    // TODO: Fetch real cuando tengas backend
    // const response = await fetch(`/api/accounts/${accountId}/transactions?type=saving`);
    // const savings = await response.json();
    // savingsByAccount.value.set(accountId, savings);
    // return savings;

    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockSavings: Record<number, Transaction[]> = {
      1: [
        {
          transaction_id: 101,
          account_id: 1,
          user_id: 1,
          objective_id: 1,
          category: 'Ahorro',
          amount: 500,
          transaction_type: 'saving',
          concept: null,
          transaction_date: new Date(2026, 1, 10, 10, 30),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 102,
          account_id: 1,
          user_id: 1,
          objective_id: 2,
          category: 'Ahorro',
          amount: 500,
          transaction_type: 'saving',
          concept: null,
          transaction_date: new Date(2026, 1, 10, 15, 45),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 103,
          account_id: 1,
          user_id: 1,
          objective_id: 1,
          category: 'Ahorro',
          amount: 300,
          transaction_type: 'saving',
          concept: null,
          transaction_date: new Date(2026, 1, 3, 12, 0),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        },
        {
          transaction_id: 104,
          account_id: 1,
          user_id: 1,
          objective_id: 1,
          category: 'Ahorro',
          amount: 500,
          transaction_type: 'saving',
          concept: null,
          transaction_date: new Date(2026, 0, 9, 9, 20),
          isRecurring: false,
          frequency: null,
          end_date: null,
          split_type: 'individual',
          last_execution_date: null
        }
      ]
    };

    const savings = mockSavings[accountId] || [];
    savingsByAccount.value.set(accountId, savings);
    return savings;
  };

  return {
    transactionsByAccount,
    savingsByAccount,
    fetchTransactions,
    fetchSavings, // ✅ Nueva función
  };

});