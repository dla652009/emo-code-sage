import { ref, onMounted, onBeforeUnmount, onActivated, watch, nextTick } from 'vue';

export function useTableScroll(options = {}) {
  const { dataListRef = null } = options;

  const scrollX = ref(1500);
  const scrollY = ref(200);
  const searchBarRef = ref(null);

  let searchBarResizeObserver = null;
  let calculateTimer = null;

  const destroySearchBarObserver = () => {
    if (searchBarResizeObserver) {
      searchBarResizeObserver.disconnect();
      searchBarResizeObserver = null;
    }
    if (calculateTimer) {
      clearTimeout(calculateTimer);
      calculateTimer = null;
    }
  };

  const calculateScrollSize = () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    scrollX.value = Math.max(1500, viewportWidth * 0.9);

    let occupiedHeight = 0;

    const layoutHeader = document.querySelector('.ant-layout-header');
    if (layoutHeader) occupiedHeight += layoutHeader.offsetHeight;

    const breadcrumb = document.querySelector('.ant-breadcrumb');
    if (breadcrumb) {
      const breadcrumbContainer = breadcrumb.closest('.flex');
      if (breadcrumbContainer) occupiedHeight += breadcrumbContainer.offsetHeight;
    }

    const tabs = document.querySelector('.ant-tabs');
    if (tabs) occupiedHeight += tabs.offsetHeight;

    const searchBarEl = searchBarRef.value?.$el;
    if (searchBarEl) occupiedHeight += searchBarEl.offsetHeight;

    const tableTitle = document.querySelector('.ant-table-title');
    if (tableTitle) occupiedHeight += tableTitle.offsetHeight;

    const tableHeader = document.querySelector('.ant-table-thead');
    if (tableHeader) occupiedHeight += tableHeader.offsetHeight;

    const pagination = document.querySelector('.ant-pagination');
    if (pagination) occupiedHeight += pagination.offsetHeight;

    const layoutFooter = document.querySelector('.ant-layout-footer');
    if (layoutFooter) occupiedHeight += layoutFooter.offsetHeight;

    const extraPadding = 20;
    occupiedHeight += extraPadding;

    const minScrollY = viewportHeight < 800 ? 100 : 200;
    scrollY.value = Math.max(minScrollY, viewportHeight - occupiedHeight);
  };

  const initSearchBarObserver = () => {
    const searchBarEl = searchBarRef.value?.$el;
    if (!searchBarEl) return;

    destroySearchBarObserver();

    searchBarResizeObserver = new ResizeObserver(() => {
      if (calculateTimer) {
        clearTimeout(calculateTimer);
      }
      calculateTimer = setTimeout(() => {
        nextTick(() => {
          calculateScrollSize();
        });
      }, 50);
    });

    searchBarResizeObserver.observe(searchBarEl);
  };

  onMounted(() => {
    nextTick(() => {
      initSearchBarObserver();
      calculateScrollSize();
    });
    window.addEventListener('resize', calculateScrollSize);
  });

  onActivated(() => {
    nextTick(() => {
      calculateScrollSize();
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', calculateScrollSize);
    destroySearchBarObserver();
  });

  if (dataListRef) {
    watch(
      dataListRef,
      () => {
        nextTick(() => {
          calculateScrollSize();
        });
      },
      { deep: true }
    );
  }

  return {
    scrollX,
    scrollY,
    searchBarRef,
    calculateScrollSize
  };
}
