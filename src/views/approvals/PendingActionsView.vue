<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Maker-Checker Approval Queue</h1>
        <p class="text-xs text-slate-500">Dual-control authorization queue for high-risk operations and manual point adjustments.</p>
      </div>
      <button
        @click="approvalStore.fetchPendingActions"
        class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i :class="['pi pi-refresh text-xs', approvalStore.isLoading ? 'pi-spin' : '']"></i>
        <span>Refresh Queue</span>
      </button>
    </div>

    <!-- Dual Control Banner -->
    <MakerCheckerBanner
      title="Dual-Control Authorization Protocol Active"
      message="Setiap operasi manual (Maker) memerlukan verifikasi eksplisit oleh administrator dengan hak akses Checker (Supervisor / Super Admin) untuk menjamin integritas pembukuan ledger."
    />

    <!-- Queue List -->
    <div class="space-y-4">
      <div
        v-for="action in approvalStore.pendingActions"
        :key="action.id"
        class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-200 transition-all"
      >
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center space-x-2 mb-1">
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase">
                {{ action.action_type }}
              </span>
              <StatusBadge :status="action.status" />
              <span class="text-xs font-mono text-slate-400">#{{ action.id }}</span>
            </div>
            <div class="text-xs text-slate-600 mt-1">
              Initiated by:
              <span class="font-bold text-slate-800">{{ action.maker.username }}</span>
              <span class="text-slate-400 ml-1">({{ action.maker.role }})</span>
              <span class="mx-1.5 text-slate-300">•</span>
              <span class="text-slate-400 font-mono">{{ formatDateTime(action.created_at) }}</span>
            </div>
          </div>

          <!-- Action Buttons for Checker -->
          <div v-if="action.status === 'PENDING'" class="flex items-center space-x-2 text-xs">
            <button
              @click="handleApprove(action.id)"
              class="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center space-x-1.5 shadow-sm"
            >
              <i class="pi pi-check text-xs"></i>
              <span>Approve Action</span>
            </button>
            <button
              @click="handleReject(action.id)"
              class="px-4 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold flex items-center space-x-1.5"
            >
              <i class="pi pi-times text-xs"></i>
              <span>Reject</span>
            </button>
          </div>
          <div v-else class="text-xs font-semibold text-slate-500">
            Resolved by: {{ action.checker?.username || 'Supervisor' }}
          </div>
        </div>

        <!-- Target Resource & Payload Preview -->
        <div class="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Resource</div>
            <div class="font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              {{ action.target_resource }}
            </div>
            <div v-if="action.rejection_reason" class="mt-2 text-rose-600 font-medium">
              Alasan Penolakan: {{ action.rejection_reason }}
            </div>
          </div>

          <div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Action Payload (JSONB)</div>
            <JsonViewer :data="action.payload" title="Pending Mutation Payload" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useApprovalStore } from '@/stores/approval.store';
import StatusBadge from '@/components/common/StatusBadge.vue';
import MakerCheckerBanner from '@/components/common/MakerCheckerBanner.vue';
import JsonViewer from '@/components/common/JsonViewer.vue';
import { formatDateTime } from '@/utils/formatters';

const approvalStore = useApprovalStore();

async function handleApprove(id: string) {
  if (confirm('Konfirmasi: Otorisasi dan eksekusi aksi ini ke Core Ledger?')) {
    await approvalStore.approve(id);
    alert('Aksi disetujui dan mutasi transaksi berhasil dicatat!');
  }
}

async function handleReject(id: string) {
  const reason = prompt('Masukkan alasan penolakan:');
  if (reason) {
    await approvalStore.reject(id, reason);
    alert('Aksi telah ditolak.');
  }
}

onMounted(() => {
  approvalStore.fetchPendingActions();
});
</script>

