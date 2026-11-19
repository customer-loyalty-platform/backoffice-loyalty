<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">Immutable Audit Trail Logs</h1>
        <p class="text-xs text-slate-500">Tamper-evident security logs recorded in schema_backoffice.admin_audit_logs.</p>
      </div>
      <button
        @click="approvalStore.fetchAuditLogs"
        class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 self-start sm:self-auto"
      >
        <i :class="['pi pi-refresh text-xs', approvalStore.isLoading ? 'pi-spin' : '']"></i>
        <span>Refresh Logs</span>
      </button>
    </div>

    <!-- Audit Logs Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="px-5 py-3.5">Timestamp</th>
              <th class="px-5 py-3.5">Admin Operator</th>
              <th class="px-5 py-3.5">Action</th>
              <th class="px-5 py-3.5">Target Resource</th>
              <th class="px-5 py-3.5">Client IP</th>
              <th class="px-5 py-3.5 text-right">Payload Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="log in approvalStore.auditLogs" :key="log.id" class="hover:bg-slate-50/60">
              <td class="px-5 py-3.5 text-slate-500 font-mono">{{ formatDateTime(log.created_at) }}</td>
              <td class="px-5 py-3.5 font-medium text-slate-900">
                <div>{{ log.admin.username }}</div>
                <div class="text-[10px] text-slate-400 uppercase font-semibold">{{ log.admin.role }}</div>
              </td>
              <td class="px-5 py-3.5 font-mono font-bold text-indigo-700">{{ log.action }}</td>
              <td class="px-5 py-3.5 font-mono text-slate-700">{{ log.target_resource }}</td>
              <td class="px-5 py-3.5 font-mono text-slate-500">{{ log.ip_address }}</td>
              <td class="px-5 py-3.5 text-right">
                <button
                  @click="openDetails(log)"
                  class="px-2.5 py-1 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 font-semibold text-[11px]"
                >
                  View JSON Diff
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- JSON Diff Modal -->
    <div v-if="selectedLog" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 class="text-sm font-bold text-slate-900">Audit Log Mutation Diff</h3>
          <button @click="selectedLog = null" class="text-slate-400 hover:text-slate-600">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="space-y-4">
          <div v-if="selectedLog.old_value">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Old Value (Before)</div>
            <JsonViewer :data="selectedLog.old_value" title="State Before Mutation" />
          </div>

          <div v-if="selectedLog.new_value">
            <div class="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">New Value (Committed)</div>
            <JsonViewer :data="selectedLog.new_value" title="State After Mutation" />
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button @click="selectedLog = null" class="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApprovalStore } from '@/stores/approval.store';
import JsonViewer from '@/components/common/JsonViewer.vue';
import { formatDateTime } from '@/utils/formatters';

const approvalStore = useApprovalStore();
const selectedLog = ref<any>(null);

function openDetails(log: any) {
  selectedLog.value = log;
}

onMounted(() => {
  approvalStore.fetchAuditLogs();
});
</script>

