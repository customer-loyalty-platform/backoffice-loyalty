import { defineStore } from 'pinia';
import { ref } from 'vue';
import { auditService } from '@/api/services/audit.service';
export const useApprovalStore = defineStore('approval', () => {
    const pendingActions = ref([]);
    const auditLogs = ref([]);
    const adminUsers = ref([]);
    const isLoading = ref(false);
    async function fetchPendingActions() {
        isLoading.value = true;
        try {
            const res = await auditService.getPendingActions();
            pendingActions.value = res.data;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function approve(id) {
        isLoading.value = true;
        try {
            const res = await auditService.approveAction(id);
            await fetchPendingActions();
            return res;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function reject(id, reason) {
        isLoading.value = true;
        try {
            await auditService.rejectAction(id, { rejection_reason: reason });
            await fetchPendingActions();
        }
        finally {
            isLoading.value = false;
        }
    }
    async function fetchAuditLogs() {
        isLoading.value = true;
        try {
            const res = await auditService.getAuditLogs();
            auditLogs.value = res.data;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function fetchAdminUsers() {
        isLoading.value = true;
        try {
            const res = await auditService.getAdminUsers();
            adminUsers.value = res.data;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function createAdminUser(payload) {
        isLoading.value = true;
        try {
            await auditService.createAdminUser(payload);
            await fetchAdminUsers();
        }
        finally {
            isLoading.value = false;
        }
    }
    return {
        pendingActions,
        auditLogs,
        adminUsers,
        isLoading,
        fetchPendingActions,
        approve,
        reject,
        fetchAuditLogs,
        fetchAdminUsers,
        createAdminUser,
    };
});
