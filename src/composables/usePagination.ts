import { ref, computed } from 'vue';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/utils/constants';

/**
 * Composable for server-side pagination state
 */
export function usePagination(initialPageSize = DEFAULT_PAGE_SIZE) {
  const page = ref(1);
  const limit = ref(initialPageSize);
  const totalItems = ref(0);
  const totalPages = computed(() => Math.ceil(totalItems.value / limit.value) || 1);

  function setTotal(total: number) {
    totalItems.value = total;
  }

  function goToPage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage;
    }
  }

  function nextPage() {
    goToPage(page.value + 1);
  }

  function prevPage() {
    goToPage(page.value - 1);
  }

  function changePageSize(newSize: number) {
    limit.value = newSize;
    page.value = 1; // Reset to first page
  }

  function reset() {
    page.value = 1;
    totalItems.value = 0;
  }

  const offset = computed(() => (page.value - 1) * limit.value);
  const isFirstPage = computed(() => page.value === 1);
  const isLastPage = computed(() => page.value >= totalPages.value);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    offset,
    isFirstPage,
    isLastPage,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    setTotal,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    reset,
  };
}

