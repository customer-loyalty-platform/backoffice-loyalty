import { defineStore } from 'pinia';
import { ref } from 'vue';
import { tierService } from '@/api/services/tier.service';
export const useTierStore = defineStore('tier', () => {
    const tiers = ref([]);
    const isLoading = ref(false);
    async function fetchTiers() {
        isLoading.value = true;
        try {
            const res = await tierService.getTiers();
            tiers.value = res.data;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function saveTier(payload, id) {
        isLoading.value = true;
        try {
            if (id) {
                await tierService.updateTier(id, payload);
            }
            else {
                await tierService.createTier(payload);
            }
            await fetchTiers();
        }
        finally {
            isLoading.value = false;
        }
    }
    async function removeTier(id) {
        isLoading.value = true;
        try {
            await tierService.deleteTier(id);
            await fetchTiers();
        }
        finally {
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
