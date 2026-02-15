import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Account } from '@/types/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7085/api';

export const useAccountStore = defineStore('account', () => {
  // ✅ Estado: Map para cachear cuentas
  const accounts = ref<Map<number, Account>>(new Map());

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
   * GET /api/Account
   * Obtener todas las cuentas (probablemente no uses esto mucho)
   */
  const fetchAllAccounts = async (): Promise<Account[]> => {
    try {
      console.log('📡 GET /api/Account');
      
      const response = await fetch(`${API_BASE_URL}/Account`, {
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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const allAccounts = await response.json();
      console.log('✅ Todas las cuentas cargadas:', allAccounts);
      
      return allAccounts;

    } catch (error) {
      console.error('❌ Error al cargar todas las cuentas:', error);
      return [];
    }
  };

  /**
   * GET /api/Account/{accountId}
   * Obtener una cuenta específica por ID
   */
  const fetchAccount = async (accountId: number): Promise<Account | null> => {
    // Si ya está en caché, devolverla
    if (accounts.value.has(accountId)) {
      console.log('✅ Cuenta obtenida desde caché:', accountId);
      return accounts.value.get(accountId)!;
    }

    try {
      console.log(`📡 GET /api/Account/${accountId}`);
      
      const response = await fetch(`${API_BASE_URL}/Account/${accountId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ No autorizado - redirigiendo a login');
          localStorage.removeItem('wanda_auth_token');
          localStorage.removeItem('wanda_user_id');
          window.location.href = '/login';
          return null;
        }
        
        if (response.status === 404) {
          console.error('❌ Cuenta no encontrada');
          return null;
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const account = await response.json();
      
      console.log('✅ Cuenta cargada:', account);
      
      // Guardar en caché
      accounts.value.set(accountId, account);
      
      return account;

    } catch (error) {
      console.error('❌ Error al cargar cuenta:', error);
      return null;
    }
  };

  /**
   * GET /api/Account/{accountId}/users
   * Obtener los usuarios/miembros de una cuenta (para cuentas conjuntas)
   */
  const fetchAccountMembers = async (accountId: number) => {
    try {
      console.log(`📡 GET /api/Account/${accountId}/users`);
      
      const response = await fetch(`${API_BASE_URL}/Account/${accountId}/users`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('ID de cuenta inválido');
        }
        if (response.status === 404) {
          const errorText = await response.text();
          throw new Error(errorText || 'Cuenta no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const members = await response.json();
      console.log('✅ Miembros de la cuenta cargados:', members);
      
      return members;

    } catch (error) {
      console.error('❌ Error al cargar miembros de la cuenta:', error);
      throw error;
    }
  };

  /**
   * POST /api/Account
   * Crear una nueva cuenta CONJUNTA (joint account)
   * 
   * NOTA: Las cuentas personales se crean automáticamente al crear un usuario.
   * Este endpoint SOLO se usa para crear cuentas compartidas.
   */
  const createJointAccount = async (accountData: {
    name: string;
    user_ids: number[]; // IDs de los usuarios que compartirán la cuenta
    weekly_budget?: number;
    monthly_budget?: number;
    account_picture_url?: string;
  }): Promise<boolean> => {
    try {
      console.log('📡 POST /api/Account (Joint Account)');

      const response = await fetch(`${API_BASE_URL}/Account`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(accountData)
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText || 'Datos inválidos');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Cuenta conjunta creada exitosamente');

      // Limpiar caché para forzar recarga
      accounts.value.clear();

      return true;

    } catch (error) {
      console.error('❌ Error al crear cuenta conjunta:', error);
      throw error;
    }
  };

  /**
   * PUT /api/Account/{accountId}
   * Actualizar una cuenta existente
   */
  const updateAccount = async (
    accountId: number,
    updates: {
      name?: string;
      weekly_budget?: number;
      monthly_budget?: number;
      account_picture_url?: string;
    }
  ): Promise<boolean> => {
    try {
      console.log(`📡 PUT /api/Account/${accountId}`);

      const response = await fetch(`${API_BASE_URL}/Account/${accountId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorText = await response.text();
          throw new Error(errorText || 'ID no válido o datos incorrectos');
        }
        if (response.status === 404) {
          throw new Error('Cuenta no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Cuenta actualizada');

      // Invalidar caché de esta cuenta
      accounts.value.delete(accountId);

      return true;

    } catch (error) {
      console.error('❌ Error al actualizar cuenta:', error);
      throw error;
    }
  };

  /**
   * DELETE /api/Account/{accountId}
   * Eliminar una cuenta
   */
  const deleteAccount = async (accountId: number): Promise<boolean> => {
    try {
      console.log(`📡 DELETE /api/Account/${accountId}`);

      const response = await fetch(`${API_BASE_URL}/Account/${accountId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 404) {
          const errorText = await response.text();
          throw new Error(errorText || 'Cuenta no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Cuenta eliminada');

      // Eliminar del caché
      accounts.value.delete(accountId);

      return true;

    } catch (error) {
      console.error('❌ Error al eliminar cuenta:', error);
      throw error;
    }
  };

  /**
   * Obtener cuenta desde caché (sin llamada al backend)
   */
  const getAccountFromCache = (accountId: number): Account | null => {
    if (accounts.value.has(accountId)) {
      return accounts.value.get(accountId)!;
    }
    return null;
  };

  /**
   * Limpiar caché de una cuenta específica o todo
   */
  const clearCache = (accountId?: number) => {
    if (accountId) {
      accounts.value.delete(accountId);
    } else {
      accounts.value.clear();
    }
  };

  /**
   * Refrescar cuenta (forzar recarga desde backend)
   */
  const refreshAccount = async (accountId: number): Promise<Account | null> => {
    accounts.value.delete(accountId);
    return await fetchAccount(accountId);
  };

  return {
    // Estado
    accounts,
    
    // Métodos principales
    fetchAllAccounts,
    fetchAccount,
    fetchAccountMembers,
    createJointAccount, // ⚠️ Solo para cuentas conjuntas
    updateAccount,
    deleteAccount,
    
    // Métodos auxiliares
    getAccountFromCache,
    clearCache,
    refreshAccount
  };
});