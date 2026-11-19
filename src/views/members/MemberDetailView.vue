<template>
  <div v-if="memberStore.selectedMember" class="space-y-6">
    <!-- Back & Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <router-link to="/members" class="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
          <i class="pi pi-arrow-left text-xs"></i>
        </router-link>
        <div>
          <h1 class="text-lg font-bold text-slate-900 tracking-tight">{{ memberStore.selectedMember.full_name }}</h1>
          <p class="text-xs font-mono text-slate-500">{{ memberStore.selectedMember.account_number }}</p>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <StatusBadge :status="memberStore.selectedMember.status" />
        <button
          @click="showAdjustmentModal = true"
          class="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center space-x-1.5"
        >
          <i class="pi pi-plus-circle text-xs"></i>
          <span>Request Adjustment (Maker)</span>
        </button>
      </div>
    </div>

    <!-- Maker Checker Notice -->
    <MakerCheckerBanner
      title="Maker-Checker Dual Control Active"
      message="Pengajuan penyesuaian saldo poin member akan diteruskan ke antrean persetujuan (Pending Actions) dan diverifikasi oleh Checker sebelum dimutasikan pada schema_ledger."
    />

    <!-- Balance & Metric Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs text-slate-500 font-medium">Available Balance</span>
        <div class="text-2xl font-bold text-slate-900 mt-2 font-mono">
          {{ formatNumber(memberStore.selectedMember.balance.total_points) }} pts
        </div>
        <div class="text-[11px] text-slate-400 mt-2">
          Locked: {{ formatNumber(memberStore.selectedMember.balance.locked_points) }} | Exp: {{ formatNumber(memberStore.selectedMember.balance.expiring_points) }}
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs text-slate-500 font-medium">Current Tier & Status</span>
        <div class="text-2xl font-bold text-amber-600 mt-2 flex items-center space-x-2">
          <i class="pi pi-trophy text-amber-500"></i>
          <span>{{ memberStore.selectedMember.current_tier.tier_name }}</span>
        </div>
        <div class="text-[11px] text-slate-400 mt-2">
          Qualifying Pts: {{ formatNumber(memberStore.selectedMember.tier_qualifying_points) }}
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs text-slate-500 font-medium">Lifetime Earned</span>
        <div class="text-2xl font-bold text-emerald-600 mt-2 font-mono">
          {{ formatNumber(memberStore.selectedMember.lifetime_earned) }} pts
        </div>
        <div class="text-[11px] text-slate-400 mt-2">
          Total accumulation since join
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <span class="text-xs text-slate-500 font-medium">Lifetime Redeemed</span>
        <div class="text-2xl font-bold text-blue-600 mt-2 font-mono">
          {{ formatNumber(memberStore.selectedMember.lifetime_redeemed) }} pts
        </div>
        <div class="text-[11px] text-slate-400 mt-2">
          Redemption velocity: {{ formatPercent(memberStore.selectedMember.lifetime_redeemed / (memberStore.selectedMember.lifetime_earned || 1)) }}
        </div>
      </div>
    </div>

    <!-- Transaction Ledger Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="p-5 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 class="text-sm font-semibold text-slate-900">Member Transaction Ledger</h3>
          <p class="text-xs text-slate-500">Append-only audit trail recorded in schema_ledger.point_ledgers</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3">Timestamp</th>
              <th class="px-5 py-3">Type</th>
              <th class="px-5 py-3">Amount</th>
              <th class="px-5 py-3">Balance After</th>
              <th class="px-5 py-3">Reference / Order ID</th>
              <th class="px-5 py-3">Idempotency Key</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="tx in memberStore.selectedMember.recent_transactions" :key="tx.id" class="hover:bg-slate-50/60">
              <td class="px-5 py-3 text-slate-500 font-mono">{{ formatDateTime(tx.created_at) }}</td>
              <td class="px-5 py-3">
                <StatusBadge :status="tx.type" />
              </td>
              <td class="px-5 py-3 font-mono font-bold" :class="tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'">
                {{ tx.amount >= 0 ? `+${formatNumber(tx.amount)}` : formatNumber(tx.amount) }}
              </td>
              <td class="px-5 py-3 font-mono text-slate-700">{{ formatNumber(tx.balance_after) }}</td>
              <td class="px-5 py-3 font-mono text-slate-500">{{ tx.reference_id }}</td>
              <td class="px-5 py-3 font-mono text-slate-400 text-[10px]">{{ tx.idempotency_key }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Maker Adjustment Modal Dialog -->
    <div v-if="showAdjustmentModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h3 class="text-sm font-bold text-slate-900">Request Manual Point Adjustment</h3>
          <button @click="showAdjustmentModal = false" class="text-slate-400 hover:text-slate-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <form @submit.prevent="submitAdjustment" class="space-y-4 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Adjustment Type</label>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                @click="adjType = 'CREDIT'"
                :class="['py-2 px-3 rounded-lg border font-semibold text-center transition-all', adjType === 'CREDIT' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600']"
              >
                + CREDIT (Tambah Poin)
              </button>
              <button
                type="button"
                @click="adjType = 'DEBIT'"
                :class="['py-2 px-3 rounded-lg border font-semibold text-center transition-all', adjType === 'DEBIT' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600']"
              >
                - DEBIT (Tarik Poin)
              </button>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Points Amount</label>
            <input
              v-model.number="adjAmount"
              type="number"
              min="1"
              required
              placeholder="e.g. 1000"
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Reason Code</label>
            <select
              v-model="adjReasonCode"
              required
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="SYSTEM_DISRUPTION_COMPENSATION">SYSTEM_DISRUPTION_COMPENSATION</option>
              <option value="PROMO_MISSING_ACCRUAL">PROMO_MISSING_ACCRUAL</option>
              <option value="FRAUD_REVERSAL">FRAUD_REVERSAL</option>
              <option value="CUSTOMER_GOODWILL">CUSTOMER_GOODWILL</option>
            </select>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Ticket Reference ID</label>
            <input
              v-model="adjTicketRef"
              type="text"
              required
              placeholder="e.g. CS-TICKET-88910"
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              v-model="adjNotes"
              rows="3"
              required
              placeholder="Jelaskan dasar kompensasi atau penyesuaian..."
              class="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="showAdjustmentModal = false"
              class="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="memberStore.isActionLoading"
              class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Submit to Pending Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMemberStore } from '@/stores/member.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import MakerCheckerBanner from '@/components/common/MakerCheckerBanner.vue';
import { formatNumber, formatPercent, formatDateTime } from '@/utils/formatters';

const route = useRoute();
const memberStore = useMemberStore();

const showAdjustmentModal = ref(false);
const adjType = ref<'CREDIT' | 'DEBIT'>('CREDIT');
const adjAmount = ref(1000);
const adjReasonCode = ref('SYSTEM_DISRUPTION_COMPENSATION');
const adjTicketRef = ref('CS-TICKET-88910');
const adjNotes = ref('Manual compensation for station turnstile gate outage on Nov 8.');

async function submitAdjustment() {
  const memberId = route.params.id as string;
  await memberStore.requestAdjustment(memberId, {
    adjustment_type: adjType.value,
    amount: adjAmount.value,
    reason_code: adjReasonCode.value,
    notes: adjNotes.value,
    external_ticket_ref: adjTicketRef.value,
  });
  showAdjustmentModal.value = false;
  alert('Permintaan berhasil dikirimkan ke antrean Maker-Checker!');
}

onMounted(() => {
  const memberId = route.params.id as string;
  memberStore.fetchMemberDetail(memberId);
});
</script>

