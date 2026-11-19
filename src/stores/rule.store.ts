import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ruleService } from '@/api/services/rule.service';
import type { DynamicRule, CreateRuleRequest, UpdateRuleRequest, RuleSearchParams } from '@/api/contracts';

export const useRuleStore = defineStore('rule', () => {
  const rules = ref<DynamicRule[]>([]);
  const totalRules = ref(0);
  const isLoading = ref(false);

  async function fetchRules(params?: RuleSearchParams) {
    isLoading.value = true;
    try {
      const res = await ruleService.getRules(params);
      rules.value = res.data;
      totalRules.value = res.pagination.total_items;
    } finally {
      isLoading.value = false;
    }
  }

  async function saveRule(payload: CreateRuleRequest, id?: string) {
    isLoading.value = true;
    try {
      if (id) {
        await ruleService.updateRule(id, payload as UpdateRuleRequest);
      } else {
        await ruleService.createRule(payload);
      }
      await fetchRules();
    } finally {
      isLoading.value = false;
    }
  }

  async function toggleRuleStatus(id: string, newStatus: 'ACTIVE' | 'PAUSED' | 'DRAFT') {
    isLoading.value = true;
    try {
      await ruleService.updateRuleStatus(id, { status: newStatus });
      await fetchRules();
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteRule(id: string) {
    isLoading.value = true;
    try {
      await ruleService.deleteRule(id);
      await fetchRules();
    } finally {
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

