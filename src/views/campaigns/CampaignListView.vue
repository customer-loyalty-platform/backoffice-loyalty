<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Campaign & Mission Builder</h1>
        <p class="text-xs text-slate-500">Configure time-bound behavioral challenges, streaks, digital badges, and two-way referral incentives.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Create Campaign</span>
      </button>
    </div>

    <!-- Campaigns Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="cmp in campaignStore.campaigns"
        :key="cmp.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
              {{ cmp.campaign_type }}
            </span>
            <StatusBadge :status="cmp.status" />
          </div>

          <h3 class="text-sm font-bold text-slate-900 mb-1">{{ cmp.title }}</h3>
          <p class="text-xs text-slate-500 mb-4 line-clamp-2">{{ cmp.description }}</p>

          <!-- Target Criteria Card -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs space-y-1">
            <div class="text-[10px] text-slate-400 font-semibold uppercase">Challenge Target</div>
            <div class="font-bold text-slate-800">
              {{ cmp.target_criteria.target_value }} {{ cmp.target_criteria.target_type.replace('_', ' ') }}
            </div>
            <div v-if="cmp.target_criteria.time_window_days" class="text-[11px] text-slate-500">
              Window: within {{ cmp.target_criteria.time_window_days }} days
            </div>
          </div>

          <!-- Reward -->
          <div class="flex items-center justify-between bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 mb-4 text-xs">
            <span class="text-emerald-800 font-medium">Reward Payout</span>
            <span class="font-bold text-emerald-700 font-mono">
              {{ cmp.reward_definition.bonus_points ? `+${formatNumber(cmp.reward_definition.bonus_points)} pts` : cmp.reward_definition.voucher_batch_code }}
            </span>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Participants: <span class="font-bold text-slate-800">{{ formatNumber(cmp.participant_count || 0) }}</span>
          </div>
          <div>
            Completions: <span class="font-bold text-slate-800">{{ formatNumber(cmp.completion_count || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Campaign Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Create New Campaign / Challenge</h3>
        <form @submit.prevent="handleCreateCampaign" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Campaign Code</label>
              <input v-model="cmpForm.campaign_code" required placeholder="CAMP_OFFPEAK_5X" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Campaign Type</label>
              <select v-model="cmpForm.campaign_type" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                <option value="MISSION">MISSION</option>
                <option value="STREAK">STREAK</option>
                <option value="BADGE">BADGE</option>
                <option value="REFERRAL">REFERRAL</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Title</label>
            <input v-model="cmpForm.title" required placeholder="e.g. 5 Off-Peak Trips Challenge" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea v-model="cmpForm.description" rows="2" class="w-full px-3 py-2 rounded-lg border border-slate-300"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Target Value</label>
              <input v-model.number="cmpForm.target_value" type="number" min="1" required class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Bonus Points Reward</label>
              <input v-model.number="cmpForm.bonus_points" type="number" min="50" required class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save Campaign</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCampaignStore } from '@/stores/campaign.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatNumber } from '@/utils/formatters';

const campaignStore = useCampaignStore();
const showCreateModal = ref(false);

const cmpForm = ref({
  campaign_code: '',
  campaign_type: 'MISSION' as const,
  title: '',
  description: '',
  target_value: 5,
  bonus_points: 500,
});

async function handleCreateCampaign() {
  await campaignStore.createCampaign({
    campaign_code: cmpForm.value.campaign_code,
    campaign_type: cmpForm.value.campaign_type,
    title: cmpForm.value.title,
    description: cmpForm.value.description,
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    target_criteria: {
      target_type: 'TRANSACTION_COUNT',
      target_value: cmpForm.value.target_value,
    },
    reward_definition: {
      reward_type: 'BONUS_POINTS',
      bonus_points: cmpForm.value.bonus_points,
    },
  });
  showCreateModal.value = false;
  alert('Campaign baru berhasil ditambahkan!');
}

onMounted(() => {
  campaignStore.fetchCampaigns();
});
</script>

