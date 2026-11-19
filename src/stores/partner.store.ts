import { defineStore } from 'pinia';
import { ref } from 'vue';
import { partnerService } from '@/api/services/partner.service';
import type { PartnerMerchant, SettlementReport, CreatePartnerRequest } from '@/api/contracts';

export const usePartnerStore = defineStore('partner', () => {
  const partners = ref<PartnerMerchant[]>([]);
  const currentSettlement = ref<SettlementReport | null>(null);
  const isLoading = ref(false);

  async function fetchPartners() {
    isLoading.value = true;
    try {
      const res = await partnerService.getPartners();
      partners.value = res.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function createPartner(payload: CreatePartnerRequest) {
    isLoading.value = true;
    try {
      await partnerService.createPartner(payload);
      await fetchPartners();
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSettlementReport(partnerId: string, start: string, end: string) {
    isLoading.value = true;
    try {
      const res = await partnerService.getSettlementReport({
        partner_id: partnerId,
        period_start: start,
        period_end: end,
      });
      currentSettlement.value = res.data;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    partners,
    currentSettlement,
    isLoading,
    fetchPartners,
    createPartner,
    fetchSettlementReport,
  };
});

