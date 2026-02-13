import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Objective } from '@/types/models';

export const useObjectiveStore = defineStore('objective', () => {
  // ✅ Estado: Map para cachear objetivos por accountId
  const objectivesByAccount = ref<Map<number, Objective[]>>(new Map());

  // ✅ Obtener objetivos de una cuenta (con caché automático)
  const fetchObjectives = async (accountId: number): Promise<Objective[]> => {
    // Si ya están en caché, devolverlos
    if (objectivesByAccount.value.has(accountId)) {
      return objectivesByAccount.value.get(accountId)!;
    }

    // TODO: Fetch real cuando tengas backend
    // const response = await fetch(`/api/accounts/${accountId}/objectives`);
    // const objectives = await response.json();
    // objectivesByAccount.value.set(accountId, objectives);
    // return objectives;

    // Mock temporal
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockObjectives: Record<number, Objective[]> = {
      1: [
        {
          objective_id: 1,
          account_id: 1,
          name: 'Coche nuevo',
          target_amount: 10000,
          current_save: 7000,
          deadline: new Date(2026, 11, 31),
          objective_picture_url: ''
        },
        {
          objective_id: 2,
          account_id: 1,
          name: 'Entrada Casa',
          target_amount: 20000,
          current_save: 3756,
          deadline: new Date(2028, 5, 30),
          objective_picture_url: ''
        }
      ],
      2: [
        {
          objective_id: 3,
          account_id: 2,
          name: 'Vacaciones',
          target_amount: 5000,
          current_save: 2500,
          deadline: new Date(2026, 6, 15),
          objective_picture_url: ''
        }
      ]
    };

    const objectives = mockObjectives[accountId] || [];
    
    objectivesByAccount.value.set(accountId, objectives);
    
    return objectives;
  };

  return {
    objectivesByAccount,
    fetchObjectives
  };
});