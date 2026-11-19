<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Dynamic Tier & Multiplier Configurator</h1>
        <p class="text-xs text-slate-500">Configure tier hierarchies, qualifying spend thresholds, earning multipliers, and perk metadata.</p>
      </div>
      <button
        @click="openCreateModal"
        class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i class="pi pi-plus text-xs"></i>
        <span>Create New Tier</span>
      </button>
    </div>

    <!-- Tier Hierarchy Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="tier in tierStore.tiers"
        :key="tier.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              RANK {{ tier.rank }}
            </span>
            <span class="text-xs font-bold text-indigo-600 font-mono">
              {{ formatMultiplier(tier.multiplier) }}
            </span>
          </div>

          <h3 class="text-base font-bold text-slate-900 mb-1 flex items-center space-x-1.5">
            <i class="pi pi-trophy text-amber-500"></i>
            <span>{{ tier.tier_name }}</span>
          </h3>

          <div class="text-xs text-slate-500 mb-4">
            Threshold:
            <span class="font-semibold text-slate-700 font-mono">
              {{ tier.qualification_type === 'SPEND' ? formatCurrency(tier.min_threshold) : `${formatNumber(tier.min_threshold)} pts` }}
            </span>
            <span class="text-[10px] text-slate-400 ml-1">({{ tier.qualification_type }})</span>
          </div>

          <!-- Perks List -->
          <div class="space-y-1.5 pt-3 border-t border-slate-100 mb-4">
            <div class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Perks & Benefits</div>
            <div
              v-for="perk in tier.perks_config"
              :key="perk.perk_code"
              class="text-[11px] text-slate-600 flex items-start space-x-1.5"
            >
              <i class="pi pi-check text-emerald-500 text-[10px] mt-0.5"></i>
              <span>{{ perk.perk_name }}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span class="text-[11px] text-slate-400">
            {{ formatNumber(tier.member_count || 0) }} members
          </span>
          <div class="space-x-2">
            <button
              @click="editTier(tier)"
              class="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Edit
            </button>
            <button
              @click="deleteTier(tier.id)"
              class="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 class="text-sm font-bold text-slate-900 mb-4">
          {{ editingId ? 'Edit Tier Configuration' : 'Create New Loyalty Tier' }}
        </h3>

        <form @submit.prevent="handleSaveTier" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Tier Name</label>
            <input v-model="formData.tier_name" required placeholder="e.g. Diamond VIP" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Rank (Hierarchy)</label>
              <input v-model.number="formData.rank" type="number" min="1" required class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Point Multiplier (e.g. 1.75)</label>
              <input v-model.number="formData.multiplier" type="number" step="0.05" min="1.0" required class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Qualification Model</label>
              <select v-model="formData.qualification_type" class="w-full px-3 py-2 rounded-lg border border-slate-300">
                <option value="POINTS">POINTS</option>
                <option value="SPEND">SPEND (IDR)</option>
                <option value="VISITS">VISITS</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Min Threshold</label>
              <input v-model.number="formData.min_threshold" type="number" required class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            </div>
          </div>

          <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save Tier</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTierStore } from '@/stores/tier.store';
import { formatMultiplier, formatNumber, formatCurrency } from '@/utils/formatters';

const tierStore = useTierStore();
const showModal = ref(false);
const editingId = ref<string | null>(null);

const formData = ref({
  tier_name: '',
  rank: 1,
  qualification_type: 'POINTS' as const,
  min_threshold: 1000,
  multiplier: 1.25,
  perks_config: [
    { perk_code: 'BENEFIT_1', perk_name: 'Special Benefit', description: 'Sample description', is_active: true }
  ],
});

function openCreateModal() {
  editingId.value = null;
  formData.value = {
    tier_name: '',
    rank: (tierStore.tiers.length + 1),
    qualification_type: 'POINTS',
    min_threshold: 5000,
    multiplier: 1.25,
    perks_config: [{ perk_code: 'PERK_NEW', perk_name: 'Priority Service', description: 'Priority lane', is_active: true }],
  };
  showModal.value = true;
}

function editTier(tier: any) {
  editingId.value = tier.id;
  formData.value = {
    tier_name: tier.tier_name,
    rank: tier.rank,
    qualification_type: tier.qualification_type,
    min_threshold: tier.min_threshold,
    multiplier: tier.multiplier,
    perks_config: tier.perks_config || [],
  };
  showModal.value = true;
}

async function handleSaveTier() {
  await tierStore.saveTier(formData.value, editingId.value || undefined);
  showModal.value = false;
}

async function deleteTier(id: string) {
  if (confirm('Yakin ingin menghapus tier ini?')) {
    await tierStore.removeTier(id);
  }
}

onMounted(() => {
  tierStore.fetchTiers();
});
</script>

