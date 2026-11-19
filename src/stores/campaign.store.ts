import { defineStore } from 'pinia';
import { ref } from 'vue';
import { campaignService } from '@/api/services/campaign.service';
import type { Campaign, CreateCampaignRequest } from '@/api/contracts';

export const useCampaignStore = defineStore('campaign', () => {
  const campaigns = ref<Campaign[]>([]);
  const isLoading = ref(false);

  async function fetchCampaigns() {
    isLoading.value = true;
    try {
      const res = await campaignService.getCampaigns();
      campaigns.value = res.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function createCampaign(payload: CreateCampaignRequest) {
    isLoading.value = true;
    try {
      await campaignService.createCampaign(payload);
      await fetchCampaigns();
    } finally {
      isLoading.value = false;
    }
  }

  return {
    campaigns,
    isLoading,
    fetchCampaigns,
    createCampaign,
  };
});

