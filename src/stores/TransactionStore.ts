import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Transaction } from '@/types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export const useTransactionStore = defineStore('transaction', () => {
  // ✅ Estado: Map para cachear transacciones por accountId
  const transactionsByAccount = ref<Map<number, Transaction[]>>(new Map());

  /**
   * Obtener el token de autenticación
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('wanda_auth_token');
  };

  /**
   * Headers con autenticación
   */
  const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  /**
   * GET /api/accounts/{accountId}/transactions
   * Obtener todas las transacciones de una cuenta
   */
  const fetchTransactions = async (accountId: number): Promise<Transaction[]> => {
    try {
      console.log(`📡 GET /api/accounts/${accountId}/transactions`);
      
      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/transactions`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ No autorizado - redirigiendo a login');
          localStorage.removeItem('wanda_auth_token');
          localStorage.removeItem('wanda_user_id');
          window.location.href = '/login';
          return [];
        }
        
        if (response.status === 404) {
          console.log('ℹ️ No se encontraron transacciones para esta cuenta');
          transactionsByAccount.value.set(accountId, []);
          return [];
        }
        
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText || 'Parámetros inválidos');
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const transactions = await response.json();
      
      console.log('✅ Transacciones cargadas:', transactions.length);
      
      // Guardar en caché
      transactionsByAccount.value.set(accountId, transactions);
      
      return transactions;

    } catch (error) {
      console.error('❌ Error al cargar transacciones:', error);
      return [];
    }
  };

  /**
   * GET /api/transactions/{id}
   * Obtener una transacción específica por ID
   */
  const fetchTransactionById = async (transactionId: number): Promise<Transaction | null> => {
    try {
      console.log(`📡 GET /api/transactions/${transactionId}`);
      
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.error('❌ Transacción no encontrada');
          return null;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const transaction = await response.json();
      console.log('✅ Transacción cargada:', transaction);
      
      return transaction;

    } catch (error) {
      console.error('❌ Error al cargar transacción:', error);
      return null;
    }
  };

  /**
   * POST /api/accounts/{accountId}/transactions
   * Crear una nueva transacción
   */
  const createTransaction = async (
    accountId: number,
    transactionData: {
      user_id: number;
      objective_id?: number;
      category: string;
      amount: number;
      transaction_type: 'expense' | 'income' | 'saving';
      concept?: string | null;
      transaction_date: Date | string;
      isRecurring?: boolean;
      frequency?: 'weekly' | 'monthly' | 'yearly' | null;
      end_date?: Date | string | null;
      split_type?: 'individual' | 'contribution' | 'divided' | null;
    }
  ): Promise<boolean> => {
    try {
      console.log(`📡 POST /api/accounts/${accountId}/transactions`);

      const response = await fetch(`${API_BASE_URL}/accounts/${accountId}/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(transactionData)
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText || 'Datos inválidos');
        }
        if (response.status === 404) {
          throw new Error('Cuenta no encontrada');
        }
        if (response.status === 409) {
          const errorText = await response.text();
          throw new Error(errorText || 'Conflicto al crear la transacción');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Transacción creada');

      // Invalidar caché para recargar
      transactionsByAccount.value.delete(accountId);
      
      // Recargar transacciones
      await fetchTransactions(accountId);

      return true;

    } catch (error) {
      console.error('❌ Error al crear transacción:', error);
      throw error;
    }
  };

  /**
   * PUT /api/transactions/{id}
   * Actualizar una transacción existente
   */
  const updateTransaction = async (
    transactionId: number,
    updates: {
      category?: string;
      amount?: number;
      transaction_type?: 'expense' | 'income' | 'saving';
      concept?: string | null;
      transaction_date?: Date | string;
      isRecurring?: boolean;
      frequency?: 'weekly' | 'monthly' | 'yearly' | null;
      end_date?: Date | string | null;
      split_type?: 'individual' | 'contribution' | 'divided' | null;
    }
  ): Promise<boolean> => {
    try {
      console.log(`📡 PUT /api/transactions/${transactionId}`);

      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Transacción no encontrada');
        }
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText || 'Datos inválidos');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Transacción actualizada');

      // Invalidar caché de todas las cuentas (no sabemos a cuál pertenece)
      transactionsByAccount.value.clear();

      return true;

    } catch (error) {
      console.error('❌ Error al actualizar transacción:', error);
      throw error;
    }
  };

  /**
   * DELETE /api/transactions/{id}
   * Eliminar una transacción
   */
  const deleteTransaction = async (transactionId: number, accountId?: number): Promise<boolean> => {
    try {
      console.log(`📡 DELETE /api/transactions/${transactionId}`);

      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Transacción no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Transacción eliminada');

      // Invalidar caché
      if (accountId) {
        transactionsByAccount.value.delete(accountId);
        // Recargar transacciones de esa cuenta
        await fetchTransactions(accountId);
      } else {
        // Si no sabemos la cuenta, limpiar todo el caché
        transactionsByAccount.value.clear();
      }

      return true;

    } catch (error) {
      console.error('❌ Error al eliminar transacción:', error);
      throw error;
    }
  };

  /**
   * Filtrar transacciones por tipo desde el caché
   */
  const getTransactionsByType = (
    accountId: number, 
    type: 'expense' | 'income' | 'saving'
  ): Transaction[] => {
    const transactions = transactionsByAccount.value.get(accountId);
    if (!transactions) return [];
    
    return transactions.filter(t => t.transaction_type === type);
  };

  /**
   * Obtener solo los ahorros (savings) de una cuenta
   */
  const fetchSavings = async (accountId: number): Promise<Transaction[]> => {
    const transactions = await fetchTransactions(accountId);
    return transactions.filter(t => t.transaction_type === 'saving');
  };

  /**
   * Obtener transacciones desde caché (sin llamada al backend)
   */
  const getTransactionsFromCache = (accountId: number): Transaction[] | null => {
    if (transactionsByAccount.value.has(accountId)) {
      return transactionsByAccount.value.get(accountId)!;
    }
    return null;
  };

  /**
   * Limpiar caché de una cuenta específica o todo
   */
  const clearCache = (accountId?: number) => {
    if (accountId) {
      transactionsByAccount.value.delete(accountId);
    } else {
      transactionsByAccount.value.clear();
    }
  };

  /**
   * Refrescar transacciones de una cuenta (forzar recarga desde backend)
   */
  const refreshTransactions = async (accountId: number): Promise<Transaction[]> => {
    transactionsByAccount.value.delete(accountId);
    return await fetchTransactions(accountId);
  };

  return {
    // Estado
    transactionsByAccount,
    
    // Métodos principales
    fetchTransactions,
    fetchTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Métodos auxiliares
    getTransactionsByType,
    fetchSavings,
    getTransactionsFromCache,
    clearCache,
    refreshTransactions
  };
});