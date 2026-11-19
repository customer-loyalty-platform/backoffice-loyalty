import { defineStore } from 'pinia';
import { ref } from 'vue';
import { memberService } from '@/api/services/member.service';
import type {
  MemberListItem,
  MemberDetail,
  PointAdjustmentRequest,
  MemberSearchParams,
} from '@/api/contracts';

export const useMemberStore = defineStore('member', () => {
  const members = ref<MemberListItem[]>([]);
  const selectedMember = ref<MemberDetail | null>(null);
  const totalMembers = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const isLoading = ref(false);
  const isActionLoading = ref(false);

  async function fetchMembers(params?: MemberSearchParams) {
    isLoading.value = true;
    try {
      const res = await memberService.getMembers({
        page: currentPage.value,
        limit: pageSize.value,
        ...params,
      });
      members.value = res.data;
      totalMembers.value = res.pagination.total_items;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchMemberDetail(id: string) {
    isLoading.value = true;
    try {
      const res = await memberService.getMemberById(id);
      selectedMember.value = res.data;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStatus(id: string, status: any, reason: string) {
    isActionLoading.value = true;
    try {
      await memberService.updateMemberStatus(id, { status, reason });
      if (selectedMember.value && selectedMember.value.id === id) {
        selectedMember.value.status = status;
      }
      await fetchMembers();
    } finally {
      isActionLoading.value = false;
    }
  }

  async function requestAdjustment(id: string, payload: PointAdjustmentRequest) {
    isActionLoading.value = true;
    try {
      const res = await memberService.submitPointAdjustment(id, payload);
      return res;
    } finally {
      isActionLoading.value = false;
    }
  }

  return {
    members,
    selectedMember,
    totalMembers,
    currentPage,
    pageSize,
    isLoading,
    isActionLoading,
    fetchMembers,
    fetchMemberDetail,
    updateStatus,
    requestAdjustment,
  };
});

