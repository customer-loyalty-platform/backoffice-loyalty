import { defineStore } from 'pinia';
import { ref } from 'vue';
import { voucherService } from '@/api/services/voucher.service';
export const useVoucherStore = defineStore('voucher', () => {
    const batches = ref([]);
    const currentInventory = ref([]);
    const totalBatches = ref(0);
    const isLoading = ref(false);
    async function fetchBatches() {
        isLoading.value = true;
        try {
            const res = await voucherService.getBatches();
            batches.value = res.data;
            totalBatches.value = res.pagination.total_items;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function createBatch(payload) {
        isLoading.value = true;
        try {
            await voucherService.createBatch(payload);
            await fetchBatches();
        }
        finally {
            isLoading.value = false;
        }
    }
    async function fetchBatchInventory(batchId) {
        isLoading.value = true;
        try {
            const res = await voucherService.getBatchInventory(batchId);
            currentInventory.value = res.data;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function uploadBatchCodes(batchId, file) {
        isLoading.value = true;
        try {
            const res = await voucherService.uploadCodes(batchId, file);
            await fetchBatches();
            await fetchBatchInventory(batchId);
            return res;
        }
        finally {
            isLoading.value = false;
        }
    }
    return {
        batches,
        currentInventory,
        totalBatches,
        isLoading,
        fetchBatches,
        createBatch,
        fetchBatchInventory,
        uploadBatchCodes,
    };
});
