<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide uppercase',
      badgeClass
    ]"
  >
    <span class="w-1.5 h-1.5 mr-1.5 rounded-full" :class="dotClass"></span>
    {{ label || status }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status: string;
  label?: string;
}>();

const badgeClass = computed(() => {
  switch (props.status) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'AVAILABLE':
    case 'EARN':
    case 'ADJUSTMENT_CREDIT':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'PAUSED':
    case 'RESERVED':
    case 'DORMANT':
    case 'EXPIRATION':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'SUSPENDED':
    case 'REJECTED':
    case 'REVOKED':
    case 'TERMINATED':
    case 'DEPLETED':
    case 'ADJUSTMENT_DEBIT':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'CLAIMED':
    case 'COMPLETED':
    case 'REDEEM':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'DRAFT':
    case 'INACTIVE':
    case 'EXPIRED':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
});

const dotClass = computed(() => {
  switch (props.status) {
    case 'ACTIVE':
    case 'APPROVED':
    case 'AVAILABLE':
    case 'EARN':
    case 'ADJUSTMENT_CREDIT':
      return 'bg-emerald-500';
    case 'PENDING':
    case 'PENDING_APPROVAL':
    case 'PAUSED':
    case 'RESERVED':
    case 'DORMANT':
    case 'EXPIRATION':
      return 'bg-amber-500';
    case 'SUSPENDED':
    case 'REJECTED':
    case 'REVOKED':
    case 'TERMINATED':
    case 'DEPLETED':
    case 'ADJUSTMENT_DEBIT':
      return 'bg-rose-500';
    case 'CLAIMED':
    case 'COMPLETED':
    case 'REDEEM':
      return 'bg-blue-500';
    default:
      return 'bg-slate-400';
  }
});
</script>

