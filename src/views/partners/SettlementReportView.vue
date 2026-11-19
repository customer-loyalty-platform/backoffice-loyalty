<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Coalition Settlement & Clearing Engine</h1>
        <p class="text-xs text-slate-500">Calculate financial liabilities, clearing summaries, and platform commission splits.</p>
      </div>
      <button
        @click="exportCsv"
        class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i class="pi pi-file-excel text-xs"></i>
        <span>Export Clearing Statement (CSV)</span>
      </button>
    </div>

    <!-- Partner Selector & Period Toolbar -->
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
      <div class="flex items-center space-x-2 w-full sm:w-auto">
        <label class="font-semibold text-slate-700">Select Partner:</label>
        <select
          v-model="selectedPartnerId"
          @change="loadSettlement"
          class="px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option v-for="p in partnerStore.partners" :key="p.id" :value="p.id">
            {{ p.merchant_name }}
          </option>
        </select>
      </div>

      <div class="flex items-center space-x-2 text-xs text-slate-500">
        <span class="font-medium">Clearing Period:</span>
        <span class="font-bold text-slate-800">01 Oct 2026 - 31 Oct 2026</span>
      </div>
    </div>

    <!-- Settlement Breakdown 3-Card Summary -->
    <div v-if="partnerStore.currentSettlement" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Gross Liability -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs text-slate-500 font-medium">1. Gross Partner Liability</span>
        <div class="text-2xl font-bold text-slate-900 mt-2 font-mono">
          {{ formatCurrency(partnerStore.currentSettlement.summary.gross_liability) }}
        </div>
        <div class="text-[11px] text-slate-400 mt-2 font-mono">
          Formula: {{ formatNumber(partnerStore.currentSettlement.summary.total_points_redeemed) }} pts × {{ formatCurrency(partnerStore.currentSettlement.summary.par_value_per_point) }}
        </div>
      </div>

      <!-- Platform Commission -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs text-slate-500 font-medium">2. Platform Commission ({{ formatPercent(partnerStore.currentSettlement.summary.commission_rate) }})</span>
        <div class="text-2xl font-bold text-amber-600 mt-2 font-mono">
          -{{ formatCurrency(partnerStore.currentSettlement.summary.platform_commission) }}
        </div>
        <div class="text-[11px] text-slate-400 mt-2 font-mono">
          Gross × {{ formatPercent(partnerStore.currentSettlement.summary.commission_rate) }}
        </div>
      </div>

      <!-- Net Payable -->
      <div class="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800 shadow-xs">
        <span class="text-xs text-indigo-300 font-medium">3. Net Payable to Partner</span>
        <div class="text-2xl font-bold text-emerald-400 mt-2 font-mono">
          {{ formatCurrency(partnerStore.currentSettlement.summary.net_payable_to_partner) }}
        </div>
        <div class="text-[11px] text-slate-300 mt-2 font-mono">
          Net Clearing Transfer
        </div>
      </div>
    </div>

    <!-- Individual Transactions in Clearing Period -->
    <div v-if="partnerStore.currentSettlement" class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-200">
        <h3 class="text-sm font-semibold text-slate-900">Redemption Transactions in Settlement Batch</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">Timestamp</th>
              <th class="px-5 py-3">Transaction ID</th>
              <th class="px-5 py-3">Member ID</th>
              <th class="px-5 py-3">Points Burned</th>
              <th class="px-5 py-3">Equivalent Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="item in partnerStore.currentSettlement.transactions" :key="item.transaction_id" class="hover:bg-slate-50/60">
              <td class="px-5 py-3.5 text-slate-500 font-mono">{{ formatDateTime(item.redeemed_at) }}</td>
              <td class="px-5 py-3.5 font-mono text-slate-700">{{ item.transaction_id }}</td>
              <td class="px-5 py-3.5 text-slate-800">{{ item.member_id }}</td>
              <td class="px-5 py-3.5 font-mono font-bold text-blue-600">-{{ formatNumber(item.points_redeemed) }} pts</td>
              <td class="px-5 py-3.5 font-mono font-bold text-slate-900">{{ formatCurrency(item.monetary_value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePartnerStore } from '@/stores/partner.store';
import { formatCurrency, formatNumber, formatPercent, formatDateTime } from '@/utils/formatters';

const route = useRoute();
const partnerStore = usePartnerStore();

const selectedPartnerId = ref('prt-0001-kenangan');

async function loadSettlement() {
  await partnerStore.fetchSettlementReport(
    selectedPartnerId.value,
    '2026-10-01T00:00:00Z',
    '2026-10-31T23:59:59Z'
  );
}

function exportCsv() {
  const summary = partnerStore.currentSettlement?.summary;
  if (!summary) return;
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    'Partner,Total Points,Par Value,Gross Liability,Commission,Net Payable\n' +
    `${partnerStore.currentSettlement?.partner.merchant_name},${summary.total_points_redeemed},${summary.par_value_per_point},${summary.gross_liability},${summary.platform_commission},${summary.net_payable_to_partner}`;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `settlement_${selectedPartnerId.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

onMounted(async () => {
  await partnerStore.fetchPartners();
  const queryPartner = route.query.partner_id as string;
  if (queryPartner) selectedPartnerId.value = queryPartner;
  await loadSettlement();
});
</script>

