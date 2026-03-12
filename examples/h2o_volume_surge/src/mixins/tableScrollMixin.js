/**
 * 表格滚动区域动态计算 Mixin
 * 用于 Options API
 */
export default {
  data() {
    return {
      scrollX: 1500,
      scrollY: 200,
      searchBarResizeObserver: null,
      calculateTimer: null
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initSearchBarObserver();
      this.calculateScrollSize();
    });
    window.addEventListener('resize', this.calculateScrollSize);
  },
  activated() {
    this.$nextTick(() => {
      this.calculateScrollSize();
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calculateScrollSize);
    this.destroySearchBarObserver();
  },
  watch: {
    dataList: {
      handler() {
        this.$nextTick(() => {
          this.calculateScrollSize();
        });
      }
    }
  },
  methods: {
    initSearchBarObserver() {
      const searchBarEl = this.$refs.searchBarRef?.$el;
      if (!searchBarEl) return;

      this.destroySearchBarObserver();

      this.searchBarResizeObserver = new ResizeObserver(() => {
        if (this.calculateTimer) {
          clearTimeout(this.calculateTimer);
        }
        this.calculateTimer = setTimeout(() => {
          this.$nextTick(() => {
            this.calculateScrollSize();
          });
        }, 50);
      });

      this.searchBarResizeObserver.observe(searchBarEl);
    },

    destroySearchBarObserver() {
      if (this.searchBarResizeObserver) {
        this.searchBarResizeObserver.disconnect();
        this.searchBarResizeObserver = null;
      }
      if (this.calculateTimer) {
        clearTimeout(this.calculateTimer);
        this.calculateTimer = null;
      }
    },

    calculateScrollSize() {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      this.scrollX = Math.max(1500, viewportWidth * 0.9);

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

      const searchBarEl = this.$refs.searchBarRef?.$el;
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
      this.scrollY = Math.max(minScrollY, viewportHeight - occupiedHeight);
    }
  }
};
