import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ruleService } from '@/api/services/rule.service';
export const useRuleStore = defineStore('rule', () => {
    const rules = ref([]);
    const totalRules = ref(0);
    const isLoading = ref(false);
    async function fetchRules(params) {
        isLoading.value = true;
        try {
            const res = await ruleService.getRules(params);
            rules.value = res.data;
            totalRules.value = res.pagination.total_items;
        }
        finally {
            isLoading.value = false;
        }
    }
    async function saveRule(payload, id) {
        isLoading.value = true;
        try {
            if (id) {
                await ruleService.updateRule(id, payload);
            }
            else {
                await ruleService.createRule(payload);
            }
            await fetchRules();
        }
        finally {
            isLoading.value = false;
        }
    }
    async function toggleRuleStatus(id, newStatus) {
        isLoading.value = true;
        try {
            await ruleService.updateRuleStatus(id, { status: newStatus });
            await fetchRules();
        }
        finally {
            isLoading.value = false;
        }
    }
    async function deleteRule(id) {
        isLoading.value = true;
        try {
            await ruleService.deleteRule(id);
            await fetchRules();
        }
        finally {
            isLoading.value = false;
        }
    }
    return {
        rules,
        totalRules,
        isLoading,
        fetchRules,
        saveRule,
        toggleRuleStatus,
        deleteRule,
    };
});
