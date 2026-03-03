// src/stores/AdminStore.ts

import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { apiService, type SystemStats } from '@/services/apiService';
import { authService } from '@/services/authService';

export const useAdminStore = defineStore('admin', () => {

    // ==================== STATE ====================

    const systemStats = ref<SystemStats | null>(null);
    const isLoadingStats = ref(false);
    const statsError = ref<string | null>(null);
    const isCreatingAdmin = ref(false);
    const createAdminError = ref<string | null>(null);

    // ==================== COMPUTED ====================

    const isAdmin = computed(() => authService.isAdmin());

    const hasStats = computed(() => systemStats.value !== null);

    // ==================== ACTIONS ====================

    const fetchSystemStats = async (): Promise<void> => {
        if (!authService.isAdmin()) {
            statsError.value = 'No tienes permisos para ver estas estadísticas';
            return;
        }

        try {
            isLoadingStats.value = true;
            statsError.value = null;
            systemStats.value = await apiService.getSystemStats();
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            statsError.value = error instanceof Error ? error.message : 'Error desconocido';
            throw error;
        } finally {
            isLoadingStats.value = false;
        }
    };

    const clearStats = () => {
        systemStats.value = null;
        statsError.value = null;
    };

    const createAdmin = async (data: { name: string; email: string; password: string }): Promise<boolean> => {
        if (!authService.isAdmin()) {
            createAdminError.value = 'No tienes permisos para crear administradores';
            return false;
        }

        try {
            isCreatingAdmin.value = true;
            createAdminError.value = null;
            await apiService.createAdmin(data);
            return true;
        } catch (error) {
            console.error('Error creando administrador:', error);
            createAdminError.value = error instanceof Error ? error.message : 'Error desconocido';
            return false;
        } finally {
            isCreatingAdmin.value = false;
        }
    };

    // ==================== RETURN ====================

    return {
        systemStats,
        isLoadingStats,
        statsError,
        isAdmin,
        hasStats,
        isCreatingAdmin,
        createAdminError,
        fetchSystemStats,
        clearStats,
        createAdmin,

    };
});