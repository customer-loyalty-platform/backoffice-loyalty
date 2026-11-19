import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tierService } from '@/api/services/tier.service';
import type { TierDefinition, CreateTierRequest, UpdateTierRequest } from '@/api/contracts';

export const useTierStore = defineStore('tier', () => {
  const tiers = ref<TierDefinition[]>([]);
  const isLoading = ref(false);

  async function fetchTiers() {
    isLoading.value = true;
    try {
      const res = await tierService.getTiers();
      tiers.value = res.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function saveTier(payload: CreateTierRequest, id?: string) {
    isLoading.value = true;
    try {
      if (id) {
        await tierService.updateTier(id, payload as UpdateTierRequest);
      } else {
        await tierService.createTier(payload);
      }
      await fetchTiers();
    } finally {
      isLoading.value = false;
    }
  }

  async function removeTier(id: string) {
    isLoading.value = true;
    try {
      await tierService.deleteTier(id);
      await fetchTiers();
    } finally {
      isLoading.value = false;
    }
  }

  return {
    tiers,
    isLoading,
    fetchTiers,
    saveTier,
    removeTier,
  };
});

