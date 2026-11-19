import { defineStore } from 'pinia';
import { ref } from 'vue';
import { voucherService } from '@/api/services/voucher.service';
import type { VoucherBatch, VoucherInventoryItem, CreateVoucherBatchRequest } from '@/api/contracts';

export const useVoucherStore = defineStore('voucher', () => {
  const batches = ref<VoucherBatch[]>([]);
  const currentInventory = ref<VoucherInventoryItem[]>([]);
  const totalBatches = ref(0);
  const isLoading = ref(false);

  async function fetchBatches() {
    isLoading.value = true;
    try {
      const res = await voucherService.getBatches();
      batches.value = res.data;
      totalBatches.value = res.pagination.total_items;
    } finally {
      isLoading.value = false;
    }
  }

  async function createBatch(payload: CreateVoucherBatchRequest) {
    isLoading.value = true;
    try {
      await voucherService.createBatch(payload);
      await fetchBatches();
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchBatchInventory(batchId: string) {
    isLoading.value = true;
    try {
      const res = await voucherService.getBatchInventory(batchId);
      currentInventory.value = res.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function uploadBatchCodes(batchId: string, file: File) {
    isLoading.value = true;
    try {
      const res = await voucherService.uploadCodes(batchId, file);
      await fetchBatches();
      await fetchBatchInventory(batchId);
      return res;
    } finally {
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

