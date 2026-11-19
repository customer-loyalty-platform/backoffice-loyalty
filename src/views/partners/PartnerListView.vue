<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Partner Coalition Network</h1>
        <p class="text-xs text-slate-500">Manage third-party coalition partners, clearing rates, and commission models.</p>
      </div>
      <div class="flex items-center space-x-2">
        <router-link
          to="/partners/settlement"
          class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-xs flex items-center space-x-1.5"
        >
          <i class="pi pi-receipt text-xs"></i>
          <span>Settlement Reports</span>
        </router-link>
        <button
          @click="showCreateModal = true"
          class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5"
        >
          <i class="pi pi-plus text-xs"></i>
          <span>Add Partner</span>
        </button>
      </div>
    </div>

    <!-- Partners Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        v-for="partner in partnerStore.partners"
        :key="partner.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-200 transition-all"
      >
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-mono font-bold text-slate-400">#{{ partner.merchant_code }}</span>
            <StatusBadge :status="partner.status" />
          </div>

          <h3 class="text-sm font-bold text-slate-900 mb-1">{{ partner.merchant_name }}</h3>
          <p class="text-xs text-slate-500 mb-4">{{ partner.contact_email }}</p>

          <!-- Commercial Rates -->
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-500">Par Value / Point:</span>
              <span class="font-mono font-bold text-slate-900">{{ formatCurrency(partner.par_value_per_point) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Platform Commission:</span>
              <span class="font-mono font-bold text-emerald-600">{{ formatPercent(partner.commission_rate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Settlement Currency:</span>
              <span class="font-mono text-slate-700 font-bold">{{ partner.settlement_currency }}</span>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <router-link
            :to="`/partners/settlement?partner_id=${partner.id}`"
            class="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            View Settlement →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Create Partner Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Register Merchant Partner</h3>
        <form @submit.prevent="handleCreatePartner" class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Merchant Code</label>
            <input v-model="partnerForm.merchant_code" required placeholder="MRCH_NEW_BRAND" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Merchant Company Name</label>
            <input v-model="partnerForm.merchant_name" required placeholder="PT Mitra Sukses" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Contact Email</label>
            <input v-model="partnerForm.contact_email" type="email" required placeholder="finance@merchant.com" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Par Value / Pts (IDR)</label>
              <input v-model.number="partnerForm.par_value_per_point" type="number" step="0.5" required class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Commission Rate (0.15 = 15%)</label>
              <input v-model.number="partnerForm.commission_rate" type="number" step="0.01" min="0" max="0.5" required class="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono" />
            </div>
          </div>
          <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold">Save Partner</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { usePartnerStore } from '@/stores/partner.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { formatCurrency, formatPercent } from '@/utils/formatters';

const partnerStore = usePartnerStore();
const showCreateModal = ref(false);

const partnerForm = ref({
  merchant_code: '',
  merchant_name: '',
  contact_email: '',
  contact_phone: '+62211234567',
  par_value_per_point: 10.0,
  commission_rate: 0.15,
  settlement_currency: 'IDR',
  contract_start_date: new Date().toISOString(),
});

async function handleCreatePartner() {
  await partnerStore.createPartner(partnerForm.value);
  showCreateModal.value = false;
  alert('Partner baru berhasil didaftarkan!');
}

onMounted(() => {
  partnerStore.fetchPartners();
});
</script>

